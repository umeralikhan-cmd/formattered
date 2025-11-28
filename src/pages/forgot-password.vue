<route lang="yaml">
meta:
  layout: auth
</route>

<template>
  <div class="forgot-page">
    <div class="forgot-container">
      <!-- Logo -->
      <div class="logo-section">
        <h1 class="brand-logo">Hustle 2.0</h1>
      </div>

      <!-- Title -->
      <h2 class="page-title">Reset Password</h2>
      <p class="page-subtitle">Enter your email to receive reset instructions</p>

      <!-- Success Alert -->
      <v-alert v-if="successMessage" type="success" variant="tonal" density="compact" class="mb-4">
        {{ successMessage }}
      </v-alert>

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

      <!-- Form -->
      <v-form ref="resetForm" @submit.prevent="handleResetPassword">
        <!-- Email Field -->
        <v-text-field
          v-model="email"
          label="Email Address"
          type="email"
          variant="outlined"
          density="comfortable"
          :rules="[rules.required, rules.email]"
          :disabled="loading || !!successMessage"
          hide-details="auto"
          class="form-field"
          autofocus
        />

        <!-- Reset Button -->
        <v-btn
          v-if="!successMessage"
          type="submit"
          color="primary"
          size="large"
          block
          :loading="loading"
          class="reset-btn"
        >
          SEND RESET LINK
        </v-btn>

        <!-- Back to Login Button -->
        <v-btn
          variant="outlined"
          size="large"
          block
          :disabled="loading"
          class="back-btn"
          @click="$router.push('/login')"
        >
          BACK TO SIGN IN
        </v-btn>
      </v-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { resetPassword, loading } = useAuth();

// Form data
const email = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const resetForm = ref<any>(null);

// Validation rules
const rules = {
  required: (value: any) => !!value || 'This field is required',
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'Invalid email address';
  },
};

// Handle reset password
const handleResetPassword = async () => {
  if (!resetForm.value) return;
  
  const { valid } = await resetForm.value.validate();
  if (!valid) return;

  errorMessage.value = '';
  successMessage.value = '';

  const result = await resetPassword(email.value);

  if (result.success) {
    successMessage.value = 'Password reset link has been sent to your email. Please check your inbox.';
  } else {
    errorMessage.value = result.error || 'Failed to send reset link. Please try again.';
  }
};
</script>

<style scoped>
.forgot-page {
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

.forgot-container {
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
  margin: 0 0 20px 0;
}

/* Form Fields */
.form-field {
  margin-bottom: 24px;
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

/* Reset Button */
.reset-btn {
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
  margin-bottom: 16px;
}

.reset-btn:hover {
  background: #2563eb !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px);
}

/* Back Button */
.back-btn {
  height: 44px !important;
  background: transparent !important;
  color: rgba(255, 255, 255, 0.8) !important;
  border: 1px solid rgba(148, 163, 184, 0.4) !important;
  font-family: 'Inter', sans-serif !important;
  font-size: 0.875rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
  text-transform: uppercase !important;
  border-radius: 6px !important;
  box-shadow: none !important;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(148, 163, 184, 0.6) !important;
}

/* Responsive */
@media (max-width: 600px) {
  .forgot-page {
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
