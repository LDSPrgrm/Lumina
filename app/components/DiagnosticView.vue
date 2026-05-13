<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    targetLanguage: string;
    nativeLanguage: string;
  }
}>();

const emit = defineEmits(['update:modelValue', 'start']);

const languages = [
  "Spanish", "Japanese", "French", "German", "Korean", "Chinese", "Italian", "Portuguese"
];

const nativeLanguages = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese"
];

function handleStart() {
  if (props.modelValue.targetLanguage && props.modelValue.nativeLanguage) {
    emit('start');
  }
}
</script>

<template>
  <div class="diagnostic-onboarding card-premium glass animate-in">
    <div class="content">
      <div class="badge-wrapper">
        <span class="badge badge-primary">Skill Assessment</span>
      </div>
      
      <h1 class="title text-gradient">Personalize Your Journey</h1>
      <p class="description">
        Before we begin, let's gauge your current proficiency. This 10-question diagnostic test will help Lumina tailor lessons to your exact level.
      </p>

      <div class="form-grid">
        <div class="input-group">
          <label>Target Language</label>
          <select 
            :value="modelValue.targetLanguage"
            @change="(e: any) => emit('update:modelValue', { ...modelValue, targetLanguage: e.target.value })"
            class="input-premium"
          >
            <option value="" disabled>Select language...</option>
            <option v-for="lang in languages" :key="lang" :value="lang">{{ lang }}</option>
          </select>
        </div>

        <div class="input-group">
          <label>Native Language</label>
          <select 
            :value="modelValue.nativeLanguage"
            @change="(e: any) => emit('update:modelValue', { ...modelValue, nativeLanguage: e.target.value })"
            class="input-premium"
          >
            <option value="" disabled>Select language...</option>
            <option v-for="lang in nativeLanguages" :key="lang" :value="lang">{{ lang }}</option>
          </select>
        </div>
      </div>

      <div class="info-boxes">
        <div class="info-box glass">
          <span class="info-icon">🎯</span>
          <div class="info-text">
            <strong>Precise Placement</strong>
            <span>Questions range from Beginner to Advanced levels.</span>
          </div>
        </div>
        <div class="info-box glass">
          <span class="info-icon">⚡</span>
          <div class="info-text">
            <strong>AI Powered</strong>
            <span>Instantly analyzed by Gemini to build your profile.</span>
          </div>
        </div>
      </div>

      <button 
        class="btn btn-primary btn-lg btn-block start-pulse"
        :disabled="!modelValue.targetLanguage || !modelValue.nativeLanguage"
        @click="handleStart"
      >
        Start Diagnostic Test
      </button>
      
      <p class="skip-note">
        Takes about 3-5 minutes to complete.
      </p>
    </div>
  </div>
</template>

<style scoped>
.diagnostic-onboarding {
  max-width: 650px;
  width: 100%;
  margin: clamp(1.5rem, 5vh, 4rem) auto;
  padding: 3.5rem;
  position: relative;
}

.content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.badge-wrapper {
  margin-bottom: 2rem;
}

.title {
  font-size: clamp(2rem, 8vw, 3rem);
  font-weight: 900;
  margin-bottom: 1rem;
  letter-spacing: -0.04em;
}

.description {
  color: var(--text-muted);
  font-size: 1.15rem;
  line-height: 1.6;
  margin-bottom: 3rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  text-align: left;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-group label {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding-left: 0.25rem;
}

.info-boxes {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 3rem;
  text-align: left;
}

.info-box {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  transition: all 0.3s var(--ease-premium);
}

.info-box:hover {
  border-color: var(--primary-border);
  background: var(--primary-soft);
  transform: translateX(8px);
}

.info-icon {
  font-size: 1.75rem;
  background: white;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
}

.info-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-text strong {
  font-size: 1rem;
  color: var(--text-main);
  font-weight: 800;
}

.info-text span {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.btn-lg {
  padding: 1.25rem;
  font-size: 1.1rem;
}

.btn-block {
  width: 100%;
}

.start-pulse {
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 rgba(0, 220, 130, 0.4); }
  70% { box-shadow: 0 0 0 15px rgba(0, 220, 130, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 220, 130, 0); }
}

.skip-note {
  margin-top: 2rem;
  font-size: 0.9rem;
  color: var(--text-subtle);
  font-weight: 500;
}

@media (max-width: 900px) {
  .diagnostic-onboarding {
    padding: 3rem 2rem;
    margin: 2rem auto;
    max-width: 90%
  }
  .title { margin-bottom: 0.5rem; }
  .description { margin-bottom: 2rem; }
}

@media (max-width: 640px) {
  .diagnostic-onboarding {
    padding: 1.5rem 1rem;
    margin: 1rem auto;
    max-width: 96%;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .title {
    font-size: clamp(1.75rem, 7vw, 2.25rem);
  }

  .description {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .info-boxes {
    gap: 1rem;
    margin-bottom: 2.5rem;
  }

  .info-box {
    padding: 1rem;
    gap: 1rem;
  }

  .info-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .info-text strong {
    font-size: 0.95rem;
  }

  .info-text span {
    font-size: 0.85rem;
  }
}
</style>
