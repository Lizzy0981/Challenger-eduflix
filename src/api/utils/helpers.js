import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import config from '../config/config'

// Funciones de manejo de fechas
export const formatDate = (date) => {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const calculateTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + ' años'

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + ' meses'

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + ' días'

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + ' horas'

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + ' minutos'

  return Math.floor(seconds) + ' segundos'
}

// Funciones de formateo
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) return `${remainingMinutes} min`
  return `${hours}h ${remainingMinutes}min`
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Funciones de seguridad
export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn })
}

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret)
  } catch (error) {
    return null
  }
}

export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex')
}

export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Funciones de manejo de errores
export const handleAsyncError = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

export const createSuccessResponse = (data, message = 'Operación exitosa') => {
  return {
    success: true,
    message,
    data
  }
}

// Funciones de paginación
export const getPaginationData = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit
  return {
    skip,
    limit: parseInt(limit)
  }
}

export const createPaginationResponse = (data, totalItems, page, limit) => {
  return {
    items: data,
    pagination: {
      totalItems,
      currentPage: parseInt(page),
      pageSize: parseInt(limit),
      totalPages: Math.ceil(totalItems / limit)
    }
  }
}

// Funciones de sanitización
export const sanitizeHTML = (html) => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

// Funciones de cache
export const generateCacheKey = (...args) => {
  return args.join(':')
}

export const parseQueryFilters = (query) => {
  const filters = {}
  const validFields = ['categoria', 'nivel', 'duracion', 'instructor']

  validFields.forEach(field => {
    if (query[field]) {
      filters[field] = query[field]
    }
  })

  if (query.search) {
    filters.search = query.search
  }

  return filters
}

// Exportar todas las funciones
export default {
  formatDate,
  calculateTimeAgo,
  formatDuration,
  formatFileSize,
  generateToken,
  verifyToken,
  generateRandomString,
  hashPassword,
  handleAsyncError,
  createSuccessResponse,
  getPaginationData,
  createPaginationResponse,
  sanitizeHTML,
  slugify,
  generateCacheKey,
  parseQueryFilters
}