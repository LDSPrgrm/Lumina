<script setup lang="ts">
const store = useSettingsStore();
const step = ref(1);
const apiKey = ref('');
const showKey = ref(false);
const isSaving = ref(false);

const handleFinish = async () => {
  if (!apiKey.value.trim()) return;
  
  isSaving.value = true;
  // Simulate a slight delay for premium feel
  await new Promise(resolve => setTimeout(resolve, 800));
  store.setApiKey(apiKey.value);
  isSaving.value = false;
};
</script>

<template>
  <div class="onboarding-wrapper">
    <Transition name="slide-fade" mode="out-in">
      <!-- Step 1: Welcome -->
      <div v-if="step === 1" key="welcome" class="onboarding-card glass-card">
        <div class="onboarding-content">
          <div class="welcome-badge">
            <span class="badge badge-completed">v1.0 is here</span>
          </div>
          
          <h1 class="title">Welcome to <span class="text-gradient">Lumina AI</span></h1>
          <p class="description">
            Your personal AI-powered language sensei. Master any language through interactive, adaptive quizzes powered by Google Gemini.
          </p>

          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">✨</div>
              <div class="feature-text">
                <strong>Adaptive Learning</strong>
                <span>Quizzes that evolve with your progress.</span>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔒</div>
              <div class="feature-text">
                <strong>Privacy First</strong>
                <span>All data stays local on your device.</span>
              </div>
            </div>
          </div>

          <button class="btn btn-primary w-full mt-4" @click="step = 2">
            Get Started
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Step 2: API Key -->
      <div v-else key="config" class="onboarding-card glass-card">
        <div class="onboarding-content">
          <button class="back-btn" @click="step = 1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5m7-7l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Back
          </button>

          <h2 class="title-sm">Connect your <span class="text-gradient">Gemini AI</span></h2>
          <p class="description">
            Lumina uses Google's Gemini Flash model. It's free to use and provides lightning-fast language analysis.
          </p>

          <div class="config-form">
            <div class="form-group">
              <label for="onboarding-api-key">Gemini API Key</label>
              <div class="key-input-wrap">
                <input
                  id="onboarding-api-key"
                  v-model="apiKey"
                  :type="showKey ? 'text' : 'password'"
                  placeholder="Paste key here..."
                  class="input-field"
                />
                <button
                  type="button"
                  class="toggle-visibility"
                  @click="showKey = !showKey"
                >
                  <svg v-if="!showKey" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.63 18.63 0 015.06-5.94M9.9 9.9C8.22 8.22 7 7.5 7 7.5A10.07 10.07 0 0112 4c7 0 11 8 11 8a18.63 18.63 0 01-5.06 5.94M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>

            <div class="help-link">
              <a href="https://aistudio.google.com/app/apikey" target="_blank">
                Don't have a key? Get one for free ↗
              </a>
            </div>

            <button 
              class="btn btn-primary w-full finish-btn" 
              :disabled="!apiKey || isSaving"
              @click="handleFinish"
            >
              <span v-if="!isSaving">Finish Setup</span>
              <span v-else class="loader"></span>
            </button>
          </div>

          <div class="security-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Your key is encrypted and stored only on this device.
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.onboarding-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  overflow-y: auto;
  padding: 2rem 1rem;
}

.onboarding-card {
  max-width: 500px;
  width: 100%;
  padding: 3rem;
  border-radius: 32px;
  position: relative;
  overflow: hidden;
}

.onboarding-content {
  position: relative;
  z-index: 2;
}

.welcome-badge {
  margin-bottom: 2rem;
  display: flex;
}

.title {
  font-size: clamp(2rem, 8vw, 3rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.04em;
  margin-bottom: 1.5rem;
  color: var(--text-main);
}

.title-sm {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -0.03em;
}

.text-gradient {
  background: linear-gradient(135deg, var(--primary) 0%, #00f2fe 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.description {
  color: var(--text-muted);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.feature-grid {
  display: grid;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
}

.feature-item {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  background: var(--bg-subtle);
  padding: 1.25rem;
  border-radius: 20px;
  border: 1px solid var(--border-light);
}

.feature-icon {
  font-size: 1.5rem;
  width: 44px;
  height: 44px;
  background: var(--bg-main);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.feature-text {
  display: flex;
  flex-direction: column;
}

.feature-text strong {
  font-size: 0.95rem;
  color: var(--text-main);
}

.feature-text span {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.config-form {
  margin-bottom: 2rem;
}

.key-input-wrap {
  display: flex;
  background: var(--bg-subtle);
  border-radius: 14px;
  border: 2px solid var(--border-light);
  overflow: hidden;
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.key-input-wrap:focus-within {
  border-color: var(--primary);
  background: var(--bg-main);
  box-shadow: 0 0 0 4px rgba(0, 220, 130, 0.1);
}

.input-field {
  flex: 1;
  padding: 1rem 1.25rem;
  background: transparent;
  border: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.95rem;
  color: var(--text-main);
}

.input-field:focus { outline: none; }

.toggle-visibility {
  padding: 0 1rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

.help-link {
  margin-top: 0.75rem;
  margin-bottom: 2rem;
  text-align: right;
}

.help-link a {
  font-size: 0.85rem;
  color: var(--primary);
  font-weight: 600;
  text-decoration: none;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 0;
}

.back-btn:hover { color: var(--text-main); }

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-subtle);
}

.finish-btn {
  padding: 1rem;
  font-size: 1.1rem;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.4s var(--ease-premium);
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (max-width: 640px) {
  .onboarding-card {
    padding: 2rem 1.5rem;
    border-radius: 24px;
  }
  
  .feature-item {
    padding: 1rem;
  }
  
  .title {
    font-size: 2.25rem;
  }
}
</style>
