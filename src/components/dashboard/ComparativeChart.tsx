import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer } from '@/components/ui/chart'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { dashboardService } from '@/services/dashboardService'

export function ComparativeChart() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const start = startOfMonth(subMonths(new Date(), 5))
    const end = endOfMonth(new Date())
    try {
      const txs = await dashboardService.getTransactionsForPeriod(start, end)

      const result = []
      for (let i = 5; i >= 0; i--) {
        const targetMonth = subMonths(new Date(), i)
        const mStart = startOfMonth(targetMonth)
        const mEnd = endOfMonth(targetMonth)

        const monthTx = txs.filter((t) => {
          const d = new Date(t.data)
          return d >= mStart && d <= mEnd
        })

        const receitas = monthTx
          .filter((t) => t.tipo_id === 'Receita')
          .reduce((a, b) => a + b.valor, 0)
        const despesas = monthTx
          .filter((t) => t.tipo_id === 'Despesa')
          .reduce((a, b) => a + b.valor, 0)

        result.push({
          month: format(targetMonth, 'MMM', { locale: ptBR }),
          receitas,
          despesas,
          saldo: receitas - despesas,
        })
      }
      setData(result)
    } catch (e) {}
  }

  return (
    <Card className="rounded-3xl border-none shadow-sm h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">
          Evolução Mensal (6 Meses)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px]">
        {data.length > 0 ? (
          <ChartContainer
            config={{
              receitas: { label: 'Receitas', color: 'hsl(var(--primary))' },
              saldo: { label: 'Saldo', color: 'hsl(var(--chart-2))' },
            }}
            className="w-full h-full"
          >
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f0f0f0"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontSize: 10,
                  fill: '#9CA3AF',
                  textTransform: 'capitalize',
                }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#9CA3AF' }}
                tickFormatter={(value) => `R$${value}`}
                width={50}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 rounded-xl shadow-xl border border-gray-100 text-xs font-medium">
                        <p className="font-bold text-gray-700 mb-2 capitalize">
                          {label}
                        </p>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between gap-4 text-green-600">
                            <span>Receitas:</span>
                            <span>
                              R${' '}
                              {Number(
                                payload[0]?.payload.receitas || 0,
                              ).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 text-red-500">
                            <span>Despesas:</span>
                            <span>
                              R${' '}
                              {Number(
                                payload[0]?.payload.despesas || 0,
                              ).toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between gap-4 text-primary font-bold pt-2 border-t mt-1">
                            <span>Saldo:</span>
                            <span>
                              R${' '}
                              {Number(payload[0]?.value || 0).toLocaleString(
                                'pt-BR',
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="saldo"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSaldo)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-gray-400 text-sm">
            Aguardando dados...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
