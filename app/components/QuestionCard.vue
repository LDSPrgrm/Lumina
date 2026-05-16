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

</script>

<template>
  <div class="lumina-question-card">
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
          faded: hasSubmitted && index !== props.question?.correctIndex && props.selectedOption !== index
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
              :romaji="option.romajiTokens?.[tIdx]?.text || (tIdx === 0 && !option.romajiTokens?.length ? option.romaji : '')"
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
  </div>
</template>

<style scoped>
.lumina-question-card {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
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

.question-body {
  position: relative;
  z-index: 1; /* Keep question body at a base layer */
}

.token-container {
  display: flex;
  flex-direction: column;
}

@media (max-width: 900px) {
  .lumina-question-card { 
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
  position: relative;
  z-index: 10; /* Ensure tooltips in options appear above the question body */
}

.option-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  text-align: left;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-card:hover,
.option-card:focus-within {
  z-index: 100; /* Bring the active/hovered option card to the front */
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
.option-card.disabled .option-content,
.option-card.disabled .phrase-row {
  pointer-events: auto;
}

/* Clearer text for colored background states */
.option-card.correct .phrase-row,
.option-card.wrong .phrase-row {
  text-shadow: none;
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

.feedback-icon {
  font-size: 1.5rem;
  font-family: \"Segoe UI Emoji\", \"Apple Color Emoji\", \"Noto Color Emoji\", \"Android Emoji\", sans-serif;
}

@media (max-width: 640px) {
  .lumina-question-card { 
    padding: 1.25rem 1rem;
    gap: 0.75rem;
  }

  .options-grid {
    gap: 0.75rem;
  }

  .question-main {
    font-size: clamp(1.15rem, 5.5vw, 1.5rem);
    line-height: 1.6;
    margin-bottom: 0.75rem;
  }

  .option-card {
    padding: 0.85rem 1rem;
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
}
</style>
