<script setup lang="ts">
import { ref } from 'vue';

const store = useSettingsStore();
const apiKey = ref(store.apiKey);
const showKey = ref(false);
const saved = ref(false);

const saveSettings = () => {
  store.setApiKey(apiKey.value);
  saved.value = true;
  setTimeout(() => { saved.value = false; }, 2000);
};

function resetAll() {
  if (confirm('Are you sure? This will clear all history and settings.')) {
    localStorage.clear();
    window.location.reload();
  }
}
</script>

<template>
  <div class="settings-page">
    <div class="settings-container glass-premium animate-in">
      
      <!-- Simplified Header -->
      <header class="settings-header">
        <div class="header-meta">
          <h2 class="text-gradient">Settings</h2>
        </div>
      </header>

      <!-- Main Content Container (Full Height Scrollable) -->
      <div class="settings-scroll-area scroll-container">
        
        <!-- ENGINE SECTION -->
        <section id="api" class="settings-section">
          <div class="engine-display glass-premium">
            <div class="engine-visual">
              <div class="orb-container">
                <div class="orb-outer" :class="{ 'ready': apiKey }"></div>
                <div class="orb-inner" :class="{ 'ready': apiKey }"></div>
                <div class="orb-core" :class="{ 'ready': apiKey }">
                  <span class="core-icon">{{ apiKey ? '⚡' : '◌' }}</span>
                </div>
              </div>
              <div class="engine-status">
                <div class="status-indicator" :class="{ 'active': apiKey }"></div>
                <span class="status-text">{{ apiKey ? 'Engine Ready' : 'Core Offline' }}</span>
              </div>
            </div>

            <div class="engine-config">
              <div class="config-header">
                <h3>Neural Core</h3>
                <p>Lumina is powered by Gemini 1.5 Flash. Securely integrate your private key to begin.</p>
              </div>

              <div class="api-field">
                <div class="field-label-row">
                  <label>Gemini API Key</label>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" class="setup-link">Get Key ↗</a>
                </div>
                <div class="input-glow-group">
                  <input
                    v-model="apiKey"
                    :type="showKey ? 'text' : 'password'"
                    placeholder="Enter secret key..."
                    class="engine-input"
                  />
                  <button class="visibility-btn" @click="showKey = !showKey">
                    <span v-if="showKey">🔒</span>
                    <span v-else>👁️</span>
                  </button>
                </div>
              </div>

              <button 
                class="integration-btn" 
                :class="{ 'success': saved }"
                @click="saveSettings"
                :disabled="!apiKey"
              >
                <div class="btn-inner">
                  <span v-if="saved" class="animate-pop">✓ Integration Successful</span>
                  <span v-else>Update Configuration</span>
                </div>
                <div class="success-glow" v-if="saved"></div>
              </button>
            </div>
          </div>
        </section>

        <!-- LEARNING SECTION -->
        <section id="learning" class="settings-section">
          <div class="section-header">
            <div class="section-icon-wrap">📖</div>
            <div class="section-info">
              <h3>Personalization</h3>
              <p>Fine-tune how Lumina presents language concepts to you.</p>
            </div>
          </div>

          <div class="settings-group">
            <div class="interactive-item card-premium">
              <div class="item-text">
                <h4>Phonetic Assistance</h4>
                <p>Include Romanization (Romaji/Pinyin) and Furigana helpers.</p>
              </div>
              <button 
                class="toggle-premium" 
                :class="{ on: store.includePhonetics }"
                @click="store.includePhonetics = !store.includePhonetics"
              >
                <div class="toggle-slider"></div>
              </button>
            </div>

            <div class="interactive-item card-premium">
              <div class="item-text">
                <h4>Session Length</h4>
                <p>Set the default number of questions for new practices.</p>
              </div>
              <div class="range-wrap">
                <span class="range-val">{{ store.quizLength }}</span>
                <input 
                  type="range" 
                  min="3" max="25" 
                  v-model.number="store.quizLength" 
                  class="styled-range"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- ADVANCED SECTION -->
        <section id="danger" class="settings-section">
          <div class="section-header">
            <div class="section-icon-wrap">🛡️</div>
            <div class="section-info">
              <h3>System & Data</h3>
              <p>Maintenance tools and global reset options.</p>
            </div>
          </div>

          <div class="danger-box">
            <div class="danger-content">
              <div class="danger-label">
                <span class="warn-icon">⚠️</span>
                <h4>Factory Reset</h4>
              </div>
              <p>Irreversibly delete all learning history, preferences, and your API key.</p>
            </div>
            <button class="btn btn-danger-ghost" @click="resetAll">
              Purge All Data
            </button>
          </div>
        </section>

      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.settings-container {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(30px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 32px;
  box-shadow: 
    0 25px 70px -15px rgba(0, 0, 0, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
}

.settings-header {
  padding: 2.5rem 3rem 1.5rem;
  flex-shrink: 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.header-meta h2 {
  font-size: 2rem;
  font-weight: 950;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.02em;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.8rem;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 800;
  color: #64748b;
}

.status-active {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bcf2cd;
}

.status-active::before {
  content: "";
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: pulse-ready 2s infinite;
}

@keyframes pulse-ready {
  0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
  70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
  100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
}

.settings-scroll-area {
  padding: 1rem 3rem 4rem;
}

.settings-section {
  padding: 2.5rem 0;
}

.settings-section:not(:last-child) {
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

/* NEW ENGINE DISPLAY */
.engine-display {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2.5rem;
  padding: 2.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
}

.engine-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 24px;
}

.orb-container {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orb-outer {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px dashed rgba(var(--primary-rgb, 99, 102, 241), 0.2);
  animation: rotate-slow 20s linear infinite;
}

.orb-outer.ready {
  border-style: solid;
  border-color: rgba(var(--primary-rgb, 99, 102, 241), 0.1);
  box-shadow: 0 0 20px rgba(var(--primary-rgb, 99, 102, 241), 0.05);
}

.orb-inner {
  position: absolute;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8), rgba(241, 245, 249, 0.5));
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.5s ease;
}

.orb-inner.ready {
  background: radial-gradient(circle at 30% 30%, white, var(--primary-glow));
  box-shadow: 0 15px 30px var(--primary-glow);
  animation: float 4s ease-in-out infinite;
}

.orb-core {
  position: relative;
  z-index: 2;
  font-size: 1.5rem;
  transition: all 0.5s ease;
  opacity: 0.5;
}

.orb-core.ready {
  opacity: 1;
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px var(--primary));
}

.engine-status {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 1rem;
  background: white;
  border-radius: 99px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
}

.status-indicator.active {
  background: #22c55e;
  box-shadow: 0 0 8px #22c55e;
  animation: pulse-mini 2s infinite;
}

.status-text {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.engine-config {
  display: flex;
  flex-direction: column;
}

.config-header h3 {
  font-size: 1.5rem;
  font-weight: 950;
  margin: 0 0 0.5rem 0;
  color: #1e293b;
}

.config-header p {
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.api-field {
  margin-top: auto;
}

.field-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.field-label-row label {
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #94a3b8;
}

.setup-link {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--primary);
  text-decoration: none;
}

.input-glow-group {
  position: relative;
  display: flex;
  align-items: center;
}

.engine-input {
  width: 100%;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  padding: 1.1rem 1.25rem;
  padding-right: 3.5rem;
  border-radius: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.3s ease;
}

.engine-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-glow);
}

.visibility-btn {
  position: absolute;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
  opacity: 0.4;
  transition: opacity 0.2s;
}

.visibility-btn:hover { opacity: 1; }

.integration-btn {
  margin-top: 1.5rem;
  width: 100%;
  padding: 1.1rem;
  border-radius: 16px;
  background: var(--primary);
  color: white;
  border: none;
  font-weight: 850;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
}

.integration-btn:disabled {
  background: #e2e8f0;
  color: #94a3b8;
  cursor: not-allowed;
}

.integration-btn.success {
  background: #22c55e;
  transform: scale(1.02);
}

.btn-inner {
  position: relative;
  z-index: 1;
}

@keyframes rotate-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes pulse-mini {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.5; }
  100% { transform: scale(1); opacity: 1; }
}

.section-header {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.section-icon-wrap {
  width: 3.5rem;
  height: 3.5rem;
  background: white;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.03);
}

.section-info h3 {
  font-size: 1.4rem;
  font-weight: 900;
  margin: 0 0 0.4rem 0;
  color: #1e293b;
}

.section-info p {
  color: #64748b;
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  max-width: 500px;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.interactive-item {
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.item-text h4 { margin: 0 0 0.3rem 0; font-size: 1.15rem; font-weight: 850; color: #1e293b; }
.item-text p { margin: 0; font-size: 0.9rem; color: #64748b; line-height: 1.5; }

.toggle-premium {
  width: 52px;
  height: 30px;
  background: #e2e8f0;
  border: none;
  border-radius: 100px;
  position: relative;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toggle-premium.on { background: #22c55e; }
.toggle-slider {
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 4px;
  left: 4px;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.toggle-premium.on .toggle-slider { transform: translateX(22px); }

.range-wrap {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  min-width: 200px;
}

.range-val {
  font-size: 1.5rem;
  font-weight: 950;
  color: var(--primary);
  width: 2.2rem;
  font-variant-numeric: tabular-nums;
}

.styled-range {
  flex: 1;
  accent-color: var(--primary);
  height: 6px;
  border-radius: 10px;
  cursor: pointer;
}

.danger-box {
  background: rgba(239, 68, 68, 0.04);
  border: 1px solid rgba(239, 68, 68, 0.1);
  border-radius: 24px;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.danger-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.4rem;
}

.danger-label h4 { margin: 0; color: #ef4444; font-size: 1.1rem; font-weight: 850; }
.warn-icon { font-size: 1.2rem; }
.danger-content p { margin: 0; color: #64748b; font-size: 0.9rem; line-height: 1.5; }

.btn-danger-ghost {
  background: transparent;
  border: 2px solid #ef4444;
  color: #ef4444;
  padding: 0.75rem 1.5rem;
  border-radius: 14px;
  font-weight: 850;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-danger-ghost:hover {
  background: #ef4444;
  color: white;
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.15);
}

@media (max-width: 768px) {
  .settings-page { padding: 0.75rem; }
  .settings-container { border-radius: 24px; }
  .settings-header { padding: 2rem 1.5rem 1rem; }
  .settings-scroll-area { padding: 0.5rem 1.5rem 3rem; }
  
  .engine-display {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .engine-visual {
    padding: 2rem 1rem;
  }

  .section-header { flex-direction: column; gap: 1rem; }
  .interactive-item { flex-direction: column; align-items: flex-start; gap: 1.5rem; padding: 1.5rem; }
  .range-wrap { width: 100%; }
  .danger-box { flex-direction: column; align-items: flex-start; padding: 1.5rem; }
  .btn-danger-ghost { width: 100%; }
}
</style>
