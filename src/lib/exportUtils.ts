import { Transacao } from './types'
import { format } from 'date-fns'

export function exportToCSV(transactions: Transacao[]) {
  const headers = [
    'Data',
    'Descrição',
    'Categoria',
    'Tipo',
    'Valor',
    'Forma de Pagamento',
    'Observações',
  ]
  const rows = transactions.map((t) => [
    format(new Date(t.data), 'dd/MM/yyyy'),
    t.descricao,
    t.categoria_id,
    t.tipo_id,
    t.valor.toString(),
    t.forma_pagamento_id,
    t.observacoes || '',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map((e) => e.map((f) => `"${f.replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute(
    'download',
    `transacoes_${format(new Date(), 'yyyy-MM-dd')}.csv`,
  )
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
