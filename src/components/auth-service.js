import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_URL = 'https://eduflix-api.onrender.com/auth'

class AuthService {
  constructor() {
    this.token = localStorage.getItem('eduflix_token')
    this.user = JSON.parse(localStorage.getItem('eduflix_user'))
    this.setupInterceptors()
  }

  setAuthHeader() {
    if (this.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }

  async login(email, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password })
      this.token = response.data.token
      this.user = response.data.user
      
      localStorage.setItem('eduflix_token', this.token)
      localStorage.setItem('eduflix_user', JSON.stringify(this.user))
      
      this.setAuthHeader()
      return this.user
    } catch (error) {
      toast.error('Error al iniciar sesión')
      throw error
    }
  }

  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/register`, userData)
      toast.success('Registro exitoso')
      return response.data
    } catch (error) {
      toast.error('Error en el registro')
      throw error
    }
  }

  async logout() {
    try {
      await axios.post(`${API_URL}/logout`)
      this.token = null
      this.user = null
      localStorage.removeItem('eduflix_token')
      localStorage.removeItem('eduflix_user')
      this.setAuthHeader()
      toast.success('Sesión cerrada exitosamente')
    } catch (error) {
      console.error('Error durante el logout:', error)
    }
  }

  async updateProfile(userData) {
    try {
      const response = await axios.put(`${API_URL}/profile`, userData)
      this.user = response.data
      localStorage.setItem('eduflix_user', JSON.stringify(this.user))
      toast.success('Perfil actualizado exitosamente')
      return this.user
    } catch (error) {
      toast.error('Error al actualizar el perfil')
      throw error
    }
  }

  async changePassword(oldPassword, newPassword) {
    try {
      await axios.put(`${API_URL}/change-password`, {
        oldPassword,
        newPassword
      })
      toast.success('Contraseña actualizada exitosamente')
    } catch (error) {
      toast.error('Error al cambiar la contraseña')
      throw error
    }
  }

  async resetPassword(email) {
    try {
      await axios.post(`${API_URL}/reset-password`, { email })
      toast.success('Instrucciones enviadas al correo')
    } catch (error) {
      toast.error('Error al solicitar reinicio de contraseña')
      throw error
    }
  }

  async validateResetToken(token) {
    try {
      return await axios.get(`${API_URL}/reset-password/${token}`)
    } catch (error) {
      toast.error('Token inválido o expirado')
      throw error
    }
  }

  async refreshToken() {
    try {
      const response = await axios.post(`${API_URL}/refresh-token`)
      this.token = response.data.token
      localStorage.setItem('eduflix_token', this.token)
      this.setAuthHeader()
      return this.token
    } catch (error) {
      this.logout()
      throw error
    }
  }

  async verifyEmail(token) {
    try {
      const response = await axios.post(`${API_URL}/verify-email/${token}`)
      toast.success('Email verificado exitosamente')
      return response.data
    } catch (error) {
      toast.error('Error al verificar email')
      throw error
    }
  }

  async resendVerification(email) {
    try {
      await axios.post(`${API_URL}/resend-verification`, { email })
      toast.success('Email de verificación reenviado')
    } catch (error) {
      toast.error('Error al reenviar verificación')
      throw error
    }
  }

  isAuthenticated() {
    return !!this.token && !!this.user
  }

  getUser() {
    return this.user
  }

  getToken() {
    return this.token
  }

  // Interceptor para manejar errores de autenticación
  setupInterceptors() {
    axios.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401) {
          // Si el token expiró, intentar refreshToken
          if (error.response.data.message === 'Token expired') {
            try {
              await this.refreshToken()
              // Reintentar la petición original
              const config = error.config
              return axios(config)
            } catch (refreshError) {
              this.logout()
              window.location.href = '/login'
            }
          } else {
            this.logout()
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }
}

const authService = new AuthService()
authService.setAuthHeader()

export default authService