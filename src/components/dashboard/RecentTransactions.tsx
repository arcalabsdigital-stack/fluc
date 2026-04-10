import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Transacao, TipoTransacao } from '@/lib/types'
import { format } from 'date-fns'
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RecentTransactionsProps {
  transactions: Transacao[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="rounded-3xl border-none shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
        <CardTitle className="text-base sm:text-lg font-bold">
          Transações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-auto">
        {transactions.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b-0 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-gray-900 pl-4 sm:pl-6">
                  Descrição
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-900 hidden sm:table-cell">
                  Data
                </TableHead>
                <TableHead className="text-xs font-semibold text-gray-900 text-right pr-4 sm:pr-6">
                  Valor
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id} className="border-b-0 hover:bg-gray-50/50">
                  <TableCell className="pl-4 sm:pl-6 py-2 sm:py-3 max-w-[150px] sm:max-w-none">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div
                        className={cn(
                          'w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0',
                          t.tipo_id === TipoTransacao.Receita
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600',
                        )}
                      >
                        {t.tipo_id === TipoTransacao.Receita ? (
                          <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <ArrowDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                          {t.descricao}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 truncate">
                          {t.forma_pagamento_id}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2 sm:py-3 text-xs text-gray-500 hidden sm:table-cell">
                    {format(t.data, 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell className="text-right pr-4 sm:pr-6 py-2 sm:py-3">
                    <div className="flex flex-col items-end">
                      <span
                        className={cn(
                          'font-bold text-xs sm:text-sm whitespace-nowrap',
                          t.tipo_id === TipoTransacao.Receita
                            ? 'text-green-600'
                            : 'text-gray-900',
                        )}
                      >
                        {t.tipo_id === TipoTransacao.Receita ? '+' : '-'}
                        R$ {t.valor.toLocaleString('pt-BR')}
                      </span>
                      <span className="text-[10px] text-gray-400 sm:hidden">
                        {format(t.data, 'dd/MM')}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-gray-500 text-sm">Nenhuma transação recente.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
