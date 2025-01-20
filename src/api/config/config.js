import dotenv from 'dotenv'
dotenv.config()

const config = {
  // Servidor
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  // Base de datos
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/eduflix',
  dbOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key',
    accessExpiration: process.env.JWT_EXPIRATION || '7d',
    refreshExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '30d'
  },

  // AWS S3 para almacenamiento
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    bucketName: process.env.AWS_BUCKET_NAME
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || 'no-reply@eduflix.com'
  },

  // Límites y configuraciones de archivos
  upload: {
    maxSize: process.env.MAX_FILE_SIZE || 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    videoDuration: process.env.MAX_VIDEO_DURATION || 7200 // 2 horas en segundos
  },

  // Cache
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  },

  // Ratelimiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de solicitudes por ventana
  },

  // Websocket
  websocket: {
    port: process.env.WS_PORT || 3001
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filename: process.env.LOG_FILE || 'app.log'
  },

  // Seguridad
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
    sessionSecret: process.env.SESSION_SECRET || 'your-session-secret',
    csrfSecret: process.env.CSRF_SECRET || 'your-csrf-secret'
  }
}

// Validaciones de configuración crítica
const requiredConfigs = [
  'jwt.secret',
  'dbUri'
]

requiredConfigs.forEach(path => {
  const value = path.split('.').reduce((obj, key) => obj[key], config)
  if (!value) {
    throw new Error(`Configuration error: ${path} is required`)
  }
})

export default config