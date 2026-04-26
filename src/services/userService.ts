import { supabase } from '@/lib/supabase/client'
import { UserProfile, Role } from '@/lib/types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export const userService = {
  async getAllUsers(): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as UserProfile[]
  },

  async updateUserRole(userId: string, newRole: Role): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    if (error) throw error
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId)

    if (error) throw error
  },

  async inviteUser(
    email: string,
    fullName: string,
    role: Role,
    password?: string,
  ): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession()
    const res = await fetch(`${SUPABASE_URL}/functions/v1/invite-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session?.access_token}`,
      },
      body: JSON.stringify({
        action: 'invite',
        email,
        fullName,
        role,
        password,
      }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao enviar convite')
    }
    if (data?.error) throw new Error(data.error)
  },

  async deleteUser(userId: string): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession()
    const res = await fetch(`${SUPABASE_URL}/functions/v1/invite-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session?.access_token}`,
      },
      body: JSON.stringify({ action: 'delete', userId }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao excluir usuário')
    }
    if (data?.error) throw new Error(data.error)
  },

  async resendInvite(userId: string): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession()
    const res = await fetch(`${SUPABASE_URL}/functions/v1/invite-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionData.session?.access_token}`,
      },
      body: JSON.stringify({ action: 'resend', userId }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.error || 'Erro ao reenviar convite')
    }
    if (data?.error) throw new Error(data.error)
  },
}
