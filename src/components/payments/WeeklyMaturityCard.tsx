import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { dashboardService } from '@/services/dashboardService'
import { addDays } from 'date-fns'
import { TrendingDown, TrendingUp, CalendarDays } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function WeeklyMaturityCard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ income: 0, expense: 0, count: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const start = new Date()
        const end = addDays(start, 7)
        const txs = await dashboardService.getTransactionsForPeriod(start, end)

        const summary = txs.reduce(
          (acc, curr) => {
            if (curr.status === 'aberto') {
              if (curr.tipo_id === 'Receita') acc.income += curr.valor
              if (curr.tipo_id === 'Despesa') acc.expense += curr.valor
              acc.count++
            }
            return acc
          },
          { income: 0, expense: 0, count: 0 },
        )

        setData(summary)
      } catch (error) {
        console.error('Error fetching weekly maturity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading || data.count === 0) return null

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-none shadow-sm mb-6 rounded-2xl">
      <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Previsões para os próximos 7 dias
            </h3>
            <p className="text-sm text-gray-500">
              Transações em aberto de hoje até{' '}
              {format(addDays(new Date(), 7), "dd 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">A Receber</p>
              <p className="font-bold text-green-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(data.income)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">A Pagar</p>
              <p className="font-bold text-red-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(data.expense)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
