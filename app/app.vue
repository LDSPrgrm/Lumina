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
      <template #nav v-if="store.isConfigured">
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

    <!-- Main Content Area -->
    <main class="app-main">
      <OnboardingView v-if="!store.isConfigured" />
      <Transition v-else name="page-fade" mode="out-in">
        <div :key="store.currentTab" class="view-container">
          <QuizPlayer v-if="store.currentTab === 'quiz'" />
          <SettingsPanel v-if="store.currentTab === 'settings'" />
          <HistoryView v-if="store.currentTab === 'history'" @retake="handleRetake" />
        </div>
      </Transition>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 0;
  overflow: hidden; 
}

.app-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.view-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
}

/* Page Transitions */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s var(--ease-premium), transform 0.3s var(--ease-premium);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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
  background: white;
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

.welcome-badge {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: center;
}

.onboarding-title {
  font-size: clamp(1.75rem, 8vw, 2.5rem);
  font-weight: 900;
  color: var(--text-main);
  margin-bottom: 1rem;
  letter-spacing: -0.04em;
  line-height: 1.1;
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

@media (max-width: 640px) {
  .onboarding {
    padding: 1.5rem;
    margin: 1rem auto;
    border-radius: 20px;
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
}
</style>
