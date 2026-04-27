import { useAuth } from '@/hooks/use-auth'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

export const ProtectedRoute = () => {
  const { session, loading, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#F8F9FB]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (profile?.must_change_password && location.pathname !== '/settings') {
    return <Navigate to="/settings" replace />
  }

  const { subscription } = useAuth()
  if (subscription) {
    const isExpired =
      subscription.status === 'canceled' ||
      subscription.status === 'past_due' ||
      (subscription.status === 'trial' &&
        new Date(subscription.trial_end) < new Date())
    if (isExpired && location.pathname !== '/settings') {
      return <Navigate to="/settings?tab=billing" replace />
    }
  }

  return <Outlet />
}
