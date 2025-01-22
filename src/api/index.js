// Datos estáticos y configuración de axios
export { categorias, videos } from './data'
export { default as dataDB } from './dataDB'
export * from './dataDB'

// Servidor y configuración
export { app, server, io } from './server'

// Re-exportar otros módulos
export * from './config'
export * from './controllers'
export * from './middleware'
export * from './models'
export * from './routes'
export * from './services'
export * from './utils'

// Exportación por defecto del servidor completo
export { default } from './server'