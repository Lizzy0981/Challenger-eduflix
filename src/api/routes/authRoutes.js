import express from 'express'
import { 
  register, 
  login, 
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getProfile,
  updateProfile 
} from '../controllers/authController'
import { verifyToken } from '../middleware/auth'
import { validationErrorHandler } from '../middleware/errorHandler'
import { registerSchema, loginSchema, resetPasswordSchema } from '../utils/validators'

const router = express.Router()

// Rutas públicas
router.post('/register', validationErrorHandler(registerSchema), register)
router.post('/login', validationErrorHandler(loginSchema), login)
router.get('/verify-email/:token', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password/:token', validationErrorHandler(resetPasswordSchema), resetPassword)
router.post('/refresh-token', refreshToken)

// Rutas protegidas
router.use(verifyToken)
router.post('/logout', logout)
router.get('/profile', getProfile)
router.patch('/profile', updateProfile)

export default router