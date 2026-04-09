import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Plus, Target } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import useTransactionStore from '@/stores/useTransactionStore'
import { dashboardService } from '@/services/dashboardService'

export function BudgetsProgress() {
  const [budgets, setBudgets] = useState<any[]>([])
  const [expensesByCategory, setExpensesByCategory] = useState<
    Record<string, number>
  >({})
  const { categories } = useTransactionStore()

  const [isOpen, setIsOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [amount, setAmount] = useState('')

  const currentMonth = format(new Date(), 'yyyy-MM')

  useEffect(() => {
    fetchBudgets()
    fetchExpenses()
  }, [])

  const fetchBudgets = async () => {
    const { data } = await supabase
      .from('budgets')
      .select('*')
      .eq('month', currentMonth)
    if (data) setBudgets(data)
  }

  const fetchExpenses = async () => {
    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    try {
      const txs = await dashboardService.getTransactionsForPeriod(start, end)
      const expenses = txs.filter((t) => t.tipo_id === 'Despesa')
      const grouped = expenses.reduce(
        (acc, curr) => {
          acc[curr.categoria_id] = (acc[curr.categoria_id] || 0) + curr.valor
          return acc
        },
        {} as Record<string, number>,
      )
      setExpensesByCategory(grouped)
    } catch (e) {
      console.error('Error fetching expenses:', e)
    }
  }

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory || !amount) return

    try {
      const existing = budgets.find((b) => b.category === selectedCategory)
      if (existing) {
        await supabase
          .from('budgets')
          .update({ amount: Number(amount) })
          .eq('id', existing.id)
      } else {
        await supabase.from('budgets').insert({
          category: selectedCategory,
          amount: Number(amount),
          month: currentMonth,
        })
      }
      toast.success('Orçamento salvo com sucesso!')
      setIsOpen(false)
      setSelectedCategory('')
      setAmount('')
      fetchBudgets()
    } catch (error) {
      toast.error('Erro ao salvar orçamento')
    }
  }

  const expenseCategories = categories.filter((c) => c.tipo === 'Despesa')

  return (
    <Card className="rounded-3xl border-none shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Orçamentos do Mês
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-primary"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Plus className="w-4 h-4" /> Novo
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-4 pr-2">
        {isOpen && (
          <form
            onSubmit={handleSaveBudget}
            className="bg-gray-50 p-4 rounded-xl space-y-3 mb-4 border border-gray-100 animate-fade-in-down"
          >
            <div>
              <label className="text-xs font-medium text-gray-700">
                Categoria
              </label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Selecione...
                </option>
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700">
                Limite (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 500.00"
                required
                className="h-9 bg-white"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm">
                Salvar
              </Button>
            </div>
          </form>
        )}

        {budgets.length === 0 && !isOpen ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Nenhum orçamento definido para este mês.
          </div>
        ) : (
          budgets.map((budget) => {
            const spent = expensesByCategory[budget.category] || 0
            const percentage = Math.min(
              Math.round((spent / budget.amount) * 100),
              100,
            )
            const isOverBudget = spent > budget.amount
            const categoryName =
              categories.find((c) => c.id === budget.category)?.nome ||
              'Desconhecida'

            return (
              <div key={budget.id} className="space-y-1.5 animate-fade-in">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700">
                    {categoryName}
                  </span>
                  <span className="text-xs text-gray-500">
                    <span
                      className={
                        isOverBudget
                          ? 'text-red-500 font-bold'
                          : 'text-gray-900 font-medium'
                      }
                    >
                      R$ {spent.toLocaleString('pt-BR')}
                    </span>
                    {' / '}R$ {budget.amount.toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-400' : 'bg-primary'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
