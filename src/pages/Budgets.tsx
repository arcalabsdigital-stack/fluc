import { BudgetsProgress } from '@/components/dashboard/BudgetsProgress'
import { useAuth } from '@/hooks/use-auth'

export default function Budgets() {
  const { currentWorkspace } = useAuth()

  return (
    <div className="flex flex-col gap-4 sm:gap-6 animate-fade-in pb-10 px-0 sm:px-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Orçamentos
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Gerencie limites de gastos mensais para as suas categorias em{' '}
          {currentWorkspace?.name || 'sua organização'}.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[600px]">
          <BudgetsProgress />
        </div>

        <div className="bg-white rounded-3xl p-6 border shadow-sm flex flex-col gap-4">
          <h3 className="text-lg font-bold text-gray-900">Como funciona?</h3>
          <p className="text-sm text-gray-600">
            Os orçamentos permitem que você defina um teto máximo de gastos para
            categorias específicas ao longo de um mês.
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-2">
            <li>Selecione uma categoria de despesa e defina o valor máximo.</li>
            <li>
              O sistema calculará automaticamente o quanto você já gastou
              naquela categoria no mês atual.
            </li>
            <li>Acompanhe a barra de progresso para evitar surpresas.</li>
            <li>
              Ao atingir a meta, a barra indicará que o orçamento foi
              extrapolado.
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
