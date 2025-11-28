/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import vuetify from './vuetify';
import pinia from '../stores';
import router from '../router';
import { VueQueryPlugin } from '@tanstack/vue-query';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

// Types
import type { App } from 'vue';

// Toast options - only non-default values
const toastOptions = {
  position: 'top-right',
  timeout: 2000, // 2 seconds (default is 5000)
  maxToasts: 5,
  transition: 'Vue-Toastification__bounce',
};

export function registerPlugins(app: App) {
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(Toast, toastOptions)
    .use(VueQueryPlugin, {
      queryClientConfig: {
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false, // Disable refetch on window focus
            retry: 1, // Retry failed requests once
            staleTime: 1000 * 60 * 5, // 5 minutes default
          },
        },
      },
    });
}
