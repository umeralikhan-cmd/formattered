<template>
  <div class="profile-container">
    <div class="content-wrapper">
      <!-- Profile Section -->
      <div class="profile-section">
        <div class="profile-content">
          <!-- User Card -->
          <div class="user-card">
            <div class="user-avatar">
              <v-icon size="48" color="primary"> mdi-account-circle </v-icon>
            </div>
            <div class="user-info">
              <h2 class="user-name">
                {{ user?.user_metadata?.full_name || 'Demo User' }}
              </h2>
              <p class="user-email">
                {{ user?.email || 'root@gmail.com' }}
              </p>
            </div>
          </div>

          <!-- Info Grid -->
          <div class="info-grid">
            <div class="info-card">
              <div class="info-card-header">
                <v-icon size="20" color="primary"> mdi-identifier </v-icon>
                <span class="info-card-label">User ID</span>
              </div>
              <p class="info-card-value">
                {{ user?.id || 'demo-user-123' }}
              </p>
            </div>

            <div class="info-card">
              <div class="info-card-header">
                <v-icon size="20" color="primary"> mdi-calendar-clock </v-icon>
                <span class="info-card-label">Member Since</span>
              </div>
              <p class="info-card-value">
                {{ formatDate(user?.created_at) }}
              </p>
            </div>

            <div class="info-card">
              <div class="info-card-header">
                <v-icon size="20" color="primary"> mdi-update </v-icon>
                <span class="info-card-label">Last Updated</span>
              </div>
              <p class="info-card-value">
                {{ formatDate(user?.updated_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth';

const { user } = useAuth();

// Format date
const formatDate = (dateString) => {
  if (!dateString) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>

<style scoped>
.profile-container {
  min-height: calc(100vh - 72px);
  background: #f8fafc;
  padding: 24px;
}

.v-theme--dark .profile-container {
  background: #0f172a;
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
}

/* Profile Section */
.profile-section {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.v-theme--dark .profile-section {
  background: #1e293b;
  border-color: #334155;
}

.profile-content {
  padding: 32px;
}

/* User Card */
.user-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  margin-bottom: 32px;
}

.v-theme--dark .user-card {
  background: #0f172a;
  border-color: #334155;
}

.user-avatar {
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.user-info {
  flex: 1;
}

.user-name {
  font-family: 'Poppins', sans-serif;
  font-size: 1.375rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.v-theme--dark .user-name {
  color: #f8fafc;
}

.user-email {
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  color: #64748b;
  margin: 0;
}

.v-theme--dark .user-email {
  color: #94a3b8;
}

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.info-card {
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.v-theme--dark .info-card {
  background: #0f172a;
  border-color: #334155;
}

.info-card:hover {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  transform: translateY(-2px);
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.info-card-label {
  font-family: 'Inter', sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.v-theme--dark .info-card-label {
  color: #94a3b8;
}

.info-card-value {
  font-family: 'Inter', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.v-theme--dark .info-card-value {
  color: #f8fafc;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-container {
    padding: 16px;
  }

  .profile-header {
    padding: 20px 24px;
  }

  .profile-content {
    padding: 24px;
  }

  .user-card {
    flex-direction: column;
    text-align: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .profile-title {
    font-size: 1.25rem;
  }

  .user-name {
    font-size: 1.125rem;
  }
}
</style>
