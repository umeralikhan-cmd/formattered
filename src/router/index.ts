/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
// @ts-ignore - vue-router/auto is generated
import { createRouter, createWebHistory } from 'vue-router/auto';
// @ts-ignore - virtual module
import { setupLayouts } from 'virtual:generated-layouts';
// @ts-ignore - vue-router/auto-routes is generated
import { routes } from 'vue-router/auto-routes';
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
});

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password'];

// Navigation guard for authentication
router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const isPublicRoute = publicRoutes.includes(to.path);

  // Check for demo auth or Supabase session
  const demoAuth = localStorage.getItem('demo-auth');
  let isAuthenticated = false;

  if (demoAuth) {
    try {
      const parsedAuth = JSON.parse(demoAuth) as { session: { expires_at: number } };
      isAuthenticated = parsedAuth.session && parsedAuth.session.expires_at > Date.now();
    } catch {
      localStorage.removeItem('demo-auth');
    }
  }

  // If no demo auth, check Supabase (when configured)
  if (!isAuthenticated) {
    try {
      const { supabase } = await import('@/plugins/supabase');
      const {
        data: { session },
      } = await supabase.auth.getSession();
      isAuthenticated = !!session;
    } catch {
      // Supabase not configured, continue with demo auth only
    }
  }

  if (!isPublicRoute && !isAuthenticated) {
    // Redirect to login if trying to access protected route without authentication
    next('/login');
  } else if (isPublicRoute && isAuthenticated) {
    // Redirect to home if trying to access auth pages while authenticated
    next('/');
  } else {
    // Allow navigation
    next();
  }
});

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err: Error, to: RouteLocationNormalized) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (!localStorage.getItem('vuetify:dynamic-reload')) {
      console.log('Reloading page to fix dynamic import error');
      localStorage.setItem('vuetify:dynamic-reload', 'true');
      location.assign(to.fullPath);
    } else {
      console.error('Dynamic import error, reloading page did not fix it', err);
    }
  } else {
    console.error(err);
  }
});

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload');
});

export default router;
