import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Search as SearchIcon,
  Receipt,
  Tags,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return

    const fetchResults = async () => {
      setLoading(true)
      const [txRes, catRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .ilike('description', `%${query}%`)
          .order('date', { ascending: false })
          .limit(20),
        supabase
          .from('categories')
          .select('*')
          .ilike('nome', `%${query}%`)
          .limit(20),
      ])
      if (txRes.data) setTransactions(txRes.data)
      if (catRes.data) setCategories(catRes.data)
      setLoading(false)
    }

    fetchResults()
  }, [query])

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Resultados da Busca
          </h2>
          <p className="text-sm text-gray-500">
            Buscando por:{' '}
            <span className="font-semibold text-gray-900">"{query}"</span>
          </p>
        </div>
      </div>

      {!query ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
            <SearchIcon className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-900">
              Nenhum termo pesquisado
            </p>
            <p className="text-sm text-gray-500">
              Digite algo no campo de busca para começar.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">
                Transações ({transactions.length})
              </h3>
            </div>
            {transactions.length === 0 ? (
              <Card className="border-dashed bg-gray-50/50">
                <CardContent className="p-6 text-center text-sm text-gray-500">
                  Nenhuma transação encontrada.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3">
                {transactions.map((tx) => (
                  <Card
                    key={tx.id}
                    className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate('/payments')}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-4 sm:p-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${tx.type === 'Receita' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                          >
                            {tx.type === 'Receita' ? (
                              <ArrowUpCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                            ) : (
                              <ArrowDownCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-1">
                              {tx.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1">
                              <span className="capitalize">
                                {format(
                                  parseISO(tx.date),
                                  "dd 'de' MMM, yyyy",
                                  { locale: ptBR },
                                )}
                              </span>
                              <span>•</span>
                              <span className="truncate max-w-[100px] sm:max-w-none">
                                {tx.category}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p
                            className={`font-bold text-sm sm:text-base ${tx.type === 'Receita' ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {tx.type === 'Receita' ? '+' : '-'}
                            {formatCurrency(tx.amount)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1 capitalize">
                            {tx.payment_method}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Tags className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">
                Categorias ({categories.length})
              </h3>
            </div>
            {categories.length === 0 ? (
              <Card className="border-dashed bg-gray-50/50">
                <CardContent className="p-6 text-center text-sm text-gray-500">
                  Nenhuma categoria encontrada.
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <Card
                    key={cat.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-10 rounded-full ${cat.tipo === 'Receita' ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        <div>
                          <p className="font-medium text-gray-900">
                            {cat.nome}
                          </p>
                          <p className="text-xs text-gray-500">{cat.grupo}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-full ${cat.tipo === 'Receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                      >
                        {cat.tipo}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
