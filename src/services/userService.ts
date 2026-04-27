import { supabase } from '@/lib/supabase/client'
import { UserProfile, Role } from '@/lib/types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

export const userService = {
  async getAllUsers(): Promise<UserProfile[]> {
    const { data: sessionData } = await supabase.auth.getSession()
    const { data: orgData } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', sessionData.session?.user.id)
      .single()

    if (!orgData?.organization_id) return []

    const { data, error } = await supabase
      .from('user_workspaces')
      .select(
        `
        user_id,
        role,
        is_active,
        profiles!inner (
          id,
          full_name,
          avatar_url,
          must_change_password
        )
      `,
      )
      .eq('organization_id', orgData.organization_id)

    if (error) throw error

    return data.map((item: any) => ({
      id: item.user_id,
      full_name: item.profiles.full_name,
      avatar_url: item.profiles.avatar_url,
      role: item.role,
      is_active: item.is_active,
      must_change_password: item.profiles.must_change_password,
    })) as UserProfile[]
  },

  async updateUserRole(userId: string, newRole: Role): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession()
    const { data: orgData } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', sessionData.session?.user.id)
      .single()
    if (!orgData) throw new Error('Organization not found')

    const { error } = await supabase
      .from('user_workspaces')
      .update({ role: newRole })
      .eq('user_id', userId)
      .eq('organization_id', orgData.organization_id)

    if (error) throw error
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession()
    const { data: orgData } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', sessionData.session?.user.id)
      .single()
    if (!orgData) throw new Error('Organization not found')

    const { error } = await supabase
      .from('user_workspaces')
      .update({ is_active: isActive })
      .eq('user_id', userId)
      .eq('organization_id', orgData.organization_id)

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
