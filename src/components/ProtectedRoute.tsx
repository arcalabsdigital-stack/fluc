import { useAuth } from '@/hooks/use-auth'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { toast } from 'sonner'

export const ProtectedRoute = () => {
  const { session, loading, profile, subscription } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (subscription) {
      const isExpired =
        subscription.status === 'canceled' ||
        subscription.status === 'past_due' ||
        (subscription.status === 'trial' &&
          new Date(subscription.trial_end) < new Date())

      if (isExpired && location.pathname !== '/settings') {
        toast.error(
          'Seu plano está inativo. Regularize sua situação para continuar.',
        )
      }
    }
  }, [subscription, location.pathname])

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

  const needsOnboarding = profile && !profile.cnpj_ou_cpf

  if (needsOnboarding && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  if (!needsOnboarding && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />
  }

  if (
    profile?.must_change_password &&
    location.pathname !== '/settings' &&
    location.pathname !== '/onboarding'
  ) {
    return <Navigate to="/settings" replace />
  }

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
