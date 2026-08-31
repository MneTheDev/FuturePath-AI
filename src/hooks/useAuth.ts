import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './useAuthStore'
import { mockAuth } from '@/lib/mockAuth'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, setUser, setSession, signOut, useMockAuth, setUseMockAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try real auth first
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          setSession(session)
          await fetchProfile(session.user.id)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            setSession(session)
            if (session?.user) {
              await fetchProfile(session.user.id)
            } else {
              setUser(null)
            }
          }
        )
        return () => subscription.unsubscribe()
      } catch (err: any) {
        // Fall back to mock auth if Supabase unavailable
        console.warn('Supabase unavailable, using mock auth:', err.message)
        setUseMockAuth(true)
        mockAuth.enableMock()

        // Restore mock session if it exists
        const mockSession = mockAuth.getSession()
        if (mockSession) {
          setSession(mockSession as any)
          setUser(mockSession.user as any)
        }
      }
    }

    initAuth()
  }, [])

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (data) {
      setUser(data)
      return data
    }
    return null
  }

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    setLoading(true)
    try {
      // If using mock auth, use mock signup
      if (useMockAuth) {
        const { user: mockUser, session } = mockAuth.signUp(email, password, fullName, phone)
        setSession(session as any)
        setUser(mockUser as any)
        toast.success('Account created!')
        return
      }

      // Try real Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, phone },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email,
          full_name: fullName,
          phone,
          role: 'user',
          is_suspended: false,
        })
        toast.success('Account created! Please check your email to verify.')
      }
    } catch (err: any) {
      console.warn('Supabase signup failed, falling back to mock auth:', err.message)
      setUseMockAuth(true)
      mockAuth.enableMock()
      try {
        const { user: mockUser, session } = mockAuth.signUp(email, password, fullName, phone)
        setSession(session as any)
        setUser(mockUser as any)
        toast.success('Account created (demo mode)!')
      } catch (mockErr: any) {
        toast.error(mockErr.message || 'Registration failed')
        throw mockErr
      }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      // If using mock auth, use mock signin
      if (useMockAuth) {
        const { user: mockUser, session } = mockAuth.signIn(email, password)
        setSession(session as any)
        setUser(mockUser as any)
        toast.success('Signed in (demo mode)')
        return true
      }

      // Try real Supabase signin
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // If sign-in succeeded, ensure we capture the session and profile
      const session = data?.session
      if (session?.user) {
        setSession(session)
        const profile = await fetchProfile(session.user.id)
        if (!profile) {
          // Create a minimal user object from session so app routing works
          const minimalUser = {
            id: session.user.id,
            email: session.user.email ?? '',
            full_name: session.user.user_metadata?.full_name ?? '',
            role: 'user',
            is_suspended: false,
            created_at: new Date().toISOString(),
          }
          setUser(minimalUser as any)
        }
        toast.success('Signed in')
        return true
      } else {
        // Fallback: try to fetch the current session from the client
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData?.session) {
          setSession(sessionData.session)
          if (sessionData.session.user) {
            const profile = await fetchProfile(sessionData.session.user.id)
            if (!profile) {
              const minimalUser = {
                id: sessionData.session.user.id,
                email: sessionData.session.user.email ?? '',
                full_name: sessionData.session.user.user_metadata?.full_name ?? '',
                role: 'user',
                is_suspended: false,
                created_at: new Date().toISOString(),
              }
              setUser(minimalUser as any)
            }
          }
          toast.success('Signed in')
          return true
        }
      }
    } catch (err: any) {
      console.warn('Supabase signin failed, falling back to mock auth:', err.message)
      setUseMockAuth(true)
      mockAuth.enableMock()
      try {
        const { user: mockUser, session } = mockAuth.signIn(email, password)
        setSession(session as any)
        setUser(mockUser as any)
        toast.success('Signed in (demo mode)')
        return true
      } catch (mockErr: any) {
        toast.error(mockErr.message || 'Login failed')
        return false
      }
    } finally {
      setLoading(false)
    }
    return false
  }

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset`,
    })
    if (error) toast.error(error.message)
    else toast.success('Password reset link sent to your email')
  }

  return { user, loading, signUp, signIn, signOut, resetPassword }
}
