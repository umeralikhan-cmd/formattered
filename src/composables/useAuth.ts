import { ref, computed } from 'vue'
import { supabase } from '@/plugins/supabase'
import type { User, Session } from '@supabase/supabase-js'

const user = ref<User | null>(null)
const session = ref<Session | null>(null)
const loading = ref(false)

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value)

  // Initialize auth state
  const initAuth = async () => {
    loading.value = true
    try {
      // Check for demo auth first
      const demoAuth = localStorage.getItem('demo-auth')
      if (demoAuth) {
        const { user: demoUser, session: demoSession } = JSON.parse(demoAuth)
        user.value = demoUser
        session.value = demoSession
        loading.value = false
        return
      }

      // Get current session from Supabase
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      session.value = currentSession
      user.value = currentSession?.user ?? null

      // Listen for auth changes
      supabase.auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession
        user.value = newSession?.user ?? null
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
    }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    loading.value = true
    try {
      // Demo user check
      if (email === 'root@gmail.com' && password === '123') {
        // Create a mock user for demo
        const mockUser = {
          id: 'demo-user-123',
          email: 'root@gmail.com',
          user_metadata: { full_name: 'Demo User' },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        const mockSession = {
          access_token: 'demo-token',
          refresh_token: 'demo-refresh',
          user: mockUser,
          expires_at: Date.now() + 3600000 // 1 hour
        }
        
        user.value = mockUser as any
        session.value = mockSession as any
        
        // Store in localStorage for persistence
        localStorage.setItem('demo-auth', JSON.stringify({ user: mockUser, session: mockSession }))
        
        return { success: true, user: mockUser }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      user.value = data.user
      session.value = data.session
      return { success: true, user: data.user }
    } catch (error: any) {
      console.error('Error signing in:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: any) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })

      if (error) throw error

      return { success: true, user: data.user }
    } catch (error: any) {
      console.error('Error signing up:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const signOut = async () => {
    loading.value = true
    try {
      // Clear demo auth
      localStorage.removeItem('demo-auth')
      
      const { error } = await supabase.auth.signOut()
      if (error && !localStorage.getItem('demo-auth')) throw error

      user.value = null
      session.value = null
      return { success: true }
    } catch (error: any) {
      console.error('Error signing out:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    loading.value = true
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Error resetting password:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Update password
  const updatePassword = async (newPassword: string) => {
    loading.value = true
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error
      return { success: true }
    } catch (error: any) {
      console.error('Error updating password:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated,
    initAuth,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  }
}