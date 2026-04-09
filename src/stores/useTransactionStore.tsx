import { create } from 'zustand'
import { Transacao, Categoria } from '@/lib/types'
import { supabase } from '@/lib/supabase/client'
import { transactionService } from '@/services/transactionService'
import { ReactNode, useEffect } from 'react'
import { FilterState } from '@/components/transactions/TransactionFilters'

interface TransactionStore {
  transactions: Transacao[]
  categories: Categoria[]
  isLoading: boolean
  fetchCategories: () => Promise<void>
  fetchTransactions: (filters: FilterState, role: string) => Promise<void>
  addTransaction: (t: Omit<Transacao, 'id'>) => Promise<void>
  updateTransaction: (id: string, t: Partial<Transacao>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
}

const useTransactionStore = create<TransactionStore>((set) => ({
  transactions: [],
  categories: [],
  isLoading: false,
  fetchCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('grupo')
      .order('nome')
    if (error) {
      console.error('Error fetching categories:', error)
      return
    }
    set({ categories: data as Categoria[] })
  },
  fetchTransactions: async (filters, role) => {
    set({ isLoading: true })
    try {
      const data = await transactionService.fetchTransactions(
        filters,
        role as any,
      )
      set({ transactions: data })
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      set({ isLoading: false })
    }
  },
  addTransaction: async (transaction) => {
    const newT = await transactionService.createTransaction(transaction)
    set((state) => ({ transactions: [newT, ...state.transactions] }))
  },
  updateTransaction: async (id, transaction) => {
    const updated = await transactionService.updateTransaction(id, transaction)
    set((state) => ({
      transactions: state.transactions.map((t) => (t.id === id ? updated : t)),
    }))
  },
  deleteTransaction: async (id) => {
    await transactionService.deleteTransaction(id)
    set((state) => ({
      transactions: state.transactions.filter((t) => t.id !== id),
    }))
  },
}))

export function TransactionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    useTransactionStore.getState().fetchCategories()
  }, [])
  return <>{children}</>
}

export default useTransactionStore
