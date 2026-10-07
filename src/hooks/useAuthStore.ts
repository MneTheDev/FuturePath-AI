import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/lib/supabase'
import { mockAuth } from '@/lib/mockAuth'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  session: any | null
  useMockAuth: boolean
  hydrated: boolean
  setUser: (user: User | null) => void
  setSession: (session: any) => void
  setUseMockAuth: (use: boolean) => void
  setHydrated: (hydrated: boolean) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      useMockAuth: false,
      hydrated: false,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setUseMockAuth: (use) => set({ useMockAuth: use }),
      setHydrated: (hydrated) => set({ hydrated }),
      signOut: async () => {
        set({ user: null, session: null })
        try {
          await supabase.auth.signOut()
        } catch (err) {
          console.warn('Supabase signout failed, using mock signout')
          mockAuth.signOut()
        }
      },
    }),
    {
      name: 'futurepath-auth',
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    }
  )
)
