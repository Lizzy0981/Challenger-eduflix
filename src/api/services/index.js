import { default as authService } from './auth-service'
import { categoryService } from './categoryService'
import { generatePDF, generateRecommendations } from './libraryServices'
import { notificationService } from './notificationService'
import { userService } from './userService'
import { videoService } from './videoService'

export {
  authService,
  categoryService,
  generatePDF,
  generateRecommendations,
  notificationService,
  userService,
  videoService
}

export default {
  authService,
  categoryService,
  generatePDF,
  generateRecommendations,
  notificationService,
  userService,
  videoService
}
