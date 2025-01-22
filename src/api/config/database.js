import mongoose from 'mongoose'
import config from './config'

// Opciones de conexión
const options = {
  ...config.dbOptions,
  autoIndex: config.env === 'development',
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
}

// Evento de conexión exitosa
mongoose.connection.on('connected', () => {
  console.log('MongoDB conectado exitosamente')
})

// Evento de error de conexión
mongoose.connection.on('error', (err) => {
  console.error('Error de conexión MongoDB:', err)
  process.exit(1)
})

// Evento de desconexión
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB desconectado')
})

// Manejo de señales de terminación
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close()
    console.log('Conexión MongoDB cerrada por terminación de la aplicación')
    process.exit(0)
  } catch (err) {
    console.error('Error al cerrar la conexión MongoDB:', err)
    process.exit(1)
  }
})

// Función de conexión
export const connectDB = async () => {
  try {
    await mongoose.connect(config.dbUri, options)

    // Habilitar debugging en desarrollo
    if (config.env === 'development') {
      mongoose.set('debug', true)
    }

    return mongoose.connection
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error)
    process.exit(1)
  }
}

// Función de desconexión
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect()
    console.log('MongoDB desconectado correctamente')
  } catch (error) {
    console.error('Error al desconectar MongoDB:', error)
    process.exit(1)
  }
}

// Función para limpiar la base de datos (solo en desarrollo/testing)
export const clearDB = async () => {
  if (config.env === 'production') {
    throw new Error('No se puede limpiar la base de datos en producción')
  }

  try {
    const collections = mongoose.connection.collections
    for (const key in collections) {
      await collections[key].deleteMany()
    }
  } catch (error) {
    console.error('Error al limpiar la base de datos:', error)
    throw error
  }
}

// Función para verificar el estado de la conexión
export const checkConnection = () => {
  return {
    state: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  }
}

// Exportar la instancia de mongoose para uso en testing
export const getMongoose = () => mongoose

export default {
  connectDB,
  disconnectDB,
  clearDB,
  checkConnection,
  getMongoose
}