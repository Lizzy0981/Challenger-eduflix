import config from '../config/config'

// Creador de errores personalizado
export const createError = (status, message, details = null) => {
  const error = new Error(message)
  error.status = status
  if (details) error.details = details
  return error
}

// Manejador de errores global
export const errorHandler = (err, req, res, next) => {
  console.error(err)

  // Error por defecto
  const error = {
    status: err.status || 500,
    message: err.message || 'Error interno del servidor',
    ...(config.env === 'development' && { stack: err.stack })
  }

  // Manejar errores específicos de MongoDB
  if (err.name === 'ValidationError') {
    error.status = 400
    error.message = 'Error de validación'
    error.details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }))
  }

  if (err.name === 'CastError') {
    error.status = 400
    error.message = 'ID inválido'
  }

  if (err.code === 11000) {
    error.status = 409
    error.message = 'Valor duplicado'
    error.details = {
      field: Object.keys(err.keyPattern)[0],
      value: err.keyValue[Object.keys(err.keyPattern)[0]]
    }
  }

  // Manejar errores de JWT
  if (err.name === 'JsonWebTokenError') {
    error.status = 401
    error.message = 'Token inválido'
  }

  if (err.name === 'TokenExpiredError') {
    error.status = 401
    error.message = 'Token expirado'
  }

  // Manejar errores de multer
  if (err.name === 'MulterError') {
    error.status = 400
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        error.message = 'Archivo demasiado grande'
        break
      case 'LIMIT_FILE_COUNT':
        error.message = 'Demasiados archivos'
        break
      case 'LIMIT_UNEXPECTED_FILE':
        error.message = 'Tipo de archivo no permitido'
        break
      default:
        error.message = 'Error al subir archivo'
    }
  }

  // Añadir ID de error en desarrollo
  if (config.env === 'development') {
    error.errorId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Registrar error en logs
  logError(error)

  // Enviar respuesta
  res.status(error.status).json({
    success: false,
    error: {
      message: error.message,
      ...(error.details && { details: error.details }),
      ...(error.errorId && { errorId: error.errorId })
    }
  })
}

// Manejador de errores de validación
export const validationErrorHandler = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.validateAsync(req.body, {
        abortEarly: false,
        stripUnknown: true
      })
      req.body = validated
      next()
    } catch (err) {
      if (err.isJoi) {
        return next(createError(400, 'Error de validación', {
          details: err.details.map(detail => ({
            field: detail.path[0],
            message: detail.message
          }))
        }))
      }
      next(err)
    }
  }
}

// Manejador de errores asíncronos
export const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Logger de errores
const logError = (error) => {
  // Aquí podrías implementar un logger más sofisticado
  if (config.env === 'development') {
    console.error('=== Error Log ===')
    console.error('Timestamp:', new Date().toISOString())
    console.error('Status:', error.status)
    console.error('Message:', error.message)
    if (error.details) console.error('Details:', error.details)
    if (error.stack) console.error('Stack:', error.stack)
    console.error('================')
  }
}

export default {
  createError,
  errorHandler,
  validationErrorHandler,
  asyncErrorHandler
}