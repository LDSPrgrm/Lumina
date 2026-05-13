<script setup lang="ts">
import { computed } from "vue";
import type { QuizQuestion } from "~/utils/gemini";

const props = defineProps<{
  question: QuizQuestion;
  focusArea: string;
  quizFormat: string;
  selectedOption: number | null;
  hasSubmitted: boolean;
}>();

const emit = defineEmits<{
  select: [index: number];
  submit: [];
  next: [];
}>();

const letters = ["A", "B", "C", "D"];

function handleSubmit() {
  if (props.selectedOption !== null) emit("submit");
}

function handleNext() {
  emit("next");
}

const vocabItems = computed(() => {
  const q = props.question;
  if (!q || !q.questionTokens) return [];
  
  const correctOption = q.options[q.correctIndex];
  const items: any[] = [];
  
  q.questionTokens.forEach((token, idx) => {
    // Skip simple punctuation
    const isPunctuation = /^[、。！？\s,.!?]+$/.test(token.text);
    if (isPunctuation) return;

    // Handle the blank token - ONLY if the TEXT is a blank
    if (token.text.includes('____')) {
      if (!correctOption) return;

      if (correctOption.tokens?.length) {
        correctOption.tokens.forEach((oToken, oIdx) => {
          items.push({
            text: oToken.text,
            reading: oToken.reading,
            romaji: correctOption.romajiTokens?.[oIdx]?.text || '',
            meaning: oToken.meaning || correctOption.english
          });
        });
      } else {
        items.push({
          text: correctOption.text,
          reading: '',
          romaji: correctOption.romaji,
          meaning: correctOption.english
        });
      }
    } else {
      // Normal token
      // Clean up meaning/reading if AI leaked "____" there
      const cleanMeaning = (token.meaning || '').replace(/____/g, '').trim();
      const cleanReading = (token.reading || '').replace(/____/g, '').trim();
      
      items.push({
        text: token.text,
        reading: cleanReading,
        romaji: q.questionRomajiTokens?.[idx]?.text || '',
        meaning: cleanMeaning || q.questionEnglishTokens?.[idx]?.text || ''
      });
    }
  });
  
  // Final pass: filter out items that have empty text
  return items.filter(item => item.text && item.text.trim() !== '');
});
</script>

<template>
  <div class="lumina-question-card animate-in">
    <!-- Header: Focus & Progress -->
    <div class="card-header">
      <span class="badge badge-secondary">{{ props.focusArea }}</span>
      <span class="badge badge-outline">{{ props.quizFormat }}</span>
    </div>

    <!-- Question Block -->
    <div class="question-body">
      <div v-if="props.question?.questionTokens?.length" class="token-container">
        <h3 class="question-main">
          <span
            v-for="(token, tIdx) in props.question.questionTokens"
            :key="tIdx"
            class="token-wrapper"
          >
            <span class="token-premium" :class="`token-${token.colorIndex}`">
              <ruby>
                {{ token.text }}
                <rt>{{ token.reading }}</rt>
              </ruby>
              <span class="token-tooltip">{{ token.meaning }}</span>
            </span>
          </span>
        </h3>
        
        <div v-if="props.question.questionRomajiTokens?.length" class="romaji-line">
          <span
            v-for="(token, tIdx) in props.question.questionRomajiTokens"
            :key="'qr' + tIdx"
            class="token-simple"
            :class="`token-${token.colorIndex}`"
          >
            {{ token.text }}
          </span>
        </div>
        
        <div v-if="props.question.questionEnglishTokens?.length" class="english-line">
          <span
            v-for="(token, tIdx) in props.question.questionEnglishTokens"
            :key="'qe' + tIdx"
            class="token-simple"
            :class="`token-${token.colorIndex}`"
          >
            {{ token.text }}
          </span>
        </div>
      </div>
      
      <h3 v-else class="question-fallback">{{ props.question?.question }}</h3>
    </div>

    <!-- Options Area -->
    <div class="options-grid">
      <div
        v-for="(option, index) in props.question?.options"
        :key="index"
        class="option-card card-interactive"
        :class="{
          active: props.selectedOption === index,
          correct: hasSubmitted && index === props.question?.correctIndex,
          wrong: hasSubmitted && props.selectedOption === index && index !== props.question?.correctIndex,
          disabled: hasSubmitted,
          faded: hasSubmitted && index !== props.question?.correctIndex && props.selectedOption !== index
        }"
        @click="!hasSubmitted && emit('select', index)"
      >
        <div class="option-indicator">
          <span class="letter">{{ letters[index] }}</span>
        </div>
        
        <div class="option-content">
          <div class="phrase-row">
            <span
              v-for="(token, tIdx) in option.tokens"
              :key="tIdx"
              class="token-wrapper"
            >
              <span class="token-premium" :class="`token-${token.colorIndex}`">
                <ruby v-if="token.reading && token.text !== token.reading">
                  {{ token.text }}
                  <rt>{{ token.reading }}</rt>
                </ruby>
                <span v-else>{{ token.text }}</span>
                <span class="token-tooltip">{{ token.meaning }}</span>
              </span>
            </span>
          </div>
          
          <div v-if="option.romajiTokens?.length" class="romaji-row">
            <span
              v-for="(token, tIdx) in option.romajiTokens"
              :key="'r' + tIdx"
              class="token-simple"
              :class="`token-${token.colorIndex}`"
            >
              {{ token.text }}&nbsp;
            </span>
          </div>
          
          <div v-if="option.englishTokens?.length" class="english-row">
            <span
              v-for="(token, tIdx) in option.englishTokens"
              :key="'e' + tIdx"
              class="token-simple"
              :class="`token-${token.colorIndex}`"
            >
              {{ token.text }}&nbsp;
            </span>
          </div>
        </div>

        <div class="feedback-icon" v-if="hasSubmitted">
          <span v-if="index === props.question?.correctIndex">✨</span>
          <span v-else-if="props.selectedOption === index">⚠️</span>
        </div>
      </div>
    </div>

    <!-- Actions & Explanation -->
    <div class="card-footer">
      <Transition name="slide-up" mode="out-in">
        <div v-if="!hasSubmitted" key="check" class="action-bar">
          <button
            class="btn btn-primary w-full"
            :disabled="props.selectedOption === null"
            @click="handleSubmit"
          >
            Check Answer
          </button>
        </div>

        <div v-else key="explanation" class="explanation-container animate-in">
          <!-- Status & Next -->
          <div class="correction-header">
            <div class="status-box" :class="props.selectedOption === props.question?.correctIndex ? 'success' : 'error'">
              <span class="status-icon">
                {{ props.selectedOption === props.question?.correctIndex ? '✓' : '×' }}
              </span>
              <span class="status-msg">
                {{ props.selectedOption === props.question?.correctIndex ? 'Brilliant!' : 'Not quite right' }}
              </span>
            </div>
            <button class="btn btn-primary next-pulse" @click="handleNext">
              Next Question
            </button>
          </div>

          <!-- Explanation Text -->
          <div class="explanation-body">
            <p>{{ props.question?.explanation }}</p>
          </div>

          <!-- Vocabulary Breakdown (Footer) -->
          <div v-if="vocabItems.length" class="vocab-breakdown">
            <h4 class="breakdown-title">Vocabulary Breakdown</h4>
            <div class="vocab-grid">
              <div 
                v-for="(item, vIdx) in vocabItems" 
                :key="'v' + vIdx"
                class="vocab-item"
              >
                <div class="vocab-top">
                  <span class="vocab-text">{{ item.text }}</span>
                  <span v-if="item.reading && item.text !== item.reading" class="vocab-reading">{{ item.reading }}</span>
                </div>
                <div v-if="item.romaji" class="vocab-middle">{{ item.romaji }}</div>
                <div class="vocab-bottom">{{ item.meaning }}</div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.lumina-question-card {
  width: 100%;
  max-width: 800px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: center;
}

.card-header {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.question-main {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.25rem;
  font-size: 2.25rem;
  font-weight: 850;
  line-height: 1.8; /* Increased for ruby/furigana spacing */
  margin-bottom: 2rem;
  letter-spacing: -0.02em;
}

.token-container {
  display: flex;
  flex-direction: column;
}

.token-wrapper {
  position: relative;
  display: inline-block;
}

.token-premium {
  position: relative;
  cursor: help;
  padding: 0.2rem 0.35rem;
  border-radius: 8px;
  font-weight: 850;
  transition: all 0.2s ease;
  display: inline-block;
}

.token-premium:hover {
  background: var(--bg-subtle);
}

.token-tooltip {
  visibility: hidden;
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%) translateY(-5px);
  background: var(--text-main);
  color: white;
  padding: 0.5rem 0.85rem;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  box-shadow: var(--shadow-lg);
  transition: all 0.2s var(--ease-premium);
  pointer-events: none;
}

.token-premium:hover .token-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(-10px);
}

.romaji-line, .english-line {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.5rem;
  font-size: 1.1rem;
}

.romaji-line {
  color: var(--text-muted);
  font-style: italic;
  margin-top: 0.5rem;
}

.english-line {
  color: var(--text-subtle);
  margin-top: 0.25rem;
}

.token-simple {
  font-weight: 600;
}

.question-fallback {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.4;
}

/* Options */
.options-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.option-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  text-align: left;
}

.option-card.active {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.option-card.correct {
  border-color: var(--success);
  background: var(--success-bg);
}

.option-card.wrong {
  border-color: var(--error);
  background: var(--error-bg);
}

.option-card.disabled {
  cursor: default;
}

.option-card.faded {
  opacity: 0.5;
  filter: grayscale(0.5);
}

.option-indicator .letter {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: var(--text-muted);
  border: 1.5px solid var(--border-main);
  transition: all 0.3s ease;
}

.option-card.active .letter {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.option-card.correct .letter {
  background: var(--success);
  color: white;
  border-color: var(--success);
}

.option-card.wrong .letter {
  background: var(--error);
  color: white;
  border-color: var(--error);
}

.option-content {
  flex: 1;
}

.phrase-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.15rem;
  font-size: 1.35rem;
  font-weight: 750;
  color: var(--text-main);
  line-height: 1.7; /* Increased for ruby spacing */
}

.romaji-row, .english-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.45rem;
  font-size: 0.95rem;
  margin-top: 0.15rem;
}

.romaji-row { color: var(--text-muted); font-style: italic; }
.english-row { color: var(--text-subtle); }

.feedback-icon {
  font-size: 1.5rem;
  font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", sans-serif;
}

/* Footer & Explanation */
.card-footer {
  margin-top: 1rem;
}

.explanation-container {
  background: var(--bg-subtle);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border-light);
}

.correction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border-light);
}

.status-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.2rem;
}

.status-box.success .status-icon {
  background: var(--success);
  color: white;
}

.status-box.error .status-icon {
  background: var(--error);
  color: white;
}

.status-msg {
  font-weight: 850;
  font-size: 1.25rem;
}

.status-box.success .status-msg { color: var(--success); }
.status-box.error .status-msg { color: var(--error); }

.explanation-body {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--text-main);
  margin-bottom: 2rem;
  padding: 1.25rem;
  background: white;
  border-radius: 14px;
  border-left: 5px solid var(--primary);
  box-shadow: var(--shadow-sm);
}

/* Vocab Breakdown */
.vocab-breakdown {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-light);
}

.breakdown-title {
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin-bottom: 1.25rem;
}

.vocab-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1.25rem;
  justify-content: center;
}

.vocab-item {
  padding: 1.25rem;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.3s var(--ease-premium);
  position: relative;
  overflow: hidden;
}

.vocab-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.vocab-top {
  display: flex;
  flex-direction: column;
}

.vocab-text {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-main);
}

.vocab-reading {
  font-size: 0.75rem;
  color: var(--text-subtle);
  font-weight: 600;
}

.vocab-middle {
  font-size: 0.85rem;
  font-style: italic;
  color: var(--text-muted);
}

.vocab-bottom {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-main);
  margin-top: 0.25rem;
}

.next-pulse {
  animation: pulse-border 2s infinite;
}

/* Ruby */
ruby { ruby-position: over; }
rt { font-size: 0.55em; color: var(--text-subtle); font-weight: 500; }

@media (max-width: 640px) {
  .lumina-question-card { padding: 1.5rem; }
  .question-main { font-size: 1.75rem; }
  .phrase-row { font-size: 1.15rem; }
  .correction-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
  .btn-primary { width: 100%; }
}
</style>
