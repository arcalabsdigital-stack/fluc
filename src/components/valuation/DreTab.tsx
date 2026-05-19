import { useEffect, useState } from 'react'
import { Info, Loader2 } from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { dashboardService } from '@/services/dashboardService'
import { subMonths, isSameMonth } from 'date-fns'

interface MonthData {
  label: string
  date: Date
  receita: number
  despesa: number
  lucro: number
}

const monthNames = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

export function DreTab() {
  const [loading, setLoading] = useState(true)
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([])
  const [totals, setTotals] = useState({ receita: 0, despesa: 0, lucro: 0 })

  useEffect(() => {
    async function load() {
      const end = new Date()
      const start = subMonths(end, 11)
      const txs = await dashboardService.getTransactionsForPeriod(start, end)

      const months: MonthData[] = Array.from({ length: 12 }).map((_, i) => {
        const d = subMonths(end, 11 - i)
        return {
          date: d,
          label: `${monthNames[d.getMonth()]}/${d.getFullYear().toString().slice(2)}`,
          receita: 0,
          despesa: 0,
          lucro: 0,
        }
      })

      let totRec = 0,
        totDes = 0

      txs.forEach((t) => {
        const m = months.find((x) => isSameMonth(x.date, t.data))
        if (m) {
          if (t.tipo_id === 'Receita') {
            m.receita += t.valor
            totRec += t.valor
          }
          if (t.tipo_id === 'Despesa') {
            m.despesa += t.valor
            totDes += t.valor
          }
          m.lucro = m.receita - m.despesa
        }
      })

      setMonthlyData(months)
      setTotals({ receita: totRec, despesa: totDes, lucro: totRec - totDes })
      setLoading(false)
    }
    load()
  }, [])

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            Demonstrativo do Resultado do Exercício (DRE) - Últimos 12 Meses
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-gray-400 hover:text-primary print:hidden">
                  <Info className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 text-sm">
                <p className="font-semibold mb-2">O que é o DRE?</p>
                <p className="text-gray-600">
                  Resumo financeiro de todas as receitas e despesas registradas
                  da empresa no período, evidenciando o Lucro Líquido / EBITDA.
                </p>
              </PopoverContent>
            </Popover>
          </h3>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <tr>
                <th className="p-4 font-semibold min-w-[200px]">Métrica</th>
                {monthlyData.map((m) => (
                  <th
                    key={m.label}
                    className="p-4 font-semibold whitespace-nowrap"
                  >
                    {m.label}
                  </th>
                ))}
                <th className="p-4 font-semibold text-primary whitespace-nowrap">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-50">
                <td className="p-4 font-medium">Receita Bruta</td>
                {monthlyData.map((m, i) => (
                  <td key={i} className="p-4 text-green-600 whitespace-nowrap">
                    {m.receita.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                ))}
                <td className="p-4 font-bold text-green-600 whitespace-nowrap">
                  {totals.receita.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>
              </tr>
              <tr className="border-b border-gray-50 bg-gray-50/50">
                <td className="p-4 font-medium">Despesas Operacionais</td>
                {monthlyData.map((m, i) => (
                  <td key={i} className="p-4 text-red-600 whitespace-nowrap">
                    {m.despesa.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                ))}
                <td className="p-4 font-bold text-red-600 whitespace-nowrap">
                  {totals.despesa.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>
              </tr>
              <tr>
                <td className="p-4 font-bold">Lucro Líquido (EBITDA)</td>
                {monthlyData.map((m, i) => (
                  <td
                    key={i}
                    className={`p-4 font-bold whitespace-nowrap ${m.lucro >= 0 ? 'text-primary' : 'text-red-600'}`}
                  >
                    {m.lucro.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </td>
                ))}
                <td
                  className={`p-4 font-bold whitespace-nowrap ${totals.lucro >= 0 ? 'text-primary' : 'text-red-600'}`}
                >
                  {totals.lucro.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
