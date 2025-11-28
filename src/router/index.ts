/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
import { routes } from 'vue-router/auto-routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password']

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const isPublicRoute = publicRoutes.includes(to.path)
  
  // Check for demo auth or Supabase session
  const demoAuth = localStorage.getItem('demo-auth')
  let isAuthenticated = false
  
  if (demoAuth) {
    const { session } = JSON.parse(demoAuth)
    isAuthenticated = session && session.expires_at > Date.now()
  }
  
  // If no demo auth, check Supabase (when configured)
  if (!isAuthenticated) {
    try {
      const { supabase } = await import('@/plugins/supabase')
      const { data: { session } } = await supabase.auth.getSession()
      isAuthenticated = !!session
    } catch (error) {
      // Supabase not configured, continue with demo auth only
    }
  }

  if (!isPublicRoute && !isAuthenticated) {
    // Redirect to login if trying to access protected route without authentication
    next('/login')
  } else if (isPublicRoute && isAuthenticated) {
    // Redirect to home if trying to access auth pages while authenticated
    next('/')
  } else {
    // Allow navigation
    next()
  }
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error')
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err)
    }
  } else {
    console.error(err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
})

export default router
