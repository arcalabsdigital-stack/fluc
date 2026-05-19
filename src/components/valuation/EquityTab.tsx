import { Info } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function EquityTab() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          Participação Societária (Equity)
          <Popover>
            <PopoverTrigger asChild>
              <button className="text-gray-400 hover:text-primary">
                <Info className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 text-sm">
              <p className="font-semibold mb-2">Equity e Quotas</p>
              <p className="text-gray-600">
                Representa a divisão da propriedade da empresa. Em breve você
                poderá distribuir e acompanhar o valor das quotas de cada sócio.
              </p>
            </PopoverContent>
          </Popover>
        </h3>
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
            Estamos integrando os cálculos automáticos de Equity. Em breve você
            poderá distribuir e acompanhar o valor das quotas baseado no
            Valuation do seu negócio.
          </p>
        </div>
      </div>
    </div>
  )
}
