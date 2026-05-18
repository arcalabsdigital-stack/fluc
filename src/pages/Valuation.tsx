import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Dre from './Dre'

export default function Valuation() {
  const { currentWorkspace } = useAuth()

  return (
    <div className="flex flex-col gap-4 sm:gap-6 animate-fade-in pb-10 px-0 sm:px-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Valuation & Análises
        </h1>
        <p className="text-gray-500">
          Análise financeira detalhada e valuation de{' '}
          {currentWorkspace?.name || 'sua organização'}.
        </p>
      </div>

      <Tabs defaultValue="dre" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="dre">DRE</TabsTrigger>
          <TabsTrigger value="equity">Equity</TabsTrigger>
          <TabsTrigger value="fcd">Fluxo de Caixa Descontado</TabsTrigger>
        </TabsList>

        <TabsContent value="dre" className="animate-fade-in">
          <Dre />
        </TabsContent>

        <TabsContent value="equity" className="animate-fade-in">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Participação Societária (Equity)
              </h3>
              <p className="text-sm text-gray-500">
                Gerencie a estrutura societária e o valor das quotas do seu
                negócio.
              </p>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <span className="text-xl font-bold text-gray-400">EQ</span>
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">
                  Módulo em Desenvolvimento
                </h4>
                <p className="text-sm text-gray-500 max-w-md">
                  Estamos integrando os cálculos automáticos de Equity. Em breve
                  você poderá distribuir e acompanhar o valor das quotas.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="fcd" className="animate-fade-in">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Fluxo de Caixa Descontado (FCD)
              </h3>
              <p className="text-sm text-gray-500">
                Projete os fluxos de caixa futuros e determine o valor presente
                da sua empresa.
              </p>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <span className="text-xl font-bold text-gray-400">FCD</span>
                </div>
                <h4 className="text-base font-semibold text-gray-900 mb-1">
                  Módulo em Desenvolvimento
                </h4>
                <p className="text-sm text-gray-500 max-w-md">
                  O motor de projeção de Fluxo de Caixa Descontado está sendo
                  aprimorado para suportar exportação em PDF.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
