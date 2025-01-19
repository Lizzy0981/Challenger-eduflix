import express from 'express'
import http from 'http'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { Server as WebSocketServer } from 'socket.io'
import rateLimit from 'express-rate-limit'
import path from 'path'

// Importaciones propias
import config from './config/config'
import { connectDB } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import authRoutes from './routes/authRoutes'
import videoRoutes from './routes/videoRoutes'
import categoryRoutes from './routes/categoryRoutes'
import userRoutes from './routes/userRoutes'

// Inicialización
const app = express()
const server = http.createServer(app)
const io = new WebSocketServer(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST']
  }
})

// Configuración de middlewares
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}))
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan(config.env === 'development' ? 'dev' : 'combined'))

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde'
})
app.use('/api', limiter)

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Rutas API
app.use('/api/auth', authRoutes)
app.use('/api/videos', videoRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/users', userRoutes)

// Ruta de estado de la API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API funcionando correctamente',
    timestamp: new Date(),
    environment: config.env
  })
})

// Manejador de rutas no encontradas
app.use((req, res, next) => {
  const error = new Error('Ruta no encontrada')
  error.status = 404
  next(error)
})

// Manejador de errores
app.use(errorHandler)

// Configuración de WebSocket
io.on('connection', (socket) => {
  console.log('Cliente WebSocket conectado')

  socket.on('join-video', (videoId) => {
    socket.join(`video-${videoId}`)
  })

  socket.on('leave-video', (videoId) => {
    socket.leave(`video-${videoId}`)
  })

  socket.on('video-progress', (data) => {
    socket.to(`video-${data.videoId}`).emit('user-progress', {
      userId: socket.userId,
      progress: data.progress
    })
  })

  socket.on('disconnect', () => {
    console.log('Cliente WebSocket desconectado')
  })
})

// Iniciar servidor
const startServer = async () => {
  try {
    // Conectar a la base de datos
    await connectDB()
    console.log('Conexión a la base de datos establecida')

    // Iniciar servidor HTTP
    const port = config.port
    server.listen(port, () => {
      console.log(`Servidor corriendo en el puerto ${port}`)
      console.log(`Ambiente: ${config.env}`)
      console.log(`URL de la API: ${config.apiUrl}`)
    })

    // Manejo de errores del servidor
    server.on('error', (error) => {
      console.error('Error en el servidor:', error)
      process.exit(1)
    })

    // Manejo de señales de terminación
    const gracefulShutdown = async () => {
      console.log('Iniciando apagado graceful...')
      
      // Cerrar servidor HTTP
      server.close(() => {
        console.log('Servidor HTTP cerrado')
        
        // Desconectar WebSocket
        io.close(() => {
          console.log('Servidor WebSocket cerrado')
          
          // Cerrar conexión a base de datos
          mongoose.connection.close(false, () => {
            console.log('Conexión a la base de datos cerrada')
            process.exit(0)
          })
        })
      })

      // Si el servidor no se cierra en 10 segundos, forzar cierre
      setTimeout(() => {
        console.error('No se pudo cerrar limpiamente, forzando salida')
        process.exit(1)
      }, 10000)
    }

    process.on('SIGTERM', gracefulShutdown)
    process.on('SIGINT', gracefulShutdown)

  } catch (error) {
    console.error('Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

// Exportar para testing
export { app, server, io }

// Iniciar servidor si no estamos en modo test
if (config.env !== 'test') {
  startServer()
}