// Cache
export { cache } from './cache'

// Email
export { 
  sendVerificationEmail, 
  sendPasswordResetEmail 
} from './emailService'

// Helpers
export {
  formatDate,
  calculateTimeAgo,
  formatDuration,
  formatFileSize,
  generateToken,
  verifyToken,
  generateRandomString,
  hashPassword,
  comparePasswords,
  handleAsyncError,
  createSuccessResponse,
  getPaginationData,
  createPaginationResponse,
  sanitizeHTML,
  slugify,
  generateCacheKey,
  parseQueryFilters
} from './helpers'

// PDF Generator
export { generatePDF } from './pdfGenerator'

// S3
export { 
  uploadToS3, 
  deleteFromS3 
} from './s3'

// Validators
export {
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
} from './validators'

// También exportamos un objeto con todas las utilidades
export default {
  cache,
  email: {
    sendVerificationEmail,
    sendPasswordResetEmail
  },
  pdf: {
    generatePDF
  },
  s3: {
    uploadToS3,
    deleteFromS3
  },
  validators: {
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
  },
  helpers: {
    formatDate,
    calculateTimeAgo,
    formatDuration,
    formatFileSize,
    generateToken,
    verifyToken,
    generateRandomString,
    hashPassword,
    comparePasswords,
    handleAsyncError,
    createSuccessResponse,
    getPaginationData,
    createPaginationResponse,
    sanitizeHTML,
    slugify,
    generateCacheKey,
    parseQueryFilters
  }
}