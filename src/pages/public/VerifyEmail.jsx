import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { CheckCircle, AlertCircle, Mail, Clock } from 'lucide-react'

function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { verifyEmail, resendVerificationCode } = useAuth()
  const toast = useToast()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const inputsRef = useRef([])

  // Get email from state (passed from Register) or query param
  useEffect(() => {
    const stateEmail = location.state?.email
    const queryEmail = new URLSearchParams(location.search).get('email')
    setEmail(stateEmail || queryEmail || '')
  }, [location])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [countdown])

  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value) || value.length > 1) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
    setError('')
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
    setCode(newCode)
    inputsRef.current[newCode.findIndex((c) => c === '') || 5]?.focus()
    setError('')
  }

  const fullCode = code.join('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (fullCode.length !== 6) {
      setError('Ingresa el código de 6 dígitos')
      return
    }
    if (!email) {
      setError('Email no encontrado. Regístrate de nuevo.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const result = await verifyEmail({ email, code: fullCode })
      if (result.success) {
        setSuccess(true)
        toast.success('Cuenta verificada. Redirigiendo...')
        setTimeout(() => navigate('/'), 1500)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message || 'Código inválido o expirado')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (!email) return
    setResending(true)
    try {
      const result = await resendVerificationCode(email)
      if (result.success) {
        toast.success('Código reenviado')
        setCountdown(60)
      } else {
        toast.error(result.error)
      }
    } catch (err) {
      toast.error(err.message || 'Error al reenviar')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden p-8 md:p-12">
        {success ? (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="font-heading text-2xl font-bold text-black uppercase tracking-wide mb-2">
              ¡Cuenta verificada!
            </h1>
            <p className="text-neutral-500 text-sm">Redirigiendo al catálogo...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <Mail className="w-12 h-12 text-primary-500 mx-auto mb-3" />
              <h1 className="font-heading text-2xl font-bold text-black uppercase tracking-wide mb-2">
                Verifica tu correo
              </h1>
              <p className="text-neutral-500 text-sm">
                Hemos enviado un código de 6 dígitos a
                <br />
                <span className="font-medium text-black">{email}</span>
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex justify-center gap-2" role="group" aria-label="Código de verificación">
                {code.map((_, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputsRef.current[i] = el)}
                    type="text"
                    maxLength={1}
                    value={code[i]}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    className="w-10 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-neutral-50 dark:bg-gray-800 text-black dark:text-white border-neutral-200 dark:border-gray-600"
                    aria-label={`Dígito ${i + 1} del código`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={submitting || fullCode.length !== 6}
                className="w-full bg-primary-500 text-white py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Verificando...' : 'Verificar código'}
              </button>

              <div className="text-center space-y-2 text-sm">
                <p className="text-neutral-500">¿No recibiste el código?</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || countdown > 0}
                  className="text-primary-500 hover:text-primary-600 font-medium underline underline-offset-2 disabled:text-neutral-400 disabled:cursor-not-allowed"
                >
                  {countdown > 0
                    ? `Reenviar en ${countdown}s (${Clock})`
                    : 'Reenviar código'}
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-sm text-neutral-500">
              ¿No te registraste?{' '}
              <Link to="/iniciar-sesion" className="text-primary-500 hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default VerifyEmail