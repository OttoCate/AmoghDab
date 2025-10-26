import { Navigate } from 'react-router'
import { useZustand } from './zustand'

const PrivateRoute = ({ children }) => {
  const { auth } = useZustand()
  return auth ? <>{children}</> : <Navigate to="/login" />
}

export default PrivateRoute
