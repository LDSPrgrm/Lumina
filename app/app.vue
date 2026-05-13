<script setup lang="ts">
const store = useSettingsStore();

onMounted(() => {
  store.loadSettings();
  store.loadHistory();
});

function handleRetake(session: any) {
  store.pendingQuiz = {
    questions: session.questions,
    title: session.topic
  };
  store.currentTab = 'quiz';
}
</script>

<template>
  <div class="app-container">
    <AppHeader>
      <template #nav>
        <!-- Segmented control nav -->
        <div class="pill-nav" role="tablist" aria-label="Main navigation">
          <button
            class="pill-btn"
            :class="{ active: store.currentTab === 'quiz' }"
            @click="store.currentTab = 'quiz'"
            role="tab"
            :aria-selected="store.currentTab === 'quiz'"
          >
            Practice
          </button>
          <button
            class="pill-btn"
            :class="{ active: store.currentTab === 'settings' }"
            @click="store.currentTab = 'settings'"
            role="tab"
            :aria-selected="store.currentTab === 'settings'"
          >
            Settings
          </button>
          <button
            class="pill-btn"
            :class="{ active: store.currentTab === 'history' }"
            @click="store.currentTab = 'history'"
            role="tab"
            :aria-selected="store.currentTab === 'history'"
          >
            History
          </button>
        </div>
      </template>
    </AppHeader>

    <main class="container">
      <!-- Onboarding Screen -->
      <div
        v-if="!store.isConfigured && store.currentTab !== 'settings'"
        class="onboarding glass-card animate-fade-in-up"
      >
        <div class="onboarding-content">
          <div class="welcome-badge animate-scale-in">
            <span class="badge badge-completed">Private & Secure</span>
          </div>

          <h1 class="onboarding-title">Master Languages with Gemini</h1>

          <p class="onboarding-desc">
            Personalized quizzes powered by Google Gemini Flash. Get started by configuring your free API key.
          </p>

          <div class="feature-steps">
            <div class="step">
              <div class="step-num">1</div>
              <span class="step-text">Get a free API key from Google AI Studio</span>
            </div>
            <div class="step">
              <div class="step-num">2</div>
              <span class="step-text">Paste it in settings — takes 5 seconds</span>
            </div>
            <div class="step">
              <div class="step-num">3</div>
              <span class="step-text">Start learning instantly</span>
            </div>
          </div>

          <div class="actions">
            <button class="btn btn-primary" @click="store.currentTab = 'settings'">
              Configure Now
            </button>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              class="btn btn-outline"
            >
              Get Free Key
            </a>
          </div>
        </div>
      </div>

      <div v-else class="content-wrapper">
        <QuizPlayer v-if="store.currentTab === 'quiz'" />
        <SettingsPanel v-if="store.currentTab === 'settings'" />
        <HistoryView v-if="store.currentTab === 'history'" @retake="handleRetake" />
      </div>
    </main>

    <footer class="app-footer glass">
      <div class="footer-content">
        <div class="footer-brand">
          <span class="brand-dot"></span>
          <span class="brand-text">Lumina AI</span>
        </div>
        <p class="footer-copy">&copy; 2026 Linguist Pro — Personalize your language journey.</p>
        <div class="footer-links">
          <span class="footer-tag">Powered by Gemini Flash</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 0;
}

main.container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
  /* Prevent full-page scroll if content fits */
  overflow-y: auto;
  overflow-x: hidden;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Segmented nav */
.pill-nav {
  display: inline-flex;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 3px;
  gap: 2px;
}

.pill-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: none;
  padding: 0.4rem 1.15rem;
  border-radius: 7px;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-btn:hover {
  color: var(--text-main);
}

.pill-btn.active {
  background: var(--bg-main);
  color: var(--primary);
  box-shadow: var(--shadow-sm);
}

/* Onboarding */
.onboarding {
  max-width: 540px;
  width: 100%;
  margin: 4rem auto;
  padding: 3rem;
  text-align: center;
}

.onboarding-content {
  position: relative;
  z-index: 1;
}

.onboarding-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.onboarding-desc {
  font-size: 1.05rem;
  color: var(--text-muted);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.feature-steps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-subtle);
  border-radius: var(--radius-md);
  text-align: left;
}

.step-num {
  width: 24px;
  height: 24px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: var(--text-subtle);
}

.app-footer {
  margin-top: auto;
  padding: 3rem 1rem;
  border-top: 1px solid var(--border-light);
}

.footer-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.brand-dot {
  width: 10px;
  height: 10px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 15px var(--primary-glow);
}

.brand-text {
  font-weight: 900;
  font-size: 1.25rem;
  letter-spacing: -0.03em;
  color: var(--text-main);
}

.footer-copy {
  color: var(--text-subtle);
  font-size: 0.95rem;
  font-weight: 500;
}

.footer-tag {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  background: var(--bg-subtle);
  padding: 0.35rem 0.85rem;
  border-radius: 99px;
  border: 1px solid var(--border-light);
}

@media (max-width: 640px) {
  .onboarding {
    padding: 1.5rem;
    margin: 1rem;
  }

  .onboarding-title {
    font-size: 1.8rem;
  }

  .actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .pill-nav {
    width: 100%;
    display: flex;
  }
  
  .pill-btn {
    flex: 1;
    justify-content: center;
  }
  
  .app-footer {
    padding: 1.5rem 1rem;
  }
}
</style>
