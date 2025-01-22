import express from 'express'
import { 
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  rateVideo,
  updateProgress,
  getRelatedVideos,
  getRecommendations,
  toggleFavorite
} from '../controllers/videoController'
import { verifyToken, verifyRole, verifyOwnership } from '../middleware/auth'
import { validationErrorHandler } from '../middleware/errorHandler'
import { videoSchema } from '../utils/validators'
import { uploadVideo, processUpload } from '../middleware/upload'
import Video from '../models/Video'

const router = express.Router()

// Rutas públicas
router.get('/', getVideos)
router.get('/:id', getVideo)
router.get('/:id/related', getRelatedVideos)

// Rutas protegidas
router.use(verifyToken)

// Rutas de interacción
router.post('/:id/rate', rateVideo)
router.post('/:id/progress', updateProgress)
router.post('/:id/favorite', toggleFavorite)
router.get('/recommendations', getRecommendations)

// Rutas de gestión (requieren rol instructor o admin)
router.use(verifyRole(['instructor', 'admin']))

router.post('/',
  processUpload({
    uploadType: uploadVideo,
    validateDuration: true,
    maxDuration: 7200 // 2 horas
  }),
  validationErrorHandler(videoSchema),
  createVideo
)

router.put('/:id',
  verifyOwnership(Video),
  processUpload({
    uploadType: uploadVideo,
    validateDuration: true,
    maxDuration: 7200
  }),
  validationErrorHandler(videoSchema),
  updateVideo
)

router.delete('/:id',
  verifyOwnership(Video),
  deleteVideo
)

export default router