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

// Toast options
const toastOptions = {
  position: 'top-right',
  timeout: 2000, // 2 seconds
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false,
  transition: 'Vue-Toastification__bounce',
  maxToasts: 5,
  newestOnTop: true,
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
