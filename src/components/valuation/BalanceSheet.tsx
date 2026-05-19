import { Info } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function BalanceSheet() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Ativos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Ativos
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-gray-400 hover:text-primary transition-colors print:hidden">
                  <Info className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <p className="font-semibold mb-2">O que são Ativos?</p>
                <p className="text-gray-600 mb-2">
                  Bens e direitos capazes de gerar benefícios econômicos futuros
                  para a empresa.
                </p>
                <ul className="list-disc pl-4 text-gray-600 space-y-1">
                  <li>
                    <strong>Circulante:</strong> Dinheiro em caixa, contas a
                    receber a curto prazo e estoques.
                  </li>
                  <li>
                    <strong>Não-Circulante:</strong> Imóveis, equipamentos,
                    marcas e investimentos de longo prazo.
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-600">
              Ativo Circulante
            </span>
            <span className="text-sm font-semibold">R$ 0,00</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-600">
              Ativo Não-Circulante
            </span>
            <span className="text-sm font-semibold">R$ 0,00</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold text-gray-900">
              Total de Ativos
            </span>
            <span className="text-sm font-bold text-green-600">R$ 0,00</span>
          </div>
        </div>
      </div>

      {/* Passivos */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Passivos
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-gray-400 hover:text-primary transition-colors print:hidden">
                  <Info className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <p className="font-semibold mb-2">O que são Passivos?</p>
                <p className="text-gray-600 mb-2">
                  Representam as obrigações e dívidas que a empresa tem com
                  terceiros.
                </p>
                <ul className="list-disc pl-4 text-gray-600 space-y-1">
                  <li>
                    <strong>Circulante:</strong> Contas a pagar, impostos,
                    salários e dívidas de curto prazo (até 1 ano).
                  </li>
                  <li>
                    <strong>Não-Circulante:</strong> Financiamentos e
                    empréstimos de longo prazo (mais de 1 ano).
                  </li>
                </ul>
              </PopoverContent>
            </Popover>
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-600">
              Passivo Circulante
            </span>
            <span className="text-sm font-semibold">R$ 0,00</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-600">
              Passivo Não-Circulante
            </span>
            <span className="text-sm font-semibold">R$ 0,00</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm font-bold text-gray-900">
              Total de Passivos
            </span>
            <span className="text-sm font-bold text-red-600">R$ 0,00</span>
          </div>
        </div>
      </div>
    </div>
  )
}
