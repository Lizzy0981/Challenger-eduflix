// Exportaciones de auth.js
export { 
    verifyToken,
    verifyRole,
    verifyOwnership,
    verifyEmailConfirmed,
    userRateLimit,
    verifyResetToken
  } from './auth'
  
  // Exportaciones de errorHandler.js
  export {
    createError,
    errorHandler,
    validationErrorHandler,
    asyncErrorHandler
  } from './errorHandler'
  
  // Exportaciones de upload.js
  export {
    uploadImage,
    uploadVideo,
    uploadDocument,
    uploadCertificate,
    uploadMultipleImages,
    deleteFileFromS3,
    handleUpload,
    validateImageDimensions,
    optimizeImage
  } from './upload'