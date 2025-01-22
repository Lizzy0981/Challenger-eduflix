import express from 'express'
import {
  getUserProfile,
  updateProfile,
  getFavorites,
  getWatchHistory,
  clearWatchHistory,
  getUserStats,
  generateCertificate,
  getProgress,
  updateNotes
} from '@api/controllers/userController'
import { 
  verifyToken, 
  verifyEmailConfirmed,
  validationErrorHandler,
  processUpload 
} from '@api/middleware'
import { 
  updateProfileSchema, 
  noteSchema 
} from '@api/utils/validators'

const router = express.Router()

// Todas las rutas requieren autenticación
router.use(verifyToken)

// Perfil de usuario
router.get('/profile', getUserProfile)
router.patch('/profile',
  processUpload({
    uploadType: 'image',
    validateDimensions: true,
    maxWidth: 1024,
    maxHeight: 1024,
    optimize: true
  }),
  validationErrorHandler(updateProfileSchema),
  updateProfile
)

// Biblioteca y progreso
router.get('/favorites', getFavorites)
router.get('/history', getWatchHistory)
router.delete('/history', clearWatchHistory)
router.get('/stats', getUserStats)

// Certificados (requiere email verificado)
router.use('/certificates', verifyEmailConfirmed)
router.post('/certificates/:videoId', generateCertificate)

// Progreso y notas
router.get('/progress/:videoId', getProgress)
router.post('/progress/:videoId/notes',
  validationErrorHandler(noteSchema),
  updateNotes
)

export default router