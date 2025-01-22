import Joi from 'joi'
import axios from 'axios'
import { getVideoDurationInSeconds } from 'get-video-duration'

// Esquemas de validación de autenticación
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'El email es obligatorio'
    }),

  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.pattern.base': 'La contraseña debe contener al menos una letra y un número',
      'any.required': 'La contraseña es obligatoria'
    })
})

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email inválido',
      'any.required': 'El email es obligatorio'
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es obligatoria'
    })
})

// Esquemas de validación de videos
export const videoSchema = Joi.object({
  titulo: Joi.string()
    .min(5)
    .max(100)
    .required()
    .messages({
      'string.min': 'El título debe tener al menos 5 caracteres',
      'string.max': 'El título no puede exceder 100 caracteres',
      'any.required': 'El título es obligatorio'
    }),

  linkVideo: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'URL del video inválida',
      'any.required': 'El link del video es obligatorio'
    }),

  linkImage: Joi.string()
    .uri()
    .required()
    .messages({
      'string.uri': 'URL de la imagen inválida',
      'any.required': 'El link de la imagen es obligatoria'
    }),

  categoria: Joi.string()
    .required()
    .messages({
      'any.required': 'La categoría es obligatoria'
    }),

  descripcion: Joi.string()
    .min(20)
    .max(1000)
    .required()
    .messages({
      'string.min': 'La descripción debe tener al menos 20 caracteres',
      'string.max': 'La descripción no puede exceder 1000 caracteres',
      'any.required': 'La descripción es obligatoria'
    }),

  nivel: Joi.string()
    .valid('Principiante', 'Intermedio', 'Avanzado')
    .required()
    .messages({
      'any.only': 'Nivel inválido',
      'any.required': 'El nivel es obligatorio'
    }),

  codigoSeguridad: Joi.string()
    .required()
    .messages({
      'any.required': 'El código de seguridad es obligatorio'
    })
})

// Esquemas de validación de categorías
export const categorySchema = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede exceder 50 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),

  descripcion: Joi.string()
    .min(20)
    .max(500)
    .required()
    .messages({
      'string.min': 'La descripción debe tener al menos 20 caracteres',
      'string.max': 'La descripción no puede exceder 500 caracteres',
      'any.required': 'La descripción es obligatoria'
    }),

  color: Joi.string()
    .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .required()
    .messages({
      'string.pattern.base': 'Color hexadecimal inválido',
      'any.required': 'El color es obligatorio'
    }),

  codigoSeguridad: Joi.string()
    .required()
    .messages({
      'any.required': 'El código de seguridad es obligatorio'
    })
})

// Funciones de validación
export const validateVideoURL = async (url) => {
  try {
    const response = await axios.head(url)
    return response.status === 200 && 
           response.headers['content-type'].includes('video')
  } catch (error) {
    return false
  }
}

export const getVideoDuration = async (url) => {
  try {
    const duration = await getVideoDurationInSeconds(url)
    return Math.round(duration)
  } catch (error) {
    return null
  }
}

export const validateImageURL = async (url) => {
  try {
    const response = await axios.head(url)
    return response.status === 200 && 
           response.headers['content-type'].includes('image')
  } catch (error) {
    return false
  }
}

export const validatePassword = (password) => {
  const minLength = 6
  const hasLetter = /[A-Za-z]/.test(password)
  const hasNumber = /\d/.test(password)
  return password.length >= minLength && hasLetter && hasNumber
}

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Esquemas adicionales
export const noteSchema = Joi.object({
  content: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.min': 'El contenido no puede estar vacío',
      'string.max': 'El contenido no puede exceder 1000 caracteres',
      'any.required': 'El contenido es obligatorio'
    }),

  timestamp: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'El timestamp no puede ser negativo',
      'any.required': 'El timestamp es obligatorio'
    })
})

export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(50),

  currentPassword: Joi.string()
    .min(6)
    .when('newPassword', {
      is: Joi.exist(),
      then: Joi.required()
    }),

  newPassword: Joi.string()
    .min(6)
    .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
})

export default {
  registerSchema,
  loginSchema,
  videoSchema,
  categorySchema,
  noteSchema,
  updateProfileSchema,
  validateVideoURL,
  getVideoDuration,
  validateImageURL,
  validatePassword,
  validateEmail
}