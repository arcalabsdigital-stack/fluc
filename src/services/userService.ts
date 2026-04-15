import { supabase } from '@/lib/supabase/client'
import { UserProfile, Role } from '@/lib/types'

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

  async inviteUser(email: string, fullName: string, role: Role): Promise<void> {
    const { data, error } = await supabase.functions.invoke('invite-user', {
      body: { email, fullName, role },
    })

    if (error) throw error
    if (data?.error) throw new Error(data.error)
  },
}
