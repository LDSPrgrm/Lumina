<script setup lang="ts">
import { computed } from "vue";
import type { QuizQuestion } from "~/utils/gemini";
import LuminaToken from "~/components/LuminaToken.vue";

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
          // Robust romaji retrieval: check tokens first, then fall back to parent option romaji if it's the only token
          const tokenRomaji = correctOption.romajiTokens?.[oIdx]?.text || '';
          const fallbackRomaji = (correctOption.tokens.length === 1) ? (correctOption.romaji || '') : '';
          
          items.push({
            text: oToken.text,
            reading: oToken.reading,
            romaji: tokenRomaji || fallbackRomaji,
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
          <LuminaToken
            v-for="(token, tIdx) in props.question.questionTokens"
            :key="tIdx"
            :text="token.text"
            :reading="token.reading"
            :romaji="props.question.questionRomajiTokens?.[tIdx]?.text"
            :meaning="token.meaning"
            :colorIndex="token.colorIndex"
          />
        </h3>
      </div>
      
      <h3 v-else class="question-fallback">{{ props.question?.question }}</h3>
    </div>

    <!-- Options Area -->
    <div class="options-grid">
      <div
        v-for="(option, index) in props.question?.options"
        :key="index"
        class="option-card card-interactive"
        role="radio"
        :aria-checked="props.selectedOption === index"
        :tabindex="hasSubmitted ? -1 : 0"
        :class="{
          active: props.selectedOption === index,
          correct: hasSubmitted && index === props.question?.correctIndex,
          wrong: hasSubmitted && props.selectedOption === index && index !== props.question?.correctIndex,
          disabled: hasSubmitted,
          faded: hasSubmitted && index !== props.question?.correctIndex && props.selectedOption !== index,
          'animate-pop': props.selectedOption === index && !hasSubmitted,
          'animate-success-ping': hasSubmitted && index === props.question?.correctIndex
        }"
        @click="!hasSubmitted && emit('select', index)"
        @keydown.enter.space.prevent="!hasSubmitted && emit('select', index)"
      >
        <div class="option-indicator">
          <span class="letter">{{ letters[index] }}</span>
        </div>
        
        <div class="option-content">
          <div class="phrase-row">
            <LuminaToken
              v-for="(token, tIdx) in option.tokens"
              :key="tIdx"
              :text="token.text"
              :reading="token.reading"
              :romaji="option.romajiTokens?.[tIdx]?.text"
              :meaning="token.meaning"
              :colorIndex="token.colorIndex"
            />
          </div>
        </div>

        <div class="feedback-icon" v-if="hasSubmitted">
          <span v-if="index === props.question?.correctIndex">✨</span>
          <span v-else-if="props.selectedOption === index">⚠️</span>
        </div>
      </div>
    </div>

    <!-- Explanation & Vocab (Only visible after submission) -->
    <div v-if="hasSubmitted" class="card-footer">
      <div class="explanation-container animate-in">
        <div class="explanation-body" :class="props.selectedOption === props.question?.correctIndex ? 'success-theme' : 'error-theme'">
          <p class="explanation-text">{{ props.question?.explanation }}</p>
        </div>

        <!-- Vocabulary Breakdown -->
        <div v-if="vocabItems.length" class="vocab-breakdown">
          <h4 class="breakdown-title">Vocabulary Breakdown</h4>
          <div class="vocab-table-wrapper">
            <table class="vocab-table">
              <thead>
                <tr>
                  <th>Term</th>
                  <th>Meaning</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, vIdx) in vocabItems" :key="'v' + vIdx">
                  <td class="col-term">
                    <LuminaToken
                      :text="item.text"
                      :reading="item.reading"
                      :romaji="item.romaji"
                      :meaning="item.meaning"
                    />
                  </td>
                  <td class="col-meaning">{{ item.meaning }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lumina-question-card {
  width: 100%;
  max-width: 800px;
  margin: 1rem auto;
  padding: 1.5rem 2rem;
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
  justify-content: center;
  gap: 0 0.25rem;
  font-size: clamp(1.35rem, 4.5vw, 2rem);
  font-weight: 850;
  line-height: 1.6;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.token-container {
  display: flex;
  flex-direction: column;
}

@media (max-width: 900px) {
  .lumina-question-card { 
    margin: 1.5rem auto;
    padding: 2rem; 
    gap: 1.5rem;
  }
  .question-main { 
    margin-bottom: 1.5rem; 
    font-size: clamp(1.25rem, 4vw, 1.75rem);
  }
  .option-card {
    padding: 1.25rem;
  }
}

.romaji-line {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0 0.5rem;
  font-size: 1.1rem;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 0.5rem;
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
  gap: 1rem;
  padding: 1.25rem;
  text-align: left;
}

.option-card.active {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.option-card.correct {
  border-color: var(--success);
  background: var(--success-bg);
  opacity: 1 !important;
  filter: none !important;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.15);
}

.option-card.wrong {
  border-color: var(--error);
  background: var(--error-bg);
  opacity: 1 !important;
  filter: none !important;
}

.option-card.disabled {
  cursor: default;
}

.option-card.faded {
  opacity: 0.4;
  filter: grayscale(0.8);
}

/* Ensure tokens remain interactive even in disabled state */
.option-card.disabled .phrase-row {
  pointer-events: auto;
}

/* Ensure tokens remain legible against colored background states */
.option-card.correct .phrase-row,
.option-card.wrong .phrase-row {
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.7);
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
  line-height: 1.7;
}

.romaji-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0 0.45rem;
  font-size: 0.95rem;
  margin-top: 0.15rem;
  color: var(--text-muted);
  font-style: italic;
}

.feedback-icon {
  font-size: 1.5rem;
  font-family: "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", "Android Emoji", sans-serif;
}

/* Footer & Explanation */
.card-footer {
  margin-top: 1rem;
}

.explanation-container {
  background: white;
  border-radius: var(--radius-xl);
  padding: 2.5rem;
  border: 1px solid var(--border-light);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
}

.explanation-body {
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--text-main);
  background: var(--bg-subtle);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 2.5rem;
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

/* Vocab Breakdown */
.vocab-breakdown {
  margin-top: 2rem;
  text-align: left;
}

.breakdown-title {
  font-size: 0.95rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-left: 0.5rem;
}

.breakdown-title::before {
  content: "";
  display: block;
  width: 4px;
  height: 1.2em;
  background: var(--primary);
  border-radius: 99px;
}

.vocab-table-wrapper {
  border-radius: 20px;
  background: white;
  border: 1px solid var(--border-main);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.02);
}

.vocab-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.vocab-table th {
  padding: 1.25rem 1.5rem;
  background: var(--bg-subtle);
  color: var(--text-muted);
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-bottom: 1px solid var(--border-main);
}

.vocab-table td {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
  transition: all 0.2s ease;
}

.vocab-table tr:hover td {
  background: var(--primary-soft);
}

.vocab-table tr:last-child td {
  border-bottom: none;
}

.col-term {
  font-weight: 800;
  color: var(--text-main);
  font-size: 1.25rem;
  white-space: nowrap;
}

.col-romaji {
  color: var(--text-subtle);
  font-style: italic;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  opacity: 0.8;
}

.col-meaning {
  color: var(--text-main);
  font-weight: 600;
  line-height: 1.5;
  font-size: 1rem;
}

.next-pulse {
  animation: pulse-border 2s infinite;
}

@media (max-width: 900px) {
  .lumina-question-card { 
    margin: 1rem auto;
    padding: 1.75rem; 
  }
}

@media (max-width: 640px) {
  .lumina-question-card { 
    padding: 1rem;
    gap: 1rem;
    margin: 0 auto;
  }

  .question-main {
    font-size: clamp(1.15rem, 5.5vw, 1.5rem);
    line-height: 1.6;
    margin-bottom: 1.25rem;
  }

  .option-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .option-indicator .letter {
    width: 32px;
    height: 32px;
    font-size: 0.9rem;
  }

  .phrase-row { 
    font-size: 1.1rem; 
    line-height: 1.6;
  }

  .romaji-row {
    font-size: 0.85rem;
  }

  .explanation-container {
    padding: 1.25rem;
  }

  .explanation-body {
    font-size: 1rem;
    border-radius: 12px;
  }
  
  .explanation-text {
    padding: 1.25rem;
  }

  .vocab-table th, .vocab-table td {
    padding: 1rem 0.75rem;
  }
  
  .col-term {
    font-size: 1rem;
  }
  
  .col-romaji, .col-meaning {
    font-size: 0.85rem;
  }
}
</style>
