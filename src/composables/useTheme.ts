import { useTheme as useVuetifyTheme } from 'vuetify';
import { watch } from 'vue';
import { useAppStore } from '@/stores/app';

export function useTheme() {
  const vuetifyTheme = useVuetifyTheme();
  const appStore = useAppStore();

  // Initialize theme on first use
  appStore.initTheme();
  vuetifyTheme.global.name.value = appStore.theme;

  // Watch for theme changes
  watch(
    () => appStore.theme,
    (newTheme) => {
      vuetifyTheme.global.name.value = newTheme;
    }
  );

  return {
    theme: appStore.theme,
    isDark: appStore.isDark,
    toggleTheme: appStore.toggleTheme,
  };
}
