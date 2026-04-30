import { useAuth } from '@/hooks/use-auth'

export default function Dre() {
  const { currentWorkspace } = useAuth()

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">DRE</h1>
        <p className="text-gray-500">
          Demonstrativo do Resultado do Exercício para{' '}
          {currentWorkspace?.name || 'sua organização'}.
        </p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Resumo do DRE</h3>
          <p className="text-sm text-gray-500">
            Visão geral de receitas, custos e despesas da sua empresa.
          </p>
        </div>
        <div className="p-6">
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Módulo DRE em processamento e sendo restaurado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
