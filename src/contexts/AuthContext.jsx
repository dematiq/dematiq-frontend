import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)
const TOKEN_KEY = 'dematiq_token'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setLoading(false)
      return
    }
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.data) {
          setUser(data.data)
        } else {
          localStorage.removeItem(TOKEN_KEY)
        }
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Credenciales inválidas' }
      }
      localStorage.setItem(TOKEN_KEY, data.data.token)
      setUser(data.data.user)
      return { success: true, user: data.data.user }
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' }
    }
  }, [])

  const register = useCallback(async ({ name, email, password }) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al registrarse' }
      }
      // Registro exitoso pero pendiente verificación - NO guardar token
      // El usuario debe verificar su email primero
      return { success: true, data: data.data }
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' }
    }
  }, [])

  const verifyEmail = useCallback(async ({ email, code }) => {
    try {
      const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Código inválido o expirado' }
      }
      if (data.data?.token) {
        localStorage.setItem(TOKEN_KEY, data.data.token)
        setUser(data.data.user)
      }
      return { success: true, user: data.data?.user }
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' }
    }
  }, [])

  const resendVerificationCode = useCallback(async (email) => {
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || 'Error al reenviar código' }
      }
      return { success: true }
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' }
    }
  }, [])

  const updateProfile = useCallback(async (data) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) return { success: false, error: 'No autenticado' }
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) return { success: false, error: json.error || 'Error al actualizar perfil' }
      setUser((prev) => (prev ? { ...prev, ...json.data } : prev))
      return { success: true }
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' }
    }
  }, [])

  const changePassword = useCallback(async (current, newPass) => {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      if (!token) return { success: false, error: 'No autenticado' }
      const res = await fetch(`${API_URL}/auth/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current, newPass }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error || 'Error al cambiar contraseña' }
      return { success: true }
    } catch {
      return { success: false, error: 'Error de conexión con el servidor' }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, resendVerificationCode, updateProfile, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
