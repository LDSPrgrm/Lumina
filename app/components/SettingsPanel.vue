<script setup lang="ts">
const store = useSettingsStore();
const apiKey = ref(store.apiKey);
const showKey = ref(false);

const saved = ref(false);

const saveSettings = () => {
  store.setApiKey(apiKey.value);
  saved.value = true;
  setTimeout(() => { saved.value = false; }, 2000);
};

const resetDiagnostic = () => {
  if (confirm("This will reset your proficiency level and ask you to take the diagnostic test again. Continue?")) {
    store.isDiagnosed = false;
    localStorage.removeItem('lumina_is_diagnosed');
    store.currentTab = 'quiz';
  }
};
</script>

<template>
  <div class="settings-panel animate-fade-in">
    <!-- Header -->
    <div class="panel-header">
      <div class="header-icon-wrap">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 15V17M6 21H18C19.1046 21 20 20.1046 20 19V9C20 7.89543 19.1046 7 18 7H16V5C16 2.79086 14.2091 1 12 1C9.79086 1 8 2.79086 8 5V7H6C4.89543 7 4 7.89543 4 9V19C4 20.1046 4.89543 21 6 21Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="header-content">
        <h2>API Configuration</h2>
        <p class="panel-desc">
          Your Gemini API key powers the AI engine. It's stored locally and never leaves your device.
        </p>
      </div>
    </div>

    <!-- Key input -->
    <div class="settings-body">
      <div class="form-group">
        <label for="api-key-input">Gemini API Key</label>
        <div class="key-input-wrap">
          <input
            id="api-key-input"
            v-model="apiKey"
            :type="showKey ? 'text' : 'password'"
            placeholder="Paste your key from Google AI Studio..."
            class="input-field key-field"
          />
          <button
            type="button"
            class="toggle-visibility"
            @click="showKey = !showKey"
            :aria-label="showKey ? 'Hide API key' : 'Show API key'"
          >
            <svg v-if="!showKey" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.63 18.63 0 015.06-5.94M9.9 9.9C8.22 8.22 7 7.5 7 7.5A10.07 10.07 0 0112 4c7 0 11 8 11 8a18.63 18.63 0 01-5.06 5.94M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
        </div>
      </div>

      <!-- Save button -->
      <button 
        class="btn btn-primary w-full save-btn" 
        :class="{ 'btn-success-pulse': saved }"
        @click="saveSettings"
      >
        <Transition name="fade-scale" mode="out-in">
          <div v-if="!saved" key="save" class="btn-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Update API Key</span>
          </div>
          <div v-else key="saved" class="btn-content">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>Configuration Saved!</span>
          </div>
        </Transition>
      </button>

      <!-- Help link -->
      <div class="help-box">
        <div class="help-text">
          <strong>Need a key?</strong>
          <p>Get a free API key in seconds from Google AI Studio.</p>
        </div>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" class="btn btn-outline btn-sm">
          Get API Key ↗
        </a>
      </div>

      <!-- Security note -->
      <div class="security-note">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="lock-icon">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>End-to-end local storage. Your credentials never touch our servers.</span>
      </div>

      <!-- Advanced / Reset -->
      <div v-if="store.isDiagnosed" class="advanced-settings">
        <button class="btn btn-outline btn-block text-error" @click="resetDiagnostic">
          Reset Proficiency & Retake Diagnostic
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-panel {
  max-width: 520px;
  margin: 0 auto;
  width: 100%;
  padding: 1.5rem;
  background: var(--bg-main);
  border-radius: var(--radius-lg);
}

.panel-header {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 2.5rem;
  align-items: flex-start;
}

.header-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: var(--primary-light);
  color: var(--primary-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--primary-border);
}

.header-content h2 {
  margin-bottom: 0.35rem;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.panel-desc {
  color: var(--text-muted);
  font-size: 0.925rem;
  line-height: 1.5;
}

.settings-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.key-input-wrap {
  display: flex;
  align-items: stretch;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border-main);
  transition: all 0.2s ease;
  background: var(--bg-main);
}

.key-input-wrap:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 220, 130, 0.1);
}

.key-field {
  flex: 1;
  padding: 0.85rem 1rem;
  border: none;
  background: transparent;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.9rem;
  color: var(--text-main);
}

.key-field:focus {
  outline: none;
  box-shadow: none;
}

.toggle-visibility {
  padding: 0 1rem;
  display: flex;
  align-items: center;
  background: var(--bg-subtle);
  border: none;
  border-left: 1px solid var(--border-light);
  color: var(--text-subtle);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toggle-visibility:hover {
  color: var(--text-main);
  background: var(--border-light);
}

.save-btn {
  padding: 0.85rem;
  font-size: 1rem;
  font-weight: 700;
}

.help-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  gap: 1rem;
}

.help-text strong {
  display: block;
  font-size: 0.95rem;
  color: var(--text-main);
  margin-bottom: 0.15rem;
}

.help-text p {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0;
}

.btn-sm {
  padding: 0.5rem 0.85rem;
  font-size: 0.825rem;
  white-space: nowrap;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-subtle);
  text-align: center;
}

.lock-icon {
  color: var(--primary);
  opacity: 0.7;
}

@media (max-width: 640px) {
  .settings-panel {
    padding: 1.25rem 1rem;
  }
  
  .panel-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .header-icon-wrap {
    width: 48px;
    height: 48px;
  }

  .header-content h2 {
    font-size: 1.35rem;
  }

  .help-box {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
    gap: 1.25rem;
  }

  .help-text strong {
    font-size: 0.9rem;
  }

  .help-text p {
    font-size: 0.8rem;
  }
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}

.btn-success-pulse {
  background: var(--success) !important;
  border-color: var(--success) !important;
  animation: success-pulse 0.5s ease;
}

@keyframes success-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.25s var(--ease-premium);
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1.1);
}
.text-error {
  color: var(--error) !important;
  border-color: var(--error-alpha) !important;
}

.text-error:hover {
  background: var(--error-bg) !important;
}

.advanced-settings {
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px dashed var(--border-light);
}
</style>
