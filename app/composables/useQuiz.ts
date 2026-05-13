import { generateQuiz, generateDiagnosticQuiz, type QuizQuestion } from "~/utils/gemini";

// ── Constants (extracted from QuizPlayer) ────────────────────────────
export const levels = [
  "A1 (Beginner)", "A2", "B1 (Intermediate)", "B2", "C1 (Advanced)", "C2",
];
export const focuses = [
  "Vocabulary", "Grammar", "Practical Phrases", "Slang/Idioms", "Cultural Context",
];
export const formats = ["Multiple Choice", "Translation", "Fill in the blanks"];
export const tones = ["Casual", "Formal", "Business", "Humorous"];
export const scenarios = [
  "Daily Life", "Professional/Work", "Academic", "Travel",
  "Dating/Social", "Emergency/Medical",
];
export const modes = [
  "Friendly (Hints provided)", "Standard", "Challenge (Strict grammar)", "Immersion (No translations)",
];
export const goals = [
  "Conversational", "Business", "Travel", "Academic", "Exam Prep (JLPT/DELE/etc)",
];
export const depths = ["Concise", "Standard", "Detailed", "Academic/Linguistic"];

// ── Dashboard settings state ─────────────────────────────────────────
export function useDashboardSettings() {
  const store = useSettingsStore();

  const targetLanguage = ref(store.targetLanguage);
  const nativeLanguage = ref(store.nativeLanguage);
  const learningGoal = ref(store.learningGoal);
  const regionalDialect = ref(store.regionalDialect);
  const explanationDepth = ref(store.explanationDepth);
  const proficiencyLevel = ref(store.proficiencyLevel);
  const topic = ref(store.topic);
  const quizLength = ref(store.quizLength);
  const focusArea = ref(store.focusArea);
  const quizFormat = ref(store.quizFormat);
  const tone = ref(store.tone);
  const learningScenario = ref(store.learningScenario);
  const difficultyMode = ref(store.difficultyMode);
  const includePhonetics = ref(store.includePhonetics);

  function persistToStore() {
    store.targetLanguage = targetLanguage.value;
    store.nativeLanguage = nativeLanguage.value;
    store.learningGoal = learningGoal.value;
    store.regionalDialect = regionalDialect.value;
    store.explanationDepth = explanationDepth.value;
    store.proficiencyLevel = proficiencyLevel.value;
    store.topic = topic.value;
    store.quizLength = quizLength.value;
    store.focusArea = focusArea.value;
    store.quizFormat = quizFormat.value;
    store.tone = tone.value;
    store.learningScenario = learningScenario.value;
    store.difficultyMode = difficultyMode.value;
    store.includePhonetics = includePhonetics.value;
  }

  function persistToLocalStorage() {
    if (!process.client) return;
    localStorage.setItem("lumina_target_lang", targetLanguage.value);
    localStorage.setItem("lumina_native_lang", nativeLanguage.value);
    localStorage.setItem("lumina_learning_goal", learningGoal.value);
    localStorage.setItem("lumina_regional_dialect", regionalDialect.value);
    localStorage.setItem("lumina_explanation_depth", explanationDepth.value);
    localStorage.setItem("lumina_level", proficiencyLevel.value);
    localStorage.setItem("lumina_topic", topic.value);
    localStorage.setItem("lumina_length", String(quizLength.value));
    localStorage.setItem("lumina_focus_area", focusArea.value);
    localStorage.setItem("lumina_format", quizFormat.value);
    localStorage.setItem("lumina_tone", tone.value);
    localStorage.setItem("lumina_scenario", learningScenario.value);
    localStorage.setItem("lumina_mode", difficultyMode.value);
  }

  return {
    targetLanguage, nativeLanguage, learningGoal, regionalDialect,
    explanationDepth, proficiencyLevel, topic, quizLength, focusArea,
    quizFormat, tone, learningScenario, difficultyMode, includePhonetics,
    persistToStore, persistToLocalStorage,
  };
}

// ── Quiz engine composable ───────────────────────────────────────────
export function useQuiz() {
  const questions = ref<QuizQuestion[]>([]);
  const currentIndex = ref(0);
  const score = ref(0);
  const isLoading = ref(false);
  const isFinished = ref(false);
  const selectedOption = ref<number | null>(null);
  const hasSubmitted = ref(false);
  const quizTitle = ref('');
  const userAnswers = ref<(number | null)[]>([]);

  const isDiagnostic = ref(false);

  const currentQuestion = computed(() => questions.value[currentIndex.value]);
  const progress = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100);
  const scorePercentage = computed(() => {
    if (questions.value.length === 0) return 0;
    return Math.round((score.value / questions.value.length) * 100);
  });
  const wrongCount = computed(() => questions.value.length - score.value);

  const scoreMessage = computed(() => {
    const pct = scorePercentage.value;
    if (pct === 100) return "Perfect! You're a natural!";
    if (pct >= 80) return "Excellent work! Almost there!";
    if (pct >= 60) return "Good progress! Keep practicing!";
    if (pct >= 40) return "Nice try! Review and try again!";
    return "Keep at it — every attempt counts!";
  });

  const scoreEmoji = computed(() => {
    const pct = scorePercentage.value;
    if (pct === 100) return "🌟";
    if (pct >= 80) return "💪";
    if (pct >= 60) return "📈";
    if (pct >= 40) return "🔄";
    return "🌱";
  });

  const scoreColor = computed(() => {
    const pct = scorePercentage.value;
    if (pct >= 80) return "var(--success)";
    if (pct >= 50) return "var(--warning)";
    return "var(--error)";
  });

  function resetState() {
    questions.value = [];
    currentIndex.value = 0;
    score.value = 0;
    isFinished.value = false;
    isDiagnostic.value = false;
    selectedOption.value = null;
    hasSubmitted.value = false;
    quizTitle.value = '';
    userAnswers.value = [];
    if (process.client) {
      localStorage.removeItem('lumina_current_quiz');
    }
  }

  function restartQuiz() {
    currentIndex.value = 0;
    score.value = 0;
    isFinished.value = false;
    selectedOption.value = null;
    hasSubmitted.value = false;
    userAnswers.value = [];
  }

  function saveQuiz() {
    if (!process.client || questions.value.length === 0) return;
    localStorage.setItem('lumina_current_quiz', JSON.stringify({
      questions: questions.value,
      title: quizTitle.value,
      isDiagnostic: isDiagnostic.value
    }));
  }

  function loadSavedQuiz() {
    if (!process.client) return false;
    const saved = localStorage.getItem('lumina_current_quiz');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        questions.value = data.questions;
        quizTitle.value = data.title;
        isDiagnostic.value = data.isDiagnostic || false;
        return true;
      } catch (e) {
        console.error('Failed to parse saved quiz', e);
      }
    }
    return false;
  }

  async function startQuiz(apiKey: string, settings: Record<string, unknown>) {
    if (!apiKey) return false;

    isLoading.value = true;
    resetState();

    try {
      questions.value = await generateQuiz(
        apiKey as string,
        settings.targetLanguage as string,
        settings.proficiencyLevel as string,
        settings.topic as string,
        settings.quizLength as number,
        settings.focusArea as string,
        settings.quizFormat as string,
        settings.tone as string,
        settings.learningScenario as string,
        settings.difficultyMode as string,
        settings.includePhonetics as boolean,
        settings.nativeLanguage as string,
        settings.learningGoal as string,
        settings.regionalDialect as string,
        settings.explanationDepth as string,
      );
      quizTitle.value = settings.topic as string || 'General Session';
      saveQuiz();
    } catch (error) {
      alert("Failed to generate quiz. Check your API key or connection.");
      console.error(error);
    } finally {
      isLoading.value = false;
    }

    return true;
  }
  
  async function startDiagnosticQuiz(apiKey: string, targetLanguage: string, nativeLanguage: string) {
    if (!apiKey) return false;

    isLoading.value = true;
    resetState();
    isDiagnostic.value = true;

    try {
      questions.value = await generateDiagnosticQuiz(apiKey, targetLanguage, nativeLanguage);
      quizTitle.value = `Diagnostic: ${targetLanguage}`;
      saveQuiz();
    } catch (error) {
      alert("Failed to generate diagnostic quiz. Check your API key or connection.");
      console.error(error);
    } finally {
      isLoading.value = false;
    }

    return true;
  }

  function loadQuiz(data: { questions: QuizQuestion[], title: string }) {
    questions.value = data.questions;
    quizTitle.value = data.title;
    restartQuiz();
    saveQuiz();
  }

  function submitAnswer() {
    const question = currentQuestion.value;
    if (selectedOption.value === null || !question) return;

    hasSubmitted.value = true;
    userAnswers.value[currentIndex.value] = selectedOption.value;
    if (selectedOption.value === question.correctIndex) {
      score.value++;
    }
  }

  function nextQuestion() {
    if (currentIndex.value < questions.value.length - 1) {
      currentIndex.value++;
      selectedOption.value = null;
      hasSubmitted.value = false;
    } else {
      isFinished.value = true;
    }
  }

  return {
    questions, currentIndex, score, isLoading, isFinished, isDiagnostic,
    selectedOption, hasSubmitted, currentQuestion, progress,
    scorePercentage, wrongCount, scoreMessage, scoreEmoji, scoreColor,
    quizTitle, userAnswers,
    resetState, restartQuiz, startQuiz, startDiagnosticQuiz, submitAnswer, nextQuestion,
    loadSavedQuiz, saveQuiz, loadQuiz
  };
}
