import multer from 'multer'
import { S3Client } from '@aws-sdk/client-s3'
import multerS3 from 'multer-s3'
import path from 'path'
import config from '../config/config'
import { createError } from './errorHandler'

// Configuración de S3
const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey
  }
})

// Tipos de archivos permitidos por categoría
const FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  certificate: ['application/pdf']
}

// Función para generar nombre de archivo único
const generateFileName = (file, userId) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = path.extname(file.originalname)
  return `${userId}-${timestamp}-${random}${extension}`
}

// Verificación de tipo de archivo
const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(createError(400, 'Tipo de archivo no permitido'), false)
  }
}

// Configuración base de multer
const multerConfig = {
  limits: {
    fileSize: config.upload.maxSize
  }
}

// Configuración para almacenamiento local (desarrollo)
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    const fileName = generateFileName(file, req.user.userId)
    cb(null, fileName)
  }
})

// Configuración para almacenamiento en S3 (producción)
const s3Storage = multerS3({
  s3,
  bucket: config.aws.bucketName,
  metadata: (req, file, cb) => {
    cb(null, { userId: req.user.userId })
  },
  key: (req, file, cb) => {
    const fileName = generateFileName(file, req.user.userId)
    cb(null, fileName)
  }
})

// Crear instancias de multer según el tipo de archivo y entorno
const createUploader = (types, folder = '') => {
  const storage = config.env === 'production' ? s3Storage : localStorage
  
  return multer({
    ...multerConfig,
    storage,
    fileFilter: fileFilter(types)
  })
}

// Middleware para subida de imágenes
export const uploadImage = createUploader(FILE_TYPES.image, 'images').single('image')

// Middleware para subida de videos
export const uploadVideo = createUploader(FILE_TYPES.video, 'videos').single('video')

// Middleware para subida de documentos
export const uploadDocument = createUploader(FILE_TYPES.document, 'documents').single('document')

// Middleware para subida de certificados
export const uploadCertificate = createUploader(FILE_TYPES.certificate, 'certificates').single('certificate')

// Middleware para subida múltiple de imágenes
export const uploadMultipleImages = createUploader(FILE_TYPES.image, 'images').array('images', 10)

// Función para eliminar archivo de S3
export const deleteFileFromS3 = async (fileKey) => {
  if (config.env !== 'production') return

  try {
    await s3.deleteObject({
      Bucket: config.aws.bucketName,
      Key: fileKey
    })
  } catch (error) {
    console.error('Error al eliminar archivo de S3:', error)
    throw error
  }
}

// Middleware para procesar subida de archivos
export const handleUpload = (uploadType) => {
  return async (req, res, next) => {
    try {
      await new Promise((resolve, reject) => {
        uploadType(req, res, (err) => {
          if (err) reject(err)
          resolve()
        })
      })

      if (!req.file && !req.files) {
        throw createError(400, 'No se ha proporcionado ningún archivo')
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

// Middleware para validar tamaño de imagen
export const validateImageDimensions = (maxWidth, maxHeight) => {
  return async (req, res, next) => {
    if (!req.file) return next()

    try {
      const dimensions = await sharp(req.file.buffer).metadata()

      if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
        throw createError(400, `Las dimensiones de la imagen no deben exceder ${maxWidth}x${maxHeight}`)
      }

      next()
    