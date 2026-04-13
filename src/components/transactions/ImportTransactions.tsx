import { useState, useRef } from 'react'
import { Download, FileUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import useTransactionStore from '@/stores/useTransactionStore'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'

function parseCSVRow(str: string) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < str.length; i++) {
    const char = str[i]
    if (char === '"' && str[i + 1] === '"') {
      current += '"'
      i++ // skip next quote
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

export function ImportTransactions() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { fetchTransactions } = useTransactionStore()
  const { user } = useAuth()
  const [isImporting, setIsImporting] = useState(false)

  const downloadTemplate = () => {
    const headers = [
      'Data',
      'Descrição',
      'Valor',
      'Categoria',
      'Tipo',
      'Forma de Pagamento',
      'Observações',
    ]
    const example = [
      '20/10/2023',
      'Compra de Material',
      '150.50',
      'Outros',
      'Despesa',
      'Cartão de Crédito',
      'Compra para o escritório',
    ]

    const csvContent = [headers.join(','), example.join(',')].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'modelo_importacao_transacoes.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const text = await file.text()
      const rows = text.split('\n').filter((row) => row.trim().length > 0)

      if (rows.length <= 1) {
        throw new Error('O arquivo está vazio ou contém apenas o cabeçalho.')
      }

      let errorCount = 0
      const transactionsToCreate: any[] = []

      for (let i = 1; i < rows.length; i++) {
        try {
          const values = parseCSVRow(rows[i].trim())
          if (values.length < 6) continue

          const dateStr = values[0]
          const parts = dateStr.includes('/')
            ? dateStr.split('/')
            : dateStr.split('-')
          let date: Date
          if (parts.length === 3) {
            if (parts[2].length === 4) {
              date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T12:00:00`)
            } else if (parts[0].length === 4) {
              date = new Date(`${parts[0]}-${parts[1]}-${parts[2]}T12:00:00`)
            } else {
              date = new Date(dateStr)
            }
          } else {
            date = new Date(dateStr)
          }

          if (isNaN(date.getTime())) throw new Error('Data inválida')

          const description = values[1]
          const amountStr = values[2]
            .replace(/[R$\s]/g, '')
            .replace(/\./g, '')
            .replace(',', '.')
          const amount = parseFloat(amountStr)
          if (isNaN(amount)) throw new Error('Valor inválido')

          const categoryName = values[3].trim()
          const typeStr = values[4].trim()
          const type =
            typeStr.toLowerCase() === 'receita' ? 'Receita' : 'Despesa'

          const paymentMethod = values[5].trim()
          const notes = values[6] || ''

          if (!categoryName) throw new Error('Categoria inválida')

          transactionsToCreate.push({
            date: date.toISOString().split('T')[0],
            description: description,
            amount: amount,
            category: categoryName,
            type: type,
            payment_method: paymentMethod,
            notes: notes,
            user_id: user?.id,
          })
        } catch (err) {
          console.error(`Erro na linha ${i + 1}:`, err)
          errorCount++
        }
      }

      if (transactionsToCreate.length === 0) {
        throw new Error('Nenhuma transação válida encontrada para importar.')
      }

      // Batch requests to prevent overwhelming the server
      const batchSize = 100
      let successCount = 0

      for (let i = 0; i < transactionsToCreate.length; i += batchSize) {
        const batch = transactionsToCreate.slice(i, i + batchSize)
        const { error } = await supabase.from('transactions').insert(batch)

        if (error) {
          errorCount += batch.length
          console.error('Erro ao salvar lote de transações:', error)
        } else {
          successCount += batch.length
        }
      }

      toast({
        title: 'Importação concluída',
        description: `${successCount} transações importadas com sucesso. ${errorCount > 0 ? `${errorCount} falhas.` : ''}`,
        variant: errorCount > 0 ? 'destructive' : 'default',
      })

      if (successCount > 0) {
        fetchTransactions()
      }
    } catch (error: any) {
      toast({
        title: 'Erro na importação',
        description: error.message || 'Verifique o formato do arquivo.',
        variant: 'destructive',
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <Button
        variant="outline"
        className="gap-2 hidden sm:flex text-blue-600 border-blue-200 hover:bg-blue-50"
        onClick={downloadTemplate}
      >
        <Download className="h-4 w-4" />
        Modelo CSV
      </Button>

      <input
        type="file"
        accept=".csv"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <Button
        variant="outline"
        className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
      >
        {isImporting ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
        ) : (
          <FileUp className="h-4 w-4" />
        )}
        Importar CSV
      </Button>
    </>
  )
}
