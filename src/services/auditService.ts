import { supabase } from '@/lib/supabase/client'

export interface AuditLog {
  id: string
  created_at: string
  action: string
  entity_type: string
  entity_name: string
  details: any
  profiles?: {
    full_name: string
  }
}

export const auditService = {
  async getLogs(): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs' as any)
      .select(
        `
        id,
        created_at,
        action,
        entity_type,
        entity_name,
        details,
        profiles (
          full_name
        )
      `,
      )
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error
    return data as any
  },
}
