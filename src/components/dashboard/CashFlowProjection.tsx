import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ProjectionDataPoint } from '@/hooks/use-dashboard'

interface CashFlowProjectionProps {
  data: ProjectionDataPoint[]
  months: number
  onMonthsChange: (months: number) => void
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function CashFlowProjection({
  data,
  months,
  onMonthsChange,
}: CashFlowProjectionProps) {
  const displayData = data.slice(0, months)

  return (
    <Card className="h-full flex flex-col shadow-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold">
            Projeção de Fluxo de Caixa
          </CardTitle>
          <CardDescription>
            Evolução estimada do seu saldo nos próximos meses
          </CardDescription>
        </div>
        <Select
          value={months.toString()}
          onValueChange={(val) => onMonthsChange(Number(val))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 Meses</SelectItem>
            <SelectItem value="6">6 Meses</SelectItem>
            <SelectItem value="9">9 Meses</SelectItem>
            <SelectItem value="12">12 Meses</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex-1 mt-4 min-h-[300px]">
        {displayData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={displayData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(value) =>
                  `R$ ${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`
                }
                dx={-10}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ProjectionDataPoint
                    return (
                      <div className="bg-background border border-border/50 p-3 rounded-lg shadow-md space-y-2">
                        <p className="font-semibold text-sm mb-2">
                          {data.month}
                        </p>
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Saldo Previsto:
                          </span>
                          <span className="font-medium text-foreground">
                            {formatCurrency(data.balance)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Receitas:
                          </span>
                          <span className="font-medium text-green-500">
                            {formatCurrency(data.expectedIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4 text-sm">
                          <span className="text-muted-foreground">
                            Despesas:
                          </span>
                          <span className="font-medium text-red-500">
                            {formatCurrency(data.expectedExpense)}
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorBalance)"
                activeDot={{
                  r: 6,
                  strokeWidth: 0,
                  fill: 'hsl(var(--primary))',
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            Nenhum dado disponível para projeção
          </div>
        )}
      </CardContent>
    </Card>
  )
}
