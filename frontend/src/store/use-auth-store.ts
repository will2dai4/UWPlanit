import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthState {
  user: SupabaseUser | null
  isLoading: boolean
  setUser: (user: SupabaseUser | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  initialize: async () => {
    set({ isLoading: true })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    set({ user: session?.user ?? null, isLoading: false })

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null })
    })
  },
}))

