import { useAuth } from '@/hooks/use-auth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { DreTab } from '@/components/valuation/DreTab'
import { BalanceSheet } from '@/components/valuation/BalanceSheet'
import { FcdTab } from '@/components/valuation/FcdTab'
import { EquityTab } from '@/components/valuation/EquityTab'
import { format } from 'date-fns'

export default function Valuation() {
  const { currentWorkspace } = useAuth()

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 animate-fade-in pb-10 px-0 sm:px-0 valuation-container">
      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Valuation & Análises
          </h1>
          <p className="text-gray-500">
            Análise financeira e valuation de{' '}
            {currentWorkspace?.name || 'sua organização'}.
          </p>
        </div>
        <Button onClick={handlePrint} className="gap-2 shrink-0">
          <Download className="w-4 h-4" />
          Exportar Relatório PDF
        </Button>
      </div>

      {/* Screen Tabs */}
      <div className="print:hidden">
        <Tabs defaultValue="dre" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="dre">DRE & Balanço</TabsTrigger>
            <TabsTrigger value="fcd">Fluxo de Caixa Descontado</TabsTrigger>
            <TabsTrigger value="equity">Equity</TabsTrigger>
          </TabsList>

          <TabsContent value="dre" className="animate-fade-in">
            <div className="space-y-6">
              <BalanceSheet />
              <DreTab />
            </div>
          </TabsContent>

          <TabsContent value="fcd" className="animate-fade-in">
            <FcdTab />
          </TabsContent>

          <TabsContent value="equity" className="animate-fade-in">
            <EquityTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* Print Only View */}
      <div className="hidden print:block">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Relatório de Valuation e Desempenho
          </h1>
          <p className="text-gray-600 text-lg">
            Empresa: {currentWorkspace?.name || 'Organização'}
          </p>
          <p className="text-gray-600">
            Data de Emissão: {format(new Date(), 'dd/MM/yyyy')}
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">
              Demonstrações Financeiras
            </h2>
            <div className="space-y-6">
              <BalanceSheet />
              <DreTab />
            </div>
          </div>

          <div
            className="break-before-page pt-8 mt-12"
            style={{ pageBreakBefore: 'always' }}
          >
            <h2 className="text-2xl font-bold mb-4">
              Análise de Fluxo de Caixa Descontado (FCD)
            </h2>
            <FcdTab />
          </div>
        </div>

        <div className="mt-12 pt-4 border-t text-center text-sm text-gray-500">
          <p>Relatório gerado automaticamente por Fluc Gestão Financeira.</p>
          <p>
            Este documento é para fins analíticos e as projeções dependem das
            premissas informadas.
          </p>
        </div>
      </div>
    </div>
  )
}
