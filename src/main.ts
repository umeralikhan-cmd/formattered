/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins';

// Components
import App from './App.vue';

// Composables
import { createApp } from 'vue';
import api from './plugins/axios';

const app = createApp(App);

app.config.globalProperties.$axios = api;

registerPlugins(app);

app.mount('#app');
