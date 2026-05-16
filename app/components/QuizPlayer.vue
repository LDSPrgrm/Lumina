<script setup lang="ts">
import { useQuiz, useDashboardSettings } from "~/composables/useQuiz";
import DashboardView from "~/components/DashboardView.vue";
import LoadingView from "~/components/LoadingView.vue";
import QuestionCard from "~/components/QuestionCard.vue";
import ResultView from "~/components/ResultView.vue";
import LuminaToken from "~/components/LuminaToken.vue";

const store = useSettingsStore();

// ── Quiz state ───────────────────────────────────────────────────────
const quiz = useQuiz();
const { 
  questions, currentIndex, score, isLoading, isFinished, 
  selectedOption, hasSubmitted, currentQuestion, progress, 
  scorePercentage, wrongCount, scoreMessage, scoreEmoji, scoreColor,
  userAnswers 
} = quiz;

// ── Settings state ───────────────────────────────────────────────────
const settings = useDashboardSettings();

const dashboardModel = computed({
  get: () => ({
    targetLanguage: settings.targetLanguage.value,
    nativeLanguage: settings.nativeLanguage.value,
    learningGoal: settings.learningGoal.value,
    regionalDialect: settings.regionalDialect.value,
    proficiencyLevel: settings.proficiencyLevel.value,
    topic: settings.topic.value,
    quizLength: settings.quizLength.value,
    focusArea: settings.focusArea.value,
    quizFormat: settings.quizFormat.value,
    tone: settings.tone.value,
    learningScenario: settings.learningScenario.value,
    difficultyMode: settings.difficultyMode.value,
    explanationDepth: settings.explanationDepth.value,
    includePhonetics: settings.includePhonetics.value,
  }),
  set: (val) => {
    if (!val) return;
    settings.targetLanguage.value = val.targetLanguage;
    settings.nativeLanguage.value = val.nativeLanguage;
    settings.learningGoal.value = val.learningGoal;
    settings.regionalDialect.value = val.regionalDialect;
    settings.proficiencyLevel.value = val.proficiencyLevel;
    settings.topic.value = val.topic;
    settings.quizLength.value = val.quizLength;
    settings.focusArea.value = val.focusArea;
    settings.quizFormat.value = val.quizFormat;
    settings.tone.value = val.tone;
    settings.learningScenario.value = val.learningScenario;
    settings.difficultyMode.value = val.difficultyMode;
    settings.explanationDepth.value = val.explanationDepth;
    settings.includePhonetics.value = val.includePhonetics;
  },
});

onMounted(() => {
  if (process.client) {
    settings.targetLanguage.value = localStorage.getItem("lumina_target_lang") || settings.targetLanguage.value;
    settings.nativeLanguage.value = localStorage.getItem("lumina_native_lang") || settings.nativeLanguage.value;
    settings.learningGoal.value = localStorage.getItem("lumina_learning_goal") || settings.learningGoal.value;
    settings.regionalDialect.value = localStorage.getItem("lumina_regional_dialect") || settings.regionalDialect.value;
    settings.explanationDepth.value = localStorage.getItem("lumina_explanation_depth") || settings.explanationDepth.value;
    settings.proficiencyLevel.value = localStorage.getItem("lumina_level") || settings.proficiencyLevel.value;
    settings.topic.value = localStorage.getItem("lumina_topic") || settings.topic.value;
    const len = parseInt(localStorage.getItem("lumina_length") || String(settings.quizLength.value));
    if (!isNaN(len)) settings.quizLength.value = len;
    settings.focusArea.value = localStorage.getItem("lumina_focus_area") || settings.focusArea.value;
    settings.quizFormat.value = localStorage.getItem("lumina_format") || settings.quizFormat.value;
    settings.tone.value = localStorage.getItem("lumina_tone") || settings.tone.value;
    settings.learningScenario.value = localStorage.getItem("lumina_scenario") || settings.learningScenario.value;
    settings.difficultyMode.value = localStorage.getItem("lumina_mode") || settings.difficultyMode.value;
    
    // Auto-load current quiz if it exists
    quiz.loadSavedQuiz();

    // Check for pending quiz from history
    if (store.pendingQuiz) {
      quiz.loadQuiz(store.pendingQuiz);
      store.pendingQuiz = null;
    }
  }
});

// Save to history when finished
watch(isFinished, (val) => {
  if (val) {
    store.addToHistory({
      topic: quiz.quizTitle.value,
      score: quiz.score.value,
      total: quiz.questions.value.length,
      questions: JSON.parse(JSON.stringify(quiz.questions.value))
    });
  }
});

const { focusArea: focusAreaSetting, quizFormat: quizFormatSetting } = settings;
const showReview = ref(false);

async function handleStart() {
  if (!store.apiKey) {
    store.currentTab = "settings";
    return;
  }
  settings.persistToStore();
  settings.persistToLocalStorage();
  await quiz.startQuiz(store.apiKey, {
    ...dashboardModel.value
  });
}



const isWaking = ref(false);
watch(selectedOption, (newVal, oldVal) => {
  if (newVal !== null && oldVal === null) {
    isWaking.value = true;
    setTimeout(() => { isWaking.value = false; }, 600);
  }
});

function handleSelect(index: number) { selectedOption.value = index; }
function handleSubmit() { quiz.submitAnswer(); }
function handleNext() { quiz.nextQuestion(); }
function handleNewSession() {
  quiz.resetState();
  handleStart();
}
function handleRestart() {
  quiz.restartQuiz();
}
function handleBackToDashboard() { 
  quiz.resetState(); 
}

</script>

<template>
  <div class="lumina-quiz-container">
    <!-- Dashboard: Setup Flow -->
    <DashboardView
      v-if="!isLoading && questions.length === 0"
      v-model="dashboardModel"
      @start="handleStart"
    />

    <!-- Loading: Generation State -->
    <LoadingView v-if="isLoading" />

    <!-- Active Session -->
    <template v-if="!isLoading && questions.length > 0 && !isFinished">
      <header class="session-nav glass-premium">
        <!-- Left: Exit & Topic -->
        <div class="nav-left">
          <button class="btn-exit-sleek" @click="handleBackToDashboard" title="Exit Practice">
            <span class="exit-icon">✕</span>
            <span class="exit-text">Exit</span>
          </button>
          <div class="nav-divider"></div>
          <div class="session-info">
            <span class="session-label">Session</span>
            <span class="session-topic">{{ quiz.quizTitle.value || 'General Practice' }}</span>
          </div>
        </div>

        <!-- Center: Question Tracker -->
        <div class="nav-center">
          <div class="hud-tracker">
            <div class="counter-display">
              <span class="current-idx">{{ String(currentIndex + 1).padStart(2, '0') }}</span>
              <span class="separator">/</span>
              <span class="total-count">{{ questions.length }}</span>
            </div>
            <div class="tracker-label">Question</div>
          </div>
        </div>

        <!-- Right: Live Scores -->
        <div class="nav-right">
          <div class="score-hud">
            <div class="hud-item correct" :class="{ 'active': score > 0 }">
              <span class="hud-icon">✓</span>
              <span class="hud-val">{{ score }}</span>
            </div>
            <div class="hud-item wrong" :class="{ 'active': wrongCount > 0 }">
              <span class="hud-icon">✕</span>
              <span class="hud-val">{{ wrongCount }}</span>
            </div>
          </div>
        </div>

        <!-- Progress Strip -->
        <div class="status-strip">
          <div class="strip-fill" :style="{ width: progress + '%' }"></div>
        </div>
      </header>

      <div class="quiz-body scroll-y">
        <!-- 1. Quiz Container -->
        <div class="quiz-container">
          <QuestionCard
            :key="currentIndex"
            :question="currentQuestion!"
            :focusArea="settings.focusArea.value"
            :quizFormat="settings.quizFormat.value"
            :selectedOption="selectedOption"
            :hasSubmitted="hasSubmitted"
            @select="handleSelect"
            @submit="handleSubmit"
            @next="handleNext"
          />
        </div>

        <!-- 2. Explanation Container -->
        <div v-if="hasSubmitted" class="explanation-container">
          <div class="explanation-body" :class="selectedOption === currentQuestion?.correctIndex ? 'success-theme' : 'error-theme'">
            <p class="explanation-text">{{ currentQuestion?.explanation }}</p>
          </div>
        </div>

      </div>

      <!-- Simple Fixed Bottom Action Bar -->
      <footer class="quiz-action-bar" :class="{ 'has-submitted': hasSubmitted, 'is-correct': hasSubmitted && selectedOption === currentQuestion?.correctIndex, 'is-wrong': hasSubmitted && selectedOption !== currentQuestion?.correctIndex }">
        <div class="action-bar-content">
          <div class="action-buttons">
            <button 
              v-if="!hasSubmitted" 
              class="btn btn-primary btn-xl btn-hero" 
              :class="{ 
                'animate-pulse-ready': selectedOption !== null && !isWaking, 
                'animate-wake-up': isWaking,
                'is-dormant': selectedOption === null 
              }"
              :disabled="selectedOption === null"
              @click="handleSubmit"
            >
              <div class="btn-shimmer shimmer-effect"></div>
              <span>Check Answer</span>
              <span class="btn-arrow">➜</span>
            </button>
            <button 
              v-else 
              class="btn btn-primary btn-xl btn-hero animate-pulse-ready" 
              @click="handleNext"
            >
              <div class="btn-shimmer shimmer-effect"></div>
              <span>{{ currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question' }}</span>
              <span class="btn-arrow">{{ currentIndex === questions.length - 1 ? '✨' : '🚀' }}</span>
            </button>
          </div>
        </div>
      </footer>
    </template>

    <!-- Results: Summary -->
    <Transition name="scale-in" mode="out-in">
      <div v-if="isFinished" class="session-results scroll-y">
        <ResultView
          key="result"
          :score="score"
          :totalQuestions="questions.length"
          :scorePercentage="scorePercentage"
          :scoreMessage="scoreMessage"
          :scoreEmoji="scoreEmoji"
          :wrongCount="wrongCount"
          :questions="questions"
          :userAnswers="userAnswers"
          :scoreColor="scoreColor"
          :showReview="showReview"
          @update:showReview="(v:boolean)=>showReview=v"
          @newSession="handleNewSession"
          @restart="handleRestart"
          @backToDashboard="handleBackToDashboard"
        />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.lumina-quiz-container {
  width: 100%;
  max-width: none;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-page);
}



.session-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  z-index: 1000;
  flex-shrink: 0;
  position: relative;
  height: 80px; /* Increased for better breathing room */
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.glass-premium {
  box-shadow: 
    0 4px 30px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
}

.btn-exit-sleek {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #64748b;
  font-family: inherit;
}

.btn-exit-sleek:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #ef4444;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.exit-icon { font-size: 0.9rem; font-weight: 800; }
.exit-text { font-size: 0.9rem; font-weight: 700; }

.nav-divider {
  width: 1px;
  height: 32px;
  background: linear-gradient(to bottom, transparent, #e2e8f0, transparent);
}

.session-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.session-label {
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #94a3b8;
}

.session-topic {
  font-size: 1rem;
  font-weight: 800;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

/* HUD Tracker (Center) */
.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.hud-tracker {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.5rem 2rem;
  background: white;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.counter-display {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.current-idx {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--primary);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.separator {
  font-size: 0.9rem;
  color: #cbd5e1;
  font-weight: 500;
}

.total-count {
  font-size: 1rem;
  font-weight: 700;
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}

.tracker-label {
  font-size: 0.6rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #94a3b8;
  margin-top: -2px;
}

/* Score HUD (Right) */
.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.score-hud {
  display: flex;
  gap: 0.75rem;
}

.hud-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  min-width: 60px;
  justify-content: center;
}

.hud-icon {
  font-size: 0.8rem;
  opacity: 0.4;
}

.hud-val {
  font-size: 1rem;
  font-weight: 900;
  color: #64748b;
  font-variant-numeric: tabular-nums;
}

.hud-item.correct.active {
  background: #f0fdf4;
  border-color: #bcf2cd;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.12);
}
.hud-item.correct.active .hud-icon { color: #22c55e; opacity: 1; }
.hud-item.correct.active .hud-val { color: #166534; }

.hud-item.wrong.active {
  background: #fef2f2;
  border-color: #fecaca;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.12);
}
.hud-item.wrong.active .hud-icon { color: #ef4444; opacity: 1; }
.hud-item.wrong.active .hud-val { color: #991b1b; }

/* Status Strip */
.status-strip {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: #f1f5f9;
}

.strip-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #3b82f6);
  transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
}

.strip-fill::after {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6));
  filter: blur(4px);
  animation: strip-shimmer 2s infinite linear;
}

@keyframes strip-shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.quiz-body {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding: 1.5rem 1.5rem;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 1. Quiz Container */
.quiz-container {
  width: 100%;
  flex-shrink: 0;
}

/* 2. Explanation Container */
.explanation-container {
  width: 100%;
  flex-shrink: 0;
  animation: slide-up 0.4s var(--ease-premium);
}

.explanation-body {
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--text-main);
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-light);
}

.explanation-body.success-theme {
  border-left: 6px solid var(--success);
}

.explanation-body.error-theme {
  border-left: 6px solid var(--error);
}

.explanation-text {
  padding: 2rem;
  margin: 0;
}


/* Fixed Bottom Action Bar */
.quiz-action-bar {
  flex-shrink: 0;
  padding: 0.75rem 2rem;
  z-index: 1000;
  border-top: 1px solid var(--border-main);
  display: flex;
  justify-content: center;
  transition: all 0.4s var(--ease-premium);
  background: white;
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.04);
}

.quiz-action-bar.is-correct {
  background: rgba(240, 253, 244, 0.98);
  border-top: 2px solid var(--success);
}

.quiz-action-bar.is-wrong {
  background: rgba(254, 242, 242, 0.98);
  border-top: 2px solid var(--error);
}

.action-bar-content {
  width: 100%;
  max-width: 800px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-buttons {
  width: 100%;
  max-width: 400px;
}

/* Hero Button Styling */
.btn-hero {
  padding: 0.8rem 2.5rem;
  font-size: 1.1rem;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary), #00c071);
  box-shadow: 
    0 4px 15px rgba(0, 220, 130, 0.3),
    0 10px 20px -10px rgba(0, 0, 0, 0.2);
  border: none;
  position: relative;
  overflow: hidden;
  color: white;
  transition: all 0.4s var(--ease-premium);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-hero.is-dormant {
  background: #e2e8f0;
  color: #94a3b8;
  box-shadow: none;
  opacity: 0.5;
  transform: scale(0.96);
  filter: grayscale(1);
}

.btn-shimmer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.3;
}

.btn-hero:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 8px 25px rgba(0, 220, 130, 0.4),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1);
}

.btn-hero:active:not(:disabled) {
  transform: translateY(1px) scale(0.98);
}

.btn-hero:disabled {
  cursor: not-allowed;
}

.btn-arrow {
  transition: transform 0.3s var(--ease-premium);
  font-size: 1.25rem;
}

.btn-hero:hover .btn-arrow {
  transform: translateX(4px);
}

.btn-xl {
  min-width: 240px;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s var(--ease-premium);
}

.slide-up-enter-from { opacity: 0; transform: translateY(30px) scale(0.95); }
.slide-up-leave-to { opacity: 0; transform: translateY(-30px) scale(0.95); }

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

.fade-fast-enter-active,
.fade-fast-leave-active {
  transition: opacity 0.2s var(--ease-premium);
}

.fade-fast-enter-from,
.fade-fast-leave-to {
  opacity: 0;
}


@media (max-width: 900px) {
  .session-nav { padding: 0 1.25rem; }
  .session-topic { max-width: 160px; }
  .hud-tracker { padding: 0.4rem 1.25rem; }
}

@media (max-width: 768px) {
  .session-nav { height: 72px; padding: 0 1rem; }
  .session-label, .tracker-label { display: none; }
  .exit-text { display: none; }
  .btn-exit-sleek { padding: 0.5rem; border-radius: 10px; }
  .nav-divider { height: 20px; gap: 0.75rem; }
  .nav-left { gap: 0.75rem; }
  
  .hud-tracker { padding: 0.4rem 0.75rem; }
  .current-idx { font-size: 1.25rem; }
  
  .score-hud { gap: 0.5rem; }
  .hud-item { padding: 0.4rem 0.6rem; min-width: 45px; gap: 0.4rem; }
  .hud-val { font-size: 0.9rem; }

  .action-bar-content { flex-direction: column; gap: 1rem; }
  .action-buttons { width: 100%; max-width: none; }
  .btn-xl { width: 100%; min-width: 0; }
  .quiz-body { padding: 1rem; }
  .quiz-action-bar { padding: 1rem 1.5rem; }
}

@media (max-width: 480px) {
  .session-topic { display: none; }
  .nav-divider { display: none; }
  .hud-tracker { background: transparent; border: none; box-shadow: none; padding: 0; }
}
</style>
