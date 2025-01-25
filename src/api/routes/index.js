import authRoutes from './authRoutes'
import categoryRoutes from './categoryRoutes'
import userRoutes from './userRoutes'
import videoRoutes from './videoRoutes'

export { authRoutes, categoryRoutes, userRoutes, videoRoutes }

// También exportamos un método para configurar todas las rutas
export const setupRoutes = app => {
  app.use('/api/auth', authRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/videos', videoRoutes)
}

export default {
  authRoutes,
  categoryRoutes,
  userRoutes,
  videoRoutes,
  setupRoutes
}
