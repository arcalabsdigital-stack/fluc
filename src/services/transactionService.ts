import { supabase } from '@/lib/supabase/client'
import { FilterState } from '@/components/transactions/TransactionFilters'
import { Transacao, TipoTransacao, FormaPagamento, Role } from '@/lib/types'
import { format, addMonths } from 'date-fns'

// Helper to map DB row to Transacao type
const mapToTransacao = (row: any): Transacao => ({
  id: row.id,
  data: new Date(row.date),
  descricao: row.description,
  valor: Number(row.amount),
  categoria_id: row.category,
  tipo_id: row.type as TipoTransacao,
  forma_pagamento_id: row.payment_method as FormaPagamento,
  observacoes: row.notes,
  recurring_transaction_id: row.recurring_transaction_id,
  is_recurring: !!row.recurring_transaction_id,
})

// Helper to map Transacao to DB row
const mapToRow = (transaction: Omit<Transacao, 'id'>, userId: string) => ({
  user_id: userId,
  date: format(transaction.data, 'yyyy-MM-dd'),
  description: transaction.descricao,
  amount: transaction.valor,
  category: transaction.categoria_id,
  type: transaction.tipo_id,
  payment_method: transaction.forma_pagamento_id,
  notes: transaction.observacoes,
  recurring_transaction_id: transaction.recurring_transaction_id,
})

export const transactionService = {
  async fetchTransactions(filters: FilterState, role: Role) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Initial query
    let query = supabase.from('transactions').select('*')

    // Apply filters based on Role and FilterState
    if (role === 'visitante') {
      // Visitor should not see anything (RLS handles this too, but explicit return saves a call)
      return []
    }

    if (role === 'colaborador') {
      // Collaborator restricted view: Single most recent transaction.
      // RLS enforces this, but we explicitly order and limit to match application logic expectations.
      // We add ID sort to ensure deterministic behavior matching the RLS policy.
      query = query
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(1)
    }

    if (role === 'admin') {
      // Admin sees all, applies filters
      if (filters.search) {
        query = query.ilike('description', `%${filters.search}%`)
      }

      if (filters.type !== 'all') {
        query = query.eq('type', filters.type)
      }

      if (filters.category !== 'all') {
        query = query.eq('category', filters.category)
      }

      if (filters.paymentMethod !== 'all') {
        query = query.eq('payment_method', filters.paymentMethod)
      }

      if (filters.dateRange?.from) {
        query = query.gte('date', format(filters.dateRange.from, 'yyyy-MM-dd'))
        if (filters.dateRange.to) {
          query = query.lte('date', format(filters.dateRange.to, 'yyyy-MM-dd'))
        }
      }

      // Default sort by date desc for full list
      query = query.order('date', { ascending: false })
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching transactions:', error)
      throw error
    }

    return data.map(mapToTransacao)
  },

  async createTransaction(transaction: Omit<Transacao, 'id'>) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    let recurringId = null

    if (transaction.is_recurring) {
      const nextDate = addMonths(transaction.data, 1)

      const { data: recData, error: recError } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: user.id,
          description: transaction.descricao,
          amount: transaction.valor,
          category: transaction.categoria_id,
          type: transaction.tipo_id,
          payment_method: transaction.forma_pagamento_id,
          frequency: 'monthly',
          start_date: format(transaction.data, 'yyyy-MM-dd'),
          next_date: format(nextDate, 'yyyy-MM-dd'),
          notes: transaction.observacoes,
        })
        .select()
        .single()

      if (recError) throw recError
      recurringId = recData.id
    }

    const dbRow = {
      ...mapToRow(transaction, user.id),
      recurring_transaction_id: recurringId,
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(dbRow)
      .select()
      .single()

    if (error) throw error
    return mapToTransacao(data)
  },

  async updateTransaction(id: string, transaction: Partial<Transacao>) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: existingTx, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError) throw fetchError

    let recurringId = existingTx.recurring_transaction_id
    const isCurrentlyRecurring = !!recurringId

    if (transaction.is_recurring !== undefined) {
      const wantsToBeRecurring = transaction.is_recurring

      if (wantsToBeRecurring && !isCurrentlyRecurring) {
        const startDate = transaction.data || new Date(existingTx.date)
        const nextDate = addMonths(startDate, 1)

        const { data: recData, error: recError } = await supabase
          .from('recurring_transactions')
          .insert({
            user_id: user.id,
            description: transaction.descricao || existingTx.description,
            amount: transaction.valor || existingTx.amount,
            category: transaction.categoria_id || existingTx.category,
            type: transaction.tipo_id || existingTx.type,
            payment_method:
              transaction.forma_pagamento_id || existingTx.payment_method,
            frequency: 'monthly',
            start_date: format(startDate, 'yyyy-MM-dd'),
            next_date: format(nextDate, 'yyyy-MM-dd'),
            notes:
              transaction.observacoes !== undefined
                ? transaction.observacoes
                : existingTx.notes,
          })
          .select()
          .single()
        if (recError) throw recError
        recurringId = recData.id
      } else if (!wantsToBeRecurring && isCurrentlyRecurring) {
        await supabase
          .from('recurring_transactions')
          .delete()
          .eq('id', recurringId)
        recurringId = null
      } else if (wantsToBeRecurring && isCurrentlyRecurring) {
        await supabase
          .from('recurring_transactions')
          .update({
            description: transaction.descricao || existingTx.description,
            amount: transaction.valor || existingTx.amount,
            category: transaction.categoria_id || existingTx.category,
            type: transaction.tipo_id || existingTx.type,
            payment_method:
              transaction.forma_pagamento_id || existingTx.payment_method,
            notes:
              transaction.observacoes !== undefined
                ? transaction.observacoes
                : existingTx.notes,
          })
          .eq('id', recurringId)
      }
    } else if (isCurrentlyRecurring) {
      await supabase
        .from('recurring_transactions')
        .update({
          description: transaction.descricao || existingTx.description,
          amount: transaction.valor || existingTx.amount,
          category: transaction.categoria_id || existingTx.category,
          type: transaction.tipo_id || existingTx.type,
          payment_method:
            transaction.forma_pagamento_id || existingTx.payment_method,
          notes:
            transaction.observacoes !== undefined
              ? transaction.observacoes
              : existingTx.notes,
        })
        .eq('id', recurringId)
    }

    const updates: any = {
      recurring_transaction_id: recurringId,
    }
    if (transaction.data) updates.date = format(transaction.data, 'yyyy-MM-dd')
    if (transaction.descricao) updates.description = transaction.descricao
    if (transaction.valor) updates.amount = transaction.valor
    if (transaction.categoria_id) updates.category = transaction.categoria_id
    if (transaction.tipo_id) updates.type = transaction.tipo_id
    if (transaction.forma_pagamento_id)
      updates.payment_method = transaction.forma_pagamento_id
    if (transaction.observacoes !== undefined)
      updates.notes = transaction.observacoes

    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return mapToTransacao(data)
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)

    if (error) throw error
  },
}
