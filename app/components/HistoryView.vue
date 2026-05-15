<script setup lang="ts">
const store = useSettingsStore();

const emit = defineEmits<{
  retake: [session: any];
}>();

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

function getScoreColor(percentage: number) {
  if (percentage >= 80) return 'var(--success)';
  if (percentage >= 50) return 'var(--warning)';
  return 'var(--error)';
}
</script>

<template>
  <div class="history-view">
    <div class="header-section">
      <h2 class="title-gradient">Learning History</h2>
      <p class="subtitle">Review and retake your past practice sessions</p>
    </div>

    <div v-if="store.quizHistory.length === 0" class="empty-state card-premium glass">
      <div class="empty-icon">📂</div>
      <h3>No sessions yet</h3>
      <p>Your completed quizzes will appear here.</p>
      <button class="btn btn-primary" @click="store.currentTab = 'quiz'">Start Practicing</button>
    </div>

    <div v-else class="history-list">
      <div 
        v-for="session in store.quizHistory" 
        :key="session.id"
        class="history-card card-premium glass"
      >
        <div class="card-left">
          <div class="session-info">
            <span class="session-date">{{ formatDate(session.date) }}</span>
            <h3 class="session-topic">{{ session.topic || 'General Session' }}</h3>
          </div>
          <div class="session-stats">
            <div class="stat">
              <span class="label">Score</span>
              <span class="value" :style="{ color: getScoreColor((session.score / session.total) * 100) }">
                {{ session.score }}/{{ session.total }}
              </span>
            </div>
            <div class="stat">
              <span class="label">Accuracy</span>
              <span class="value">{{ Math.round((session.score / session.total) * 100) }}%</span>
            </div>
          </div>
        </div>

        <div class="card-right">
          <button class="btn btn-outline btn-sm" @click="emit('retake', session)">
            Retake Quiz
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-view {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1.5rem 1rem 4rem 1rem;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.header-section {
  text-align: center;
}

.title-gradient {
  font-size: 2.5rem;
  font-weight: 900;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--text-muted);
  font-size: 1.1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  font-size: 4rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  transition: all 0.3s var(--ease-premium);
}

.history-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
  background: white;
}

.session-date {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.session-topic {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
  margin-top: 0.25rem;
}

.session-stats {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat .label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
}

.stat .value {
  font-size: 1.1rem;
  font-weight: 900;
}

@media (max-width: 640px) {
  .history-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .card-right {
    width: 100%;
  }
  
  .card-right .btn {
    width: 100%;
  }
}
</style>
