/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Composables
import { createVuetify } from 'vuetify';

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#0066FF', // Modern vibrant blue
          secondary: '#7C3AED', // Rich purple
          accent: '#F59E0B', // Warm amber
          error: '#DC2626',
          warning: '#EA580C',
          info: '#0EA5E9',
          success: '#059669',
          background: '#FAFBFC',
          surface: '#FFFFFF',
          'surface-variant': '#F3F4F6',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-surface': '#111827',
          'on-background': '#111827',
          'on-surface-variant': '#6B7280',
        },
      },
      dark: {
        colors: {
          primary: '#3B82F6', // Lighter blue for dark mode
          secondary: '#A78BFA', // Lighter purple
          accent: '#FBBF24', // Bright amber
          error: '#EF4444',
          warning: '#F97316',
          info: '#38BDF8',
          success: '#10B981',
          background: '#0A0F1E', // Deep navy
          surface: '#1A1F2E',
          'surface-variant': '#252B3B',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
          'on-surface': '#F9FAFB',
          'on-background': '#F9FAFB',
          'on-surface-variant': '#9CA3AF',
        },
      },
    },
  },
  defaults: {
    global: {
      style: {
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important',
      },
    },
    VCard: {
      elevation: 0,
      rounded: 'xl',
      border: 'sm',
      style: 'font-family: Inter, sans-serif !important;',
    },
    VCardTitle: {
      style:
        'font-family: Poppins, sans-serif !important; font-weight: 700 !important; font-size: 1.375rem !important;',
    },
    VCardText: {
      style: 'font-family: Inter, sans-serif !important; font-size: 1rem !important;',
    },
    VBtn: {
      rounded: 'lg',
      elevation: 0,
      class: 'text-none font-weight-medium',
      style: 'font-family: Inter, sans-serif !important; font-weight: 600 !important; font-size: 0.9375rem !important;',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      style: 'font-family: Inter, sans-serif !important;',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      style: 'font-family: Inter, sans-serif !important;',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      rounded: 'lg',
      style: 'font-family: Inter, sans-serif !important;',
    },
    VCheckbox: {
      color: 'primary',
    },
    VChip: {
      rounded: 'pill',
      style: 'font-family: Inter, sans-serif !important; font-weight: 600 !important;',
    },
    VDataTable: {
      hover: true,
      style: 'font-family: Inter, sans-serif !important;',
    },
    VTab: {
      style: 'font-family: Inter, sans-serif !important; font-weight: 600 !important; font-size: 0.9375rem !important;',
    },
    VList: {
      style: 'font-family: Inter, sans-serif !important;',
    },
    VListItem: {
      style: 'font-family: Inter, sans-serif !important;',
    },
  },
});
