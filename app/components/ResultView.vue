<script setup lang="ts">
import type { QuizQuestion } from "~/utils/gemini";
const store = useSettingsStore();

const props = defineProps<{
  score: number;
  totalQuestions: number;
  scorePercentage: number;
  scoreMessage: string;
  scoreEmoji: string;
  wrongCount: number;
  questions: QuizQuestion[];
  userAnswers: (number | null)[];
  scoreColor: string;
  showReview: boolean;
}>();

// Premium segment colors for the orbital ring
const quadrantColors = ['#00dc82', '#3b82f6', '#8b5cf6', '#f59e0b'];

const emit = defineEmits<{
  'update:showReview': [value: boolean];
  newSession: [];
  restart: [];
  backToDashboard: [];
}>();

const suggestedLevel = computed(() => {
  const score = props.score;
  // Consistent logic with QuizPlayer/useQuiz
  if (score >= 10) return "C2";
  if (score >= 9) return "C1 (Advanced)";
  if (score >= 7) return "B2";
  if (score >= 5) return "B1 (Intermediate)";
  if (score >= 3) return "A2";
  return "A1 (Beginner)";
});

const levelDescription = computed(() => {
  const level = suggestedLevel.value;
  if (level.includes("A1")) return "Beginner: You're just starting out!";
  if (level.includes("A2")) return "Elementary: You know the basics.";
  if (level.includes("B1")) return "Intermediate: You can handle daily situations.";
  if (level.includes("B2")) return "Upper Intermediate: You're becoming fluent.";
  if (level.includes("C1")) return "Advanced: You have strong command.";
  return "Mastery: You're almost a native speaker!";
});

function handleApplyLevel() {
  store.markAsDiagnosed(suggestedLevel.value);
  store.isDiagnosticActive = false;
  emit('backToDashboard');
}

function highlightAnswer(q: QuizQuestion) {
  if (!q.question.includes('____')) return q.question;
  const correctOption = q.options[q.correctIndex];
  return q.question.replace('____', `<span class="highlight-success">${correctOption?.text || ''}</span>`);
}
</script>

<template>
  <div class="lumina-result-view animate-in">
    <!-- Header: Celebration -->
    <div class="result-celebration card-premium glass">
      <div class="score-orbit">
        <div class="orbit-ring" :style="{ '--color': scoreColor, '--percent': scorePercentage }">
          <svg viewBox="0 0 100 100">
            <!-- Background track -->
            <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border-light)" stroke-width="5" />
            
            <!-- Multi-colored quadrant segments (decorative) -->
            <circle v-for="(color, i) in quadrantColors" :key="i"
              cx="50" cy="50" r="45"
              fill="none"
              :stroke="color"
              stroke-width="2"
              stroke-dasharray="70 213"
              :stroke-dashoffset="-(i * 70.75)"
              transform="rotate(-90 50 50)"
              style="opacity: 0.2;"
            />

            <!-- Primary Progress Ring -->
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              :stroke="scoreColor"
              stroke-width="6"
              stroke-linecap="round"
              stroke-dasharray="283"
              :stroke-dashoffset="283 - (283 * scorePercentage) / 100"
              transform="rotate(-90 50 50)"
              class="orbit-progress"
            />
          </svg>
          <div class="orbit-content">
            <span class="percentage">{{ scorePercentage }}%</span>
            <span class="ratio">{{ score }}/{{ totalQuestions }}</span>
          </div>
        </div>
      </div>

      <div class="celebration-text">
        <h1 class="text-gradient">{{ scoreMessage }}</h1>
        <div class="result-emoji animate-bounce-premium">{{ scoreEmoji }}</div>
        <p class="summary">
          You've completed your session on <strong>{{ questions[0]?.topic || 'New Topics' }}</strong>.
          <span v-if="wrongCount > 0"> You mastered most of the material!</span>
        </p>
      </div>

      <div v-if="store.isDiagnosticActive" class="diagnostic-result card-premium animate-scale-in">
        <div class="level-badge">{{ suggestedLevel }}</div>
        <h2>Suggested Level: {{ suggestedLevel }}</h2>
        <p>{{ levelDescription }}</p>
        <button class="btn btn-primary btn-lg" @click="handleApplyLevel">
          Save Level & Start Learning
        </button>
      </div>

      <div v-else class="result-actions">
        <button class="btn btn-primary start-pulse" @click="$emit('newSession')">
          New Session
        </button>
        <button class="btn btn-outline" @click="$emit('restart')">
          Retake Quiz
        </button>
        <button class="btn btn-outline" @click="$emit('backToDashboard')">
          Back to Dashboard
        </button>
      </div>
    </div>

    <!-- Review Section -->
    <div class="review-area">
      <div class="section-header">
        <h3>Session Review</h3>
        <button class="btn btn-outline btn-sm" @click="emit('update:showReview', !showReview)">
          {{ showReview ? 'Hide' : 'Show' }} Details
        </button>
      </div>

      <Transition name="fade">
        <div v-if="showReview" class="review-grid">
          <div
            v-for="(q, idx) in questions"
            :key="idx"
            class="review-card card-premium"
          >
            <div class="review-meta">
              <span class="q-num">Q{{ idx + 1 }}</span>
              <span class="q-status" :class="userAnswers[idx] === q.correctIndex ? 'success' : 'error'">
                {{ userAnswers[idx] === q.correctIndex ? 'Mastered' : 'Incorrect' }}
              </span>
            </div>
            
            <p class="q-text" v-html="highlightAnswer(q)"></p>

            <div v-if="userAnswers[idx] !== q.correctIndex && userAnswers[idx] !== null" class="q-answer-box error">
              <span class="label">Your Answer</span>
              <div class="answer-tokens">
                <div class="phrase-row">
                  <span
                    v-for="(token, tIdx) in q.options[userAnswers[idx]!]?.tokens"
                    :key="tIdx"
                    class="token-wrapper"
                  >
                    <span class="token-premium" :class="`token-${token.colorIndex}`" tabindex="0">
                      <ruby v-if="token.reading && token.text !== token.reading">
                        {{ token.text }}
                        <rt>{{ token.reading }}</rt>
                      </ruby>
                      <span v-else>{{ token.text }}</span>
                      <span class="token-tooltip">{{ token.meaning }}</span>
                    </span>
                  </span>
                </div>
              </div>
            </div>
            
            <div class="q-answer-box success">
              <span class="label">Correct Answer</span>
              <div class="answer-tokens">
                <div class="phrase-row">
                  <span
                    v-for="(token, tIdx) in q.options[q.correctIndex]?.tokens"
                    :key="tIdx"
                    class="token-wrapper"
                  >
                    <span class="token-premium" :class="`token-${token.colorIndex}`" tabindex="0">
                      <ruby v-if="token.reading && token.text !== token.reading">
                        {{ token.text }}
                        <rt>{{ token.reading }}</rt>
                      </ruby>
                      <span v-else>{{ token.text }}</span>
                      <span class="token-tooltip">{{ token.meaning }}</span>
                    </span>
                  </span>
                </div>
                
                <!-- Romaji Row -->
                <div v-if="q.options[q.correctIndex]?.romajiTokens?.length" class="romaji-row">
                  <span 
                    v-for="(token, tIdx) in q.options[q.correctIndex]?.romajiTokens" 
                    :key="'r' + tIdx"
                    class="token-simple"
                    :class="`token-${token.colorIndex}`"
                  >
                    {{ token.text }}&nbsp;
                  </span>
                </div>
                <div v-else class="romaji-row">
                  {{ q.options[q.correctIndex]?.romaji }}
                </div>

                <!-- English Row -->
                <div v-if="q.options[q.correctIndex]?.englishTokens?.length" class="english-row">
                  <span 
                    v-for="(token, tIdx) in q.options[q.correctIndex]?.englishTokens" 
                    :key="'e' + tIdx"
                    class="token-simple"
                    :class="`token-${token.colorIndex}`"
                  >
                    {{ token.text }}&nbsp;
                  </span>
                </div>
                <div v-else class="english-row">
                  {{ q.options[q.correctIndex]?.english }}
                </div>
              </div>
            </div>
            
            <div v-if="q.explanation" class="q-explanation">
              <p>{{ q.explanation }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.lumina-result-view {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  padding: 1rem;
}

.result-celebration {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  gap: 2.5rem;
}

.score-orbit {
  position: relative;
  width: 200px;
  height: 200px;
}

.orbit-ring {
  width: 100%;
  height: 100%;
  position: relative;
}

.orbit-progress {
  transition: stroke-dashoffset 1.5s var(--ease-premium);
}

.orbit-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.percentage {
  font-size: 3rem;
  font-weight: 900;
  color: var(--text-main);
  letter-spacing: -0.04em;
  line-height: 1;
}

.ratio {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.celebration-text h1 {
  font-size: clamp(2rem, 8vw, 3.5rem);
  margin-bottom: 0.75rem;
}

.celebration-text .summary {
  font-size: 1.125rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  text-align: center;
  display: block;
}

.result-emoji {
  font-size: 4rem;
  margin: 1rem 0;
  line-height: 1;
  font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", sans-serif;
}

.animate-bounce-premium {
  animation: bounce-premium 2s infinite var(--ease-premium);
}

@keyframes bounce-premium {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.05); }
}

.result-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.result-actions .btn {
  min-width: 160px;
}

.diagnostic-result {
  background: var(--primary-alpha);
  border: 2px solid var(--primary);
  padding: 2.5rem;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
  max-width: 500px;
}

.level-badge {
  width: 80px;
  height: 80px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 900;
  box-shadow: 0 0 20px var(--primary-alpha);
}

.diagnostic-result h2 {
  font-size: 1.75rem;
  margin: 0;
}

.start-pulse {
  padding-left: 3rem;
  padding-right: 3rem;
  animation: pulse-border 2s infinite;
}

/* Review Area */
.review-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h3 {
  font-size: 1.5rem;
  font-weight: 800;
}

.review-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.review-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.review-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.q-num {
  font-weight: 900;
  color: var(--primary);
  font-size: 0.9rem;
  text-transform: uppercase;
}

.q-status {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  text-transform: uppercase;
}

.q-status.success { background: var(--success-bg); color: var(--success); }
.q-status.error { background: var(--error-bg); color: var(--error); }

.q-answer-box.error { border-left: 4px solid var(--error); margin-bottom: 0.5rem; }

.q-text {
  font-size: 1.25rem;
  font-weight: 750;
  line-height: 1.4;
  color: var(--text-main);
}

.q-answer-box {
  padding: 1.25rem;
  border-radius: 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
}

.q-answer-box.success { border-left: 4px solid var(--success); }

.q-answer-box .label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-subtle);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  display: block;
}

.q-answer-box .answer {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--success);
}

.q-explanation {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--text-muted);
}

.q-answer-box .answer-tokens {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.phrase-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.15rem;
}

.romaji-row, .english-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.4rem;
  font-size: 0.9rem;
}

.token-simple {
  font-weight: 600;
}

.romaji-row { color: var(--text-muted); font-style: italic; }
.english-row { color: var(--text-subtle); }

.token-wrapper {
  position: relative;
  display: inline-block;
}

.token-premium {
  position: relative;
  cursor: help;
  padding: 0.1rem 0.25rem;
  border-radius: 6px;
  font-weight: 850;
  transition: all 0.2s ease;
}

.token-premium:hover {
  background: var(--bg-subtle);
}

.token-tooltip {
  visibility: hidden;
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-10px);
  background: var(--text-main);
  color: white;
  padding: 0.5rem 0.85rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  z-index: 100;
  opacity: 0;
  box-shadow: var(--shadow-lg);
  transition: all 0.2s var(--ease-premium);
}

.token-premium:hover .token-tooltip,
.token-premium:focus .token-tooltip,
.token-premium:focus-within .token-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(-14px);
}

ruby { ruby-position: over; }
rt { font-size: 0.55em; color: var(--text-subtle); font-weight: 500; }

.highlight-success {
  color: var(--success);
  font-weight: 900;
  text-decoration: underline;
  text-underline-offset: 4px;
}

@media (max-width: 900px) {
  .result-celebration { padding: 3rem 1.5rem; gap: 2rem; }
  .celebration-text h1 { font-size: 2.75rem; }
  .score-orbit { width: 160px; height: 160px; }
  .percentage { font-size: 2.5rem; }
}

@media (max-width: 640px) {
  .lumina-result-view {
    gap: 2rem;
    padding: 0.5rem;
  }

  .result-celebration {
    padding: 2.5rem 1.25rem;
    gap: 1.5rem;
  }

  .score-orbit {
    width: 140px;
    height: 140px;
  }

  .percentage {
    font-size: 2.25rem;
  }

  .celebration-text h1 {
    font-size: 2rem;
  }

  .celebration-text .summary {
    font-size: 1rem;
  }

  .result-actions {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
    gap: 0.75rem;
  }

  .diagnostic-result {
    padding: 1.5rem;
    gap: 1.25rem;
  }

  .diagnostic-result h2 {
    font-size: 1.4rem;
  }

  .review-card {
    padding: 1.25rem;
    gap: 1rem;
  }

  .q-text {
    font-size: 1.1rem;
  }

  .q-answer-box {
    padding: 1rem;
  }

  .section-header h3 {
    font-size: 1.25rem;
  }
}
</style>