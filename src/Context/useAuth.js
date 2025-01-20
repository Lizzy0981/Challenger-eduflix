import { useState, useEffect, createContext, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import authService from '@/services/authService'
import { toast } from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = authService.getUser()
      if (currentUser) {
        setUser(currentUser)
      }
    } catch (err) {
      setError(err)
      toast.error('Error al verificar la autenticación')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const user = await authService.login(email, password)
      setUser(user)
      toast.success('¡Bienvenido de nuevo!')
      return user
    } catch (err) {
      setError(err)
      toast.error('Error al iniciar sesión')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const result = await authService.register(userData)
      toast.success('Registro exitoso. Por favor, verifica tu email.')
      return result
    } catch (err) {
      setError(err)
      toast.error('Error en el registro')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      toast.success('Sesión cerrada exitosamente')
      navigate('/login')
    } catch (err) {
      setError(err)
      toast.error('Error al cerrar sesión')
    }
  }

  const updateProfile = async (userData) => {
    try {
      setLoading(true)
      const updatedUser = await authService.updateProfile(userData)
      setUser(updatedUser)
      toast.success('Perfil actualizado exitosamente')
      return updatedUser
    } catch (err) {
      setError(err)
      toast.error('Error al actualizar el perfil')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (oldPassword, newPassword) => {
    try {
      setLoading(true)
      await authService.changePassword(oldPassword, newPassword)
      toast.success('Contraseña actualizada exitosamente')
    } catch (err) {
      setError(err)
      toast.error('Error al cambiar la contraseña')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email) => {
    try {
      setLoading(true)
      await authService.resetPassword(email)
      toast.success('Instrucciones enviadas al correo')
    } catch (err) {
      setError(err)
      toast.error('Error al solicitar reinicio de contraseña')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (token) => {
    try {
      setLoading(true)
      const result = await authService.verifyEmail(token)
      toast.success('Email verificado exitosamente')
      return result
    } catch (err) {
      setError(err)
      toast.error('Error al verificar email')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async (email) => {
    try {
      setLoading(true)
      await authService.resendVerification(email)
      toast.success('Email de verificación reenviado')
    } catch (err) {
      setError(err)
      toast.error('Error al reenviar verificación')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider')
  }
  return context
}

export function useRequireAuth(redirectUrl = '/login') {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(redirectUrl, {
        state: { from: location.pathname },
        replace: true
      })
    }
  }, [isAuthenticated, loading, redirectUrl, location, navigate])

  return { isAuthenticated, loading }
}

export default AuthProvider