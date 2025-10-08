import { Navigate } from 'react-router'
import { useAuth } from './zustand'

const PrivateRoute = ({ children }) => {
  const { auth } = useAuth()
  return auth ? <>{children}</> : <Navigate to="/login" />
}

export default PrivateRoute
