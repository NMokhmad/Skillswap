import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

type Props = { children: React.ReactNode }

export default function ProtectedRoute({ children }: Props) {
  const { user, isLoading } = useAuthStore()

  if (isLoading) return null

  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}
