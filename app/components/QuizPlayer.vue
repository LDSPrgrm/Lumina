<script setup lang="ts">
import { useQuiz, useDashboardSettings } from "~/composables/useQuiz";
import DashboardView from "~/components/DashboardView.vue";
import LoadingView from "~/components/LoadingView.vue";
import QuestionCard from "~/components/QuestionCard.vue";
import ResultView from "~/components/ResultView.vue";
import DiagnosticView from "~/components/DiagnosticView.vue";

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
    if (quiz.isDiagnostic.value) {
      // Calculate level based on score out of 10
      const score = quiz.score.value;
      let calculatedLevel = "A1 (Beginner)";
      
      if (score >= 10) calculatedLevel = "C2";
      else if (score >= 9) calculatedLevel = "C1 (Advanced)";
      else if (score >= 7) calculatedLevel = "B2";
      else if (score >= 5) calculatedLevel = "B1 (Intermediate)";
      else if (score >= 3) calculatedLevel = "A2";
      else calculatedLevel = "A1 (Beginner)";

      store.markAsDiagnosed(calculatedLevel);
      settings.proficiencyLevel.value = calculatedLevel;
      settings.persistToLocalStorage();
      store.isDiagnosticActive = false;
    } else {
      store.addToHistory({
        topic: quiz.quizTitle.value,
        score: quiz.score.value,
        total: quiz.questions.value.length,
        questions: JSON.parse(JSON.stringify(quiz.questions.value))
      });
    }
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

async function handleStartDiagnostic() {
  if (!store.apiKey) {
    store.currentTab = "settings";
    return;
  }
  
  // Persist languages before starting
  settings.persistToStore();
  settings.persistToLocalStorage();
  
  store.isDiagnosticActive = true;
  await quiz.startDiagnosticQuiz(
    store.apiKey, 
    dashboardModel.value.targetLanguage, 
    dashboardModel.value.nativeLanguage
  );
}

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
  store.isDiagnosticActive = false;
}
</script>

<template>
  <div class="lumina-quiz-container">
    <!-- Dashboard: Setup Flow -->
    <DashboardView
      v-if="!isLoading && questions.length === 0 && store.isDiagnosed"
      v-model="dashboardModel"
      @start="handleStart"
    />

    <!-- Diagnostic: Initial Onboarding -->
    <DiagnosticView
      v-if="!isLoading && questions.length === 0 && !store.isDiagnosed"
      v-model="dashboardModel"
      @start="handleStartDiagnostic"
    />

    <!-- Loading: Generation State -->
    <LoadingView v-if="isLoading" />

    <!-- Active Session -->
    <div v-if="!isLoading && questions.length > 0 && !isFinished" class="session-active animate-in">
      <header class="session-nav card-premium glass">
        <div class="nav-left">
          <button class="btn-icon" @click="handleBackToDashboard">✕</button>
          <div class="session-meta">
            <span class="session-title">{{ quiz.quizTitle.value || 'General Session' }}</span>
            <span class="session-counter">Question {{ currentIndex + 1 }} of {{ questions.length }}</span>
          </div>
        </div>

        <div class="nav-center">
          <div class="global-progress">
            <div class="progress-fill" :style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <div class="nav-right">
          <div class="score-pills">
            <div class="pill success">
              <span class="icon">✨</span>
              <span>{{ score }}</span>
            </div>
            <div class="pill error">
              <span class="icon">⚠️</span>
              <span>{{ wrongCount }}</span>
            </div>
          </div>
        </div>
      </header>

      <main class="quiz-body">
        <Transition name="slide-fade" mode="out-in">
          <div :key="currentIndex" class="question-wrapper">
            <QuestionCard
              :question="currentQuestion!"
              :focusArea="focusAreaSetting"
              :quizFormat="quizFormatSetting"
              :selectedOption="selectedOption"
              :hasSubmitted="hasSubmitted"
              @select="handleSelect"
              @submit="handleSubmit"
              @next="handleNext"
            />
          </div>
        </Transition>
      </main>
    </div>

    <!-- Results: Summary -->
    <Transition name="scale-in" mode="out-in">
      <ResultView
        v-if="isFinished"
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
    </Transition>
  </div>
</template>

<style scoped>
.lumina-quiz-container {
  width: 100%;
  max-width: none;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(1rem, 3vw, 2rem) clamp(0.5rem, 2vw, 1rem);
}

.session-active {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  width: 100%;
}

.session-nav {
  display: grid;
  grid-template-columns: minmax(160px, 240px) 1fr minmax(120px, 240px);
  align-items: center;
  padding: 0.75rem 1.5rem;
  position: sticky;
  top: 1rem;
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border-main);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background: var(--bg-subtle);
  color: var(--error);
}

.session-meta {
  display: flex;
  flex-direction: column;
}

.session-title {
  font-weight: 800;
  font-size: 0.9rem;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: min(150px, 30vw);
}

.session-counter {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.nav-center {
  padding: 0 2rem;
}

.global-progress {
  height: 8px;
  background: var(--bg-subtle);
  border-radius: 99px;
  overflow: hidden;
  border: 1px solid var(--border-light);
}

.global-progress .progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 99px;
  transition: width 0.6s var(--ease-premium);
}

.nav-right {
  display: flex;
  justify-content: flex-end;
}

.score-pills {
  display: flex;
  gap: 0.5rem;
}

.pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.85rem;
  border-radius: 99px;
  font-weight: 800;
  font-size: 0.85rem;
  border: 1.5px solid transparent;
}

.pill.success {
  background: var(--success-bg);
  color: var(--success);
  border-color: var(--success-border);
}

.pill.error {
  background: var(--error-bg);
  color: var(--error);
  border-color: var(--error-border);
}

.quiz-body {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
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

@media (max-width: 850px) {
  .session-nav {
    grid-template-columns: 1fr auto;
    gap: 0.75rem;
    padding: 1rem;
  }
  
  .nav-center {
    grid-column: span 2;
    order: 3;
    padding: 0.5rem 0 0;
  }

  .session-title { max-width: 140px; }
}

@media (max-width: 640px) {
  .session-active { gap: 1.5rem; }
  .session-nav { border-radius: var(--radius-md); top: 0.5rem; padding: 0.75rem 1rem; }
  .pill span:not(.icon) { display: none; }
  .pill { padding: 0.35rem 0.6rem; }
  .session-title { max-width: 100px; }
}
</style>
