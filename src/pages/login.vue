<route lang="yaml">
meta:
  layout: auth
</route>

<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo -->
      <div class="logo-section">
        <h1 class="brand-logo">Hustle 2.0</h1>
      </div>

      <!-- Title -->
      <h2 class="page-title">Welcome Back</h2>
      <p class="page-subtitle">Sign in to your account</p>

      <!-- Error Alert -->
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        closable
        density="compact"
        class="mb-4"
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <!-- Demo Info -->
      <div class="demo-info">
        <v-icon size="14" class="mr-1"> mdi-information-outline </v-icon>
        <span><strong>Demo:</strong> root@gmail.com / 123</span>
      </div>

      <!-- Form -->
      <v-form ref="loginForm" @submit.prevent="handleLogin">
        <!-- Email Field -->
        <v-text-field
          v-model="email"
          label="Email Address"
          type="email"
          variant="outlined"
          density="comfortable"
          :rules="[rules.required, rules.email]"
          :disabled="loading"
          hide-details="auto"
          class="form-field"
        />

        <!-- Password Field -->
        <v-text-field
          v-model="password"
          label="Password"
          :type="showPassword ? 'text' : 'password'"
          variant="outlined"
          density="comfortable"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          :rules="[rules.required]"
          :disabled="loading"
          hide-details="auto"
          class="form-field"
          @click:append-inner="showPassword = !showPassword"
        />

        <!-- Remember Me & Forgot -->
        <div class="form-options">
          <v-checkbox v-model="rememberMe" label="Remember me" density="compact" hide-details color="primary" />
          <a class="forgot-link" @click="handleForgotPassword">Forgot password?</a>
        </div>

        <!-- Sign In Button -->
        <v-btn type="submit" color="primary" size="large" block :loading="loading" class="signin-btn"> SIGN IN </v-btn>

        <!-- Divider -->
        <div class="divider">
          <div class="divider-line" />
          <span class="divider-text">or</span>
          <div class="divider-line" />
        </div>

        <!-- Google Button -->
        <v-btn variant="outlined" size="large" block :disabled="loading" class="google-btn" @click="handleGoogleSignin">
          <svg width="20" height="20" viewBox="0 0 24 24" class="google-icon">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </v-btn>

        <!-- Footer Link -->
        <div class="footer-link">
          <span>Don't have an account?</span>
          <a class="signup-link" @click="$router.push('/signup')">SIGN UP HERE</a>
        </div>
      </v-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { signIn, loading } = useAuth();

// Form data
const email = ref('root@gmail.com');
const password = ref('123');
const rememberMe = ref(true);
const showPassword = ref(false);
const errorMessage = ref('');
const loginForm = ref(null);

// Validation rules
const rules = {
  required: (value: any) => !!value || 'This field is required',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'Invalid email address';
  },
};

// Handle login
const handleLogin = async () => {
  if (!loginForm.value) return;

  // Cast loginForm.value to any to avoid TS error ('validate' does not exist on type 'never')
  const { valid } = await (loginForm.value as any).validate?.() || {};
  if (!valid) return;

  errorMessage.value = '';

  const result = await signIn(email.value, password.value);

  if (result.success) {
    router.push('/');
  } else {
    errorMessage.value = result.error || 'Failed to sign in. Please check your credentials.';
  }
};

// Handle forgot password
const handleForgotPassword = () => {
  router.push('/forgot-password');
};

// Handle Google signin
const handleGoogleSignin = () => {
  errorMessage.value = 'Google sign-in will be available once configured in Supabase.';
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  background-image:
    radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%);
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 420px;
}

/* Logo */
.logo-section {
  text-align: center;
  margin-bottom: 32px;
}

.brand-logo {
  font-family: 'Poppins', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  letter-spacing: 0.02em;
}

/* Title */
.page-title {
  font-family: 'Inter', sans-serif;
  font-size: 1.375rem;
  font-weight: 400;
  color: #ffffff;
  text-align: center;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin: 0 0 16px 0;
}

/* Demo Info */
.demo-info {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 14px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 4px;
  margin-bottom: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Form Fields */
.form-field {
  margin-bottom: 16px;
}

:deep(.v-field) {
  background: rgba(30, 41, 59, 0.6) !important;
  border: none !important;
  border-radius: 8px !important;
  cursor: text !important;
  transition: all 0.2s ease !important;
}

:deep(.v-field:hover) {
  background: rgba(30, 41, 59, 0.8) !important;
}

:deep(.v-field--focused) {
  background: rgba(30, 41, 59, 0.9) !important;
  box-shadow: none !important;
}

:deep(.v-field--error) {
  box-shadow: none !important;
}

:deep(.v-field__input) {
  color: #f8fafc !important;
  min-height: 48px !important;
  padding: 14px 16px !important;
  font-size: 1rem !important;
  cursor: text !important;
  font-weight: 400 !important;
}

:deep(.v-field__input input) {
  cursor: text !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}

:deep(.v-field__input input::placeholder) {
  color: rgba(203, 213, 225, 0.6) !important;
}

:deep(.v-label) {
  color: #cbd5e1 !important;
  font-size: 1rem !important;
  font-weight: 500 !important;
}

:deep(.v-field--focused .v-label),
:deep(.v-field--active .v-label) {
  color: #60a5fa !important;
  font-weight: 600 !important;
}

:deep(.v-icon) {
  color: #94a3b8 !important;
}

:deep(.v-field--focused .v-icon) {
  color: #60a5fa !important;
}

/* Form Options */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

:deep(.v-selection-control .v-label) {
  color: rgba(255, 255, 255, 0.8) !important;
  opacity: 1 !important;
  font-size: 0.875rem !important;
}

:deep(.v-checkbox .v-selection-control__input) {
  color: #3b82f6 !important;
}

.forgot-link {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: #3b82f6;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
}

.forgot-link:hover {
  color: #60a5fa;
  text-decoration: underline;
}

/* Sign In Button */
.signin-btn {
  height: 44px !important;
  background: #3b82f6 !important;
  color: #ffffff !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  text-transform: uppercase !important;
  border-radius: 6px !important;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3) !important;
  margin-bottom: 20px;
}

.signin-btn:hover {
  background: #2563eb !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px);
}

/* Google Button */
.google-btn {
  height: 44px !important;
  background: #ffffff !important;
  color: #374151 !important;
  border: 1px solid #d1d5db !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  text-transform: none !important;
  border-radius: 6px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  margin-bottom: 20px;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
}

.google-btn:hover {
  background: #f9fafb !important;
  border-color: #9ca3af !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15) !important;
  transform: translateY(-1px);
}

.google-icon {
  flex-shrink: 0;
  margin-right: 8px;
}

/* Divider */
.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 16px 0;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}

.divider-text {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

/* Footer Link */
.footer-link {
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 12px;
}

.signup-link {
  color: #3b82f6;
  text-decoration: none;
  cursor: pointer;
  margin-left: 4px;
  font-weight: 600;
}

.signup-link:hover {
  color: #60a5fa;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 600px) {
  .login-page {
    padding: 24px 16px;
  }

  .brand-logo {
    font-size: 1.75rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.9375rem;
  }
}
</style>
