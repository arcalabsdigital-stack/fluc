import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export interface Workspace {
  id: string
  name: string
  role: string
  is_active: boolean
}

export interface Subscription {
  id: string
  plan: string
  status: string
  trial_end: string
  current_period_end: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  organization_id: string
  must_change_password?: boolean
}

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (
    email: string,
    password: string,
    fullName: string,
    organizationName: string,
    plan?: string,
  ) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
  profile: Profile | null
  role: string | null
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  subscription: Subscription | null
  switchWorkspace: (orgId: string) => Promise<void>
  updateProfileContext: (updates: Partial<Profile>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (userId: string) => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileData) {
      setProfile(profileData as Profile)
      
      const { data: wsData } = await supabase
        .from('user_workspaces')
        .select('role, is_active, organization_id, organizations(id, name)')
        .eq('user_id', userId)
        .eq('is_active', true)
        
      if (wsData && wsData.length > 0) {
        const mappedWorkspaces = wsData.map((ws: any) => ({
          id: ws.organization_id,
          name: ws.organizations?.name || 'Workspace',
          role: ws.role,
          is_active: ws.is_active
        }))
        setWorkspaces(mappedWorkspaces)
        
        let activeWs = mappedWorkspaces.find(w => w.id === profileData.organization_id)
        if (!activeWs) {
          activeWs = mappedWorkspaces[0]
          await supabase.from('profiles').update({ organization_id: activeWs.id }).eq('id', userId)
          profileData.organization_id = activeWs.id
        }
        
        setCurrentWorkspace(activeWs)
        setRole(activeWs.role)
        
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('organization_id', activeWs.id)
          .single()
          
        setSubscription(subData)
      }
    }
  }

  useEffect(() => {
    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setRole(null)
        setWorkspaces([])
        setCurrentWorkspace(null)
        setSubscription(null)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    return () => authSub.unsubscribe()
  }, [])

  const switchWorkspace = async (orgId: string) => {
    if (!user) return
    setLoading(true)
    await supabase.from('profiles').update({ organization_id: orgId }).eq('id', user.id)
    await loadProfile(user.id)
    setLoading(false)
    window.location.href = '/'
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    organizationName: string,
    plan?: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          organization_name: organizationName,
          company_name: organizationName,
          ...(plan ? { plan } : {}),
        },
      },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfileContext = (updates: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        workspaces,
        currentWorkspace,
        subscription,
        switchWorkspace,
        signUp,
        signIn,
        signOut,
        loading,
        updateProfileContext,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
