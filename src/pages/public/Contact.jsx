import { useState } from 'react'
import { Mail, Phone, MapPin, Building2, User, Send, CheckCircle } from 'lucide-react'
import { quotationsApi } from '../../services/api'
import { useSetting } from '../../hooks/useSetting'

const DEFAULTS = {
  address: 'Jardín de la Alabanza 2049\nJardines del Sol, Querétaro',
  phone: '442 721 4891',
  email: 'ventas@dematiq.com.mx',
  rfc: 'DAU250421V80',
  hoursWeek: '9:00 - 18:00',
  hoursSat: '9:00 - 14:00',
}

function Contact() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { value: address } = useSetting('contact_address', DEFAULTS.address)
  const { value: phone } = useSetting('contact_phone', DEFAULTS.phone)
  const { value: email } = useSetting('contact_email', DEFAULTS.email)
  const { value: rfc } = useSetting('contact_rfc', DEFAULTS.rfc)
  const { value: hoursWeek } = useSetting('contact_hours_week', DEFAULTS.hoursWeek)
  const { value: hoursSat } = useSetting('contact_hours_saturday', DEFAULTS.hoursSat)
  const [form, setForm] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    mensaje: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await quotationsApi.sendContact(form)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Error al enviar el mensaje. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <section className="bg-primary-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-white/40">Contacto</span>
          <h1 className="font-heading text-5xl md:text-6xl font-bold mt-2 uppercase">Hablemos de tu proyecto</h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto">
            Solicita asesoría técnica o cotización para tus proyectos de automatización.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              {sent ? (
                <div className="bg-neutral-50 dark:bg-gray-800 rounded-2xl p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h2 className="font-heading text-2xl font-bold text-black dark:text-white mb-2 uppercase tracking-wide">Mensaje enviado</h2>
                  <p className="text-neutral-500 dark:text-gray-400">Nos pondremos en contacto contigo en las próximas 24 horas.</p>
                  <button
                    onClick={() => { setSent(false); setForm({ nombre: '', empresa: '', email: '', telefono: '', mensaje: '' }) }}
                    className="mt-6 text-sm text-black dark:text-white hover:text-neutral-600 dark:hover:text-gray-400 underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="font-heading text-2xl font-bold text-black dark:text-white mb-1 uppercase tracking-wide">Formulario de contacto</h2>
                  <p className="text-neutral-500 dark:text-gray-400 text-sm mb-8">Todos los campos marcados con * son obligatorios</p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                          Contacto <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-gray-500" />
                          <input
                            type="text"
                            name="nombre"
                            required
                            value={form.nombre}
                            onChange={handleChange}
                            placeholder="ING. JOSE MORENO"
                            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-transparent dark:text-gray-200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                          Empresa <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-gray-500" />
                          <input
                            type="text"
                            name="empresa"
                            required
                            value={form.empresa}
                            onChange={handleChange}
                            placeholder="DEMATIQ AUTOMATIZACION"
                            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-transparent dark:text-gray-200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                          Correo <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-gray-500" />
                          <input
                            type="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            placeholder="ventas@dematiq.com.mx"
                            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-transparent dark:text-gray-200"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                          Teléfono <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 dark:text-gray-500" />
                          <input
                            type="tel"
                            name="telefono"
                            required
                            value={form.telefono}
                            onChange={handleChange}
                            placeholder="442 721 4891"
                            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm bg-transparent dark:text-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1">
                        Mensaje o descripción del proyecto <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="mensaje"
                        required
                        rows={5}
                        value={form.mensaje}
                        onChange={handleChange}
                        placeholder="Describe tu proyecto o las partes que necesitas cotizar..."
                        className="w-full px-4 py-2.5 border border-neutral-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none bg-transparent dark:text-gray-200"
                      />
                    </div>

                    {error && (
                      <p className="text-red-500 text-sm">{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 bg-primary-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {submitting ? 'Enviando...' : 'Enviar mensaje'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="font-heading text-lg font-bold text-black dark:text-white mb-4 uppercase tracking-wide">Información de contacto</h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-black dark:text-white mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">Dirección</p>
                      <p className="text-sm text-neutral-500 dark:text-gray-400">
                        {address.split('\n').map((line, i) => (
                          <span key={i}>{line}{i < address.split('\n').length - 1 && <br />}</span>
                        ))}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-black dark:text-white mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">Teléfono</p>
                      <p className="text-sm text-neutral-500 dark:text-gray-400">{phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-black dark:text-white mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">Correo</p>
                      <p className="text-sm text-neutral-500 dark:text-gray-400">{email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-black dark:text-white mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-black dark:text-white">RFC</p>
                      <p className="text-sm text-neutral-500 dark:text-gray-400">{rfc}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-gray-800 rounded-2xl p-6">
                <h3 className="font-heading text-sm font-bold text-black dark:text-white mb-3 uppercase tracking-wide">Horario</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-gray-400">Lun - Vie</span>
                    <span className="font-medium text-black dark:text-white">{hoursWeek}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 dark:text-gray-400">Sábado</span>
                    <span className="font-medium text-black dark:text-white">{hoursSat}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Contact
