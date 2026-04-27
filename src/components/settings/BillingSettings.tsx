import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCard, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'

export function BillingSettings() {
  const { currentWorkspace, subscription } = useAuth()

  const handleSimulatePayment = async () => {
    if (!subscription) return
    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .eq('id', subscription.id)

      if (error) throw error
      toast.success('Pagamento processado com sucesso! Assinatura ativada.')
      window.location.reload()
    } catch (e: any) {
      toast.error('Erro ao processar pagamento.')
    }
  }

  const isExpired =
    subscription?.status === 'canceled' ||
    subscription?.status === 'past_due' ||
    (subscription?.status === 'trial' &&
      new Date(subscription.trial_end) < new Date())

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="bg-white pb-4 border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="w-5 h-5 text-primary" />
            Detalhes da Assinatura
          </CardTitle>
          <CardDescription>
            Gerencie seu plano e histórico de pagamentos do workspace{' '}
            <strong>{currentWorkspace?.name}</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-gray-100 rounded-xl bg-gray-50/50 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Plano Atual
              </p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">
                  {subscription?.plan || 'Fluxo'}
                </span>
                <Badge
                  variant={isExpired ? 'destructive' : 'default'}
                  className={
                    !isExpired
                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                      : ''
                  }
                >
                  {subscription?.status === 'trial'
                    ? 'Período de Teste'
                    : subscription?.status === 'active'
                      ? 'Ativo'
                      : 'Vencido'}
                </Badge>
              </div>
              {subscription?.status === 'trial' && (
                <p className="text-sm text-gray-500 mt-2">
                  Seu período de teste termina em{' '}
                  <span className="font-medium text-gray-700">
                    {new Date(subscription.trial_end).toLocaleDateString(
                      'pt-BR',
                    )}
                  </span>
                </p>
              )}
              {subscription?.status === 'active' &&
                subscription.current_period_end && (
                  <p className="text-sm text-gray-500 mt-2">
                    Próxima renovação:{' '}
                    <span className="font-medium text-gray-700">
                      {new Date(
                        subscription.current_period_end,
                      ).toLocaleDateString('pt-BR')}
                    </span>
                  </p>
                )}
            </div>

            <div className="flex flex-col gap-2 min-w-[200px]">
              <Button
                onClick={handleSimulatePayment}
                className="w-full shadow-sm"
                variant={isExpired ? 'default' : 'outline'}
              >
                {isExpired
                  ? 'Regularizar Pagamento'
                  : 'Fazer Upgrade / Renovar'}
              </Button>
            </div>
          </div>

          {isExpired && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-red-900">
                  Sua assinatura está inativa
                </h4>
                <p className="text-sm mt-1 text-red-700">
                  O acesso às funcionalidades do sistema está restrito. Por
                  favor, regularize sua situação via Asaas para continuar usando
                  o Fluc.
                </p>
              </div>
            </div>
          )}

          <div className="pt-4">
            <h3 className="font-semibold text-gray-900 mb-4">
              Histórico de Pagamentos
            </h3>
            <div className="text-center p-10 border rounded-xl border-dashed border-gray-200 bg-gray-50/30">
              <p className="text-gray-500 text-sm">
                Nenhum pagamento registrado neste workspace ainda.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
