<script setup lang="ts">
import type { QuizQuestion } from "~/utils/gemini";
import LuminaToken from "~/components/LuminaToken.vue";
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
  topic: string;
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



function highlightAnswer(q: QuizQuestion) {
  if (!q.question.includes('____')) return q.question;
  const correctOption = q.options[q.correctIndex];
  return q.question.replace('____', `<span class="highlight-success">${correctOption?.text || ''}</span>`);
}
</script>

<template>
  <div class="lumina-result-view">
    <div class="result-body">
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
            You've completed your session on <strong>{{ topic }}</strong>.
            <span v-if="wrongCount > 0"> You mastered most of the material!</span>
          </p>
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
                      <LuminaToken
                        v-for="(token, tIdx) in q.options[userAnswers[idx]!]?.tokens"
                        :key="tIdx"
                        :text="token.text"
                        :reading="token.reading"
                        :romaji="q.options[userAnswers[idx]!]?.romajiTokens?.[tIdx]?.text"
                        :meaning="token.meaning"
                        :colorIndex="token.colorIndex"
                        variant="mini"
                      />
                  </div>
                </div>
              </div>
              
              <div class="q-answer-box success">
                <span class="label">Correct Answer</span>
                <div class="answer-tokens">
                  <div class="phrase-row">
                      <LuminaToken
                        v-for="(token, tIdx) in q.options[q.correctIndex]?.tokens"
                        :key="tIdx"
                        :text="token.text"
                        :reading="token.reading"
                        :romaji="q.options[q.correctIndex]?.romajiTokens?.[tIdx]?.text || (tIdx === 0 ? q.options[q.correctIndex]?.romaji : '')"
                        :meaning="token.meaning"
                        :colorIndex="token.colorIndex"
                        variant="mini"
                      />
                  </div>
                  
                  <!-- Full Phrase Breakdown -->
                  <div class="full-breakdown-row">
                    <div class="romaji-row">
                      <span class="label-inline">Pronunciation:</span>
                      {{ q.options[q.correctIndex]?.romaji }}
                    </div>
                    <div class="english-row">
                      <span class="label-inline">Meaning:</span>
                      {{ q.options[q.correctIndex]?.english }}
                    </div>
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

    <!-- Fixed Bottom Action Bar -->
    <footer class="result-action-bar">
      <div class="action-bar-content">

        <div class="action-buttons result-group">
          <button class="btn btn-primary btn-xl btn-hero start-pulse" @click="$emit('newSession')">
            <div class="btn-shimmer shimmer-effect"></div>
            <span>New Session</span>
            <span class="btn-arrow">🚀</span>
          </button>
          <div class="secondary-actions">
            <button class="btn btn-outline" @click="$emit('restart')">
              Retake Quiz
            </button>
            <button class="btn btn-outline" @click="$emit('backToDashboard')">
              Dashboard
            </button>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.lumina-result-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: hidden;
  background-color: var(--bg-page);
  min-height: 0;
  contain: paint; /* Contain layout to prevent bleeding */
}

.result-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 2rem 1.5rem 3rem; /* Reduced from 8rem - flex siblings don't overlap */
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3rem;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

.result-celebration {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem 2rem;
  gap: 2.5rem;
  width: 100%;
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
  margin-bottom: 0.5rem;
  overflow-wrap: break-word;
  word-break: break-word;
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

/* Fixed Bottom Action Bar */
.result-action-bar {
  flex-shrink: 0;
  padding: 1.25rem 2rem;
  z-index: 1000;
  border-top: 1px solid var(--border-light);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: center;
}

.action-bar-content {
  width: 100%;
  max-width: 800px;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.action-buttons.result-group {
  justify-content: space-between;
}

.secondary-actions {
  display: flex;
  gap: 0.75rem;
}

.secondary-actions .btn {
  min-width: 120px;
}

.action-buttons.full-width {
  justify-content: center;
}

.action-buttons.full-width .btn {
  width: 100%;
  max-width: 400px;
}

/* Hero Button Styling */
.btn-hero {
  padding: 0.8rem 2rem;
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
  justify-content: center;
  gap: 0.75rem;
  white-space: normal;
  line-height: 1.2;
  text-align: center;
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

.btn-arrow {
  transition: transform 0.3s var(--ease-premium);
  font-size: 1.25rem;
}

.btn-hero:hover .btn-arrow {
  transform: translateX(4px);
}



.start-pulse {
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(0, 220, 130, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 220, 130, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 220, 130, 0); }
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.animate-scale-in {
  animation: scale-in 0.6s var(--ease-premium) forwards;
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
  position: relative;
  z-index: 1;
}

.review-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
  transition: all 0.3s ease;
}

.review-card:hover {
  z-index: 10; /* Bring hovered card to front for tooltips */
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
  font-size: 0.95rem;
  line-height: 1.5;
}

.full-breakdown-row {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px dashed var(--border-light);
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 0.4rem 0.75rem;
  align-items: baseline;
}

.full-breakdown-row .romaji-row,
.full-breakdown-row .english-row {
  display: contents;
}

.label-inline {
  font-weight: 800;
  color: var(--text-muted);
  font-size: 0.75rem;
  text-transform: uppercase;
  margin-right: 0;
}

.token-simple {
  font-weight: 600;
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
  .result-celebration { padding: 2.5rem 1.5rem; gap: 1.5rem; }
  .celebration-text h1 { font-size: 2.5rem; }
  .score-orbit { width: 150px; height: 150px; }
  .percentage { font-size: 2.25rem; }
}

@media (max-width: 768px) {
  .result-action-bar { 
    padding: 1rem 1.5rem; 
    background: rgba(255, 255, 255, 0.95);
    border-top: 1px solid var(--border-main);
  }
  .action-buttons.result-group {
    flex-direction: column;
    width: 100%;
    gap: 0.75rem;
  }
  .secondary-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .secondary-actions .btn {
    min-width: 0;
    padding: 0.7rem 0.5rem;
  }
  .action-buttons .btn-hero {
    width: 100%;
    padding: 0.8rem 1.5rem;
  }
}

@media (max-width: 640px) {
  .result-body {
    gap: 1.25rem;
    padding: 1rem 0.75rem 3rem; /* Reduced from 10rem - flex siblings don't overlap */
  }

  .result-celebration {
    padding: 2rem 1rem;
    gap: 1rem;
  }

  .score-orbit {
    width: 120px;
    height: 120px;
  }

  .percentage {
    font-size: 2rem;
  }

  .celebration-text h1 {
    font-size: 1.75rem;
  }

  .celebration-text .summary {
    font-size: 0.95rem;
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