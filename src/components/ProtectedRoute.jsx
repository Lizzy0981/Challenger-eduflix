import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../components/useAuth'
import LoadingComponent from '../components/LoadingComponent'

function ProtectedRoute({ children, requiredRole = null }) {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingComponent message="Verificando acceso..." />
  }

  if (!isAuthenticated) {
    // Guardar la ruta a la que intentaba acceder
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole && (!user.roles || !user.roles.includes(requiredRole))) {
    // El usuario no tiene el rol requerido
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
