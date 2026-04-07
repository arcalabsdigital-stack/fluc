import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Role } from '@/lib/types'

export interface UserProfile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: Role
  organization_id?: string
  organizations?: { name: string } | null
  created_at: string | null
  updated_at: string | null
}

interface AuthContextType {
  user: User | null
  session: Session | null
  role: Role | null
  profile: UserProfile | null
  updateProfileContext: (updates: Partial<UserProfile>) => void
  signUp: (
    email: string,
    password: string,
    fullName: string,
    organizationName: string,
  ) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const userIdRef = useRef<string | null>(null)

  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, organizations(name)')
        .eq('id', userId)
        .single()

      if (error || !data) {
        console.warn('Error fetching profile:', error)
        return null
      }
      return data as UserProfile
    } catch (error) {
      console.error('Exception fetching profile:', error)
      return null
    }
  }

  // Effect for fetching profile when user changes
  useEffect(() => {
    let mounted = true

    const getProfileData = async () => {
      if (!user) return

      try {
        const userProfile = await fetchProfile(user.id)
        if (mounted) {
          if (userProfile) {
            setProfile(userProfile)
            setRole(userProfile.role)
          } else {
            setRole('visitante' as Role)
          }
        }
      } catch (error) {
        console.error('Error in getProfileData:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    if (user?.id) {
      getProfileData()
    } else {
      // If no user, ensure loading is false
      setLoading(false)
    }

    return () => {
      mounted = false
    }
  }, [user?.id])

  useEffect(() => {
    let mounted = true

    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      setSession(session)
      const newUser = session?.user ?? null

      // If we have a new user (different ID), we should show loading until profile is fetched
      if (newUser && newUser.id !== userIdRef.current) {
        setLoading(true)
        userIdRef.current = newUser.id
      } else if (!newUser) {
        // If logged out, clear everything
        setRole(null)
        setProfile(null)
        setLoading(false)
        userIdRef.current = null
      }

      setUser(newUser)
    })

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return

      setSession(session)
      const newUser = session?.user ?? null

      if (newUser) {
        userIdRef.current = newUser.id
      } else {
        setLoading(false)
      }
      setUser(newUser)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    organizationName: string,
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          organization_name: organizationName,
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
    if (!error) {
      setRole(null)
      setProfile(null)
      setSession(null)
      setUser(null)
      userIdRef.current = null
    }
    return { error }
  }

  const updateProfileContext = (updates: Partial<UserProfile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : null))
  }

  const value = {
    user,
    session,
    role,
    profile,
    updateProfileContext,
    signUp,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
