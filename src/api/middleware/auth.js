import jwt from 'jsonwebtoken'
import config from '../config/config'
import { createError } from '../utils/errorHandler'
import User from '../models/User'

// Verificar token de autenticación
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      throw createError(401, 'Token no proporcionado')
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret)
      req.user = decoded
      
      // Verificar si el usuario aún existe
      const userExists = await User.exists({ _id: decoded.userId })
      if (!userExists) {
        throw createError(401, 'Usuario no encontrado')
      }

      next()
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw createError(401, 'Token expirado')
      }
      throw createError(401, 'Token inválido')
    }
  } catch (error) {
    next(error)
  }
}

// Verificar rol de usuario
export const verifyRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw createError(401, 'No autenticado')
      }

      const hasRole = Array.isArray(roles) 
        ? roles.includes(req.user.role)
        : req.user.role === roles

      if (!hasRole) {
        throw createError(403, 'No tienes permiso para realizar esta acción')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

// Verificar propiedad del recurso
export const verifyOwnership = (model) => {
  return async (req, res, next) => {
    try {
      const resource = await model.findById(req.params.id)
      
      if (!resource) {
        throw createError(404, 'Recurso no encontrado')
      }

      const isOwner = resource.user?.toString() === req.user.userId ||
                     resource.instructor?.toString() === req.user.userId

      if (!isOwner && req.user.role !== 'admin') {
        throw createError(403, 'No tienes permiso para modificar este recurso')
      }

      req.resource = resource
      next()
    } catch (error) {
      next(error)
    }
  }
}

// Verificar email verificado
export const verifyEmailConfirmed = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
    
    if (!user.isVerified) {
      throw createError(403, 'Por favor verifica tu email para continuar')
    }

    next()
  } catch (error) {
    next(error)
  }
}

// Rate limiting por usuario
export const userRateLimit = (limit, windowMs) => {
  const requests = new Map()

  return (req, res, next) => {
    try {
      const userId = req.user.userId
      const now = Date.now()
      
      const userRequests = requests.get(userId) || []
      const windowStart = now - windowMs

      // Limpiar requests antiguos
      const validRequests = userRequests.filter(time => time > windowStart)
      
      if (validRequests.length >= limit) {
        throw createError(429, 'Demasiadas solicitudes, por favor intenta más tarde')
      }

      validRequests.push(now)
      requests.set(userId, validRequests)

      next()
    } catch (error) {
      next(error)
    }
  }
}

// Verificar token de recuperación de contraseña
export const verifyResetToken = async (req, res, next) => {
  try {
    const { token } = req.params

    if (!token) {
      throw createError(400, 'Token no proporcionado')
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret)
      req.resetToken = decoded
      next()
    } catch (error) {
      throw createError(401, 'Token inválido o expirado')
    }
  } catch (error) {
    next(error)
  }
}

export default {
  verifyToken,
  verifyRole,
  verifyOwnership,
  verifyEmailConfirmed,
  userRateLimit,
  verifyResetToken
}