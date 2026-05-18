import { Info } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export default function Dre() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ativos */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Ativos
              <Popover>
                <PopoverTrigger asChild>
                  <button className="text-gray-400 hover:text-primary transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-80 text-sm">
                  <p className="font-semibold mb-2">O que são Ativos?</p>
                  <p className="text-gray-600 mb-2">
                    São os bens e direitos que a empresa possui, capazes de
                    gerar benefícios econômicos futuros.
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
                  <button className="text-gray-400 hover:text-primary transition-colors">
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Demonstrativo do Resultado do Exercício
          </h3>
          <p className="text-sm text-gray-500">
            Resumo de Receitas, Custos e Despesas no período selecionado.
          </p>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <span className="text-xl font-bold text-gray-400">DRE</span>
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1">
              Cálculo de DRE em processamento
            </h4>
            <p className="text-sm text-gray-500 max-w-md">
              Os dados estão sendo classificados para apresentar sua Receita
              Bruta, Deduções, Receita Líquida, Lucro Bruto e Lucro Líquido do
              Exercício.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
