import { useAuth } from '@/hooks/use-auth'

export default function Valuation() {
  const { currentWorkspace } = useAuth()

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Valuation
        </h1>
        <p className="text-gray-500">
          Módulo de valuation para {currentWorkspace?.name || 'sua organização'}
          .
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Métricas de Valuation
          </h3>
          <p className="text-sm text-gray-500">
            Acompanhe a estimativa de valor do seu negócio.
          </p>
        </div>
        <div className="p-6">
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Módulo de Valuation em processamento e sendo restaurado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
