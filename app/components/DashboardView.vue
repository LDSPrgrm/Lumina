<script setup lang="ts">
import { ref, computed } from 'vue';
import { levels, focuses, formats, tones, scenarios, modes, depths } from "~/composables/useQuiz";

const props = defineProps<{
  modelValue: {
    targetLanguage: string;
    nativeLanguage: string;
    learningGoal: string;
    regionalDialect: string;
    proficiencyLevel: string;
    topic: string;
    quizLength: number;
    focusArea: string;
    quizFormat: string;
    tone: string;
    learningScenario: string;
    difficultyMode: string;
    explanationDepth: string;
    includePhonetics: boolean;
  };
}>();

const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue];
  start: [];
}>();

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

function update(key: keyof typeof model.value, value: any) {
  model.value = { ...model.value, [key]: value };
}

const activeTab = ref(0);
const tabs = [
  { id: 'identity', title: 'Context', icon: '🌍', description: 'Languages' },
  { id: 'aspiration', title: 'Goal', icon: '🎯', description: 'Level & Focus' },
  { id: 'scope', title: 'Session', icon: '📚', description: 'Topic & Depth' },
  { id: 'delivery', title: 'Style', icon: '⚙️', description: 'Tone & Format' },
  { id: 'review', title: 'Review', icon: '📝', description: 'Confirm' }
];

const canContinue = computed(() => {
  if (activeTab.value === 0) return !!model.value.targetLanguage && !!model.value.nativeLanguage;
  if (activeTab.value === 2) return !!model.value.topic;
  return true;
});

const progressWidth = computed(() => (activeTab.value / (tabs.length - 1)) * 100);
</script>

<template>
  <div class="lumina-dashboard animate-in">
    <div class="dashboard-header">
      <span class="badge badge-primary mb-3">AI Language Tutor</span>
      <h1 class="text-gradient">Welcome to Lumina</h1>
      <p class="text-muted">Design your perfect language learning session in seconds.</p>
    </div>

    <!-- Top Progress Indicator -->
    <div class="progress-wrapper">
      <div class="progress-container card-premium glass">
        <div class="progress-steps">
          <div 
            v-for="(tab, idx) in tabs" 
            :key="tab.id"
            class="step-node"
            :class="{ active: activeTab === idx, completed: activeTab > idx }"
            @click="activeTab = idx"
          >
            <div class="step-icon-wrap">
              <span v-if="activeTab > idx">✅</span>
              <span v-else>{{ tab.icon }}</span>
            </div>
            <span class="step-label">{{ tab.title }}</span>
          </div>
        </div>
        <div class="progress-track-bg">
          <div class="progress-fill" :style="{ width: progressWidth + '%' }"></div>
        </div>
      </div>
    </div>

    <div class="layout-grid">
      <!-- Main Wizard Content -->
      <main class="wizard-content card-premium">
        <Transition name="fade" mode="out-in">
          <div :key="activeTab" class="tab-view">
            <!-- Steps handled by v-if blocks -->
            <!-- Step 0: Identity -->
            <div v-if="activeTab === 0" class="step-pane">
              <h3>Where are we starting?</h3>
              <div class="form-stack">
                <div class="form-group">
                  <label>Native Language</label>
                  <input 
                    :value="model.nativeLanguage" 
                    @input="update('nativeLanguage', ($event.target as HTMLInputElement).value)" 
                    type="text" 
                    class="input-premium" 
                    placeholder="e.g. English" 
                  />
                </div>
                <div class="form-group">
                  <label>Target Language</label>
                  <input 
                    :value="model.targetLanguage" 
                    @input="update('targetLanguage', ($event.target as HTMLInputElement).value)" 
                    type="text" 
                    class="input-premium" 
                    placeholder="e.g. Japanese" 
                  />
                </div>
                <div class="form-group">
                  <label>Regional Dialect <small>(Optional)</small></label>
                  <input 
                    :value="model.regionalDialect" 
                    @input="update('regionalDialect', ($event.target as HTMLInputElement).value)" 
                    type="text" 
                    class="input-premium" 
                    placeholder="e.g. Kansai-ben, Mexican Spanish" 
                  />
                </div>
              </div>
            </div>

            <!-- Step 1: Aspiration -->
            <div v-else-if="activeTab === 1" class="step-pane">
              <h3>Define your level & focus</h3>
              <div class="form-stack">
                <div class="form-group">
                  <label>Current Proficiency</label>
                  <div class="choice-grid">
                    <div 
                      v-for="l in levels" 
                      :key="l"
                      class="card-interactive choice-card"
                      :class="{ active: model.proficiencyLevel === l }"
                      @click="update('proficiencyLevel', l)"
                    >
                      <div class="choice-indicator"></div>
                      <span>{{ l }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Skill Focus</label>
                  <div class="chip-row">
                    <button 
                      v-for="f in focuses" 
                      :key="f"
                      class="btn btn-outline chip"
                      :class="{ active: model.focusArea === f }"
                      @click="update('focusArea', f)"
                    >
                      {{ f }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Scope -->
            <div v-else-if="activeTab === 2" class="step-pane">
              <h3>What's today's topic?</h3>
              <div class="form-stack">
                <div class="form-group">
                  <label>Session Theme</label>
                  <input 
                    :value="model.topic" 
                    @input="update('topic', ($event.target as HTMLInputElement).value)" 
                    type="text" 
                    class="input-premium" 
                    placeholder="e.g. Booking a hotel, Casual dinner conversation" 
                  />
                </div>
                
                <div class="form-group">
                  <label>Learning Depth</label>
                  <div class="choice-grid cols-2">
                    <div 
                      v-for="d in depths" 
                      :key="d"
                      class="card-interactive choice-card compact"
                      :class="{ active: model.explanationDepth === d }"
                      @click="update('explanationDepth', d)"
                    >
                      <span>{{ d }}</span>
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <div class="label-with-value">
                    <label>Questions</label>
                    <span class="badge badge-primary">{{ model.quizLength }}</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" max="20" 
                    :value="model.quizLength" 
                    @input="update('quizLength', parseInt(($event.target as HTMLInputElement).value))"
                    class="slider-premium"
                  />
                </div>
              </div>
            </div>

            <!-- Step 3: Style -->
            <div v-else-if="activeTab === 3" class="step-pane">
              <h3>Fine-tune the delivery</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label>Format</label>
                  <select :value="model.quizFormat" @change="update('quizFormat', ($event.target as HTMLSelectElement).value)" class="input-premium">
                    <option v-for="f in formats" :key="f" :value="f">{{ f }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Tone</label>
                  <select :value="model.tone" @change="update('tone', ($event.target as HTMLSelectElement).value)" class="input-premium">
                    <option v-for="t in tones" :key="t" :value="t">{{ t }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Scenario</label>
                  <select :value="model.learningScenario" @change="update('learningScenario', ($event.target as HTMLSelectElement).value)" class="input-premium">
                    <option v-for="s in scenarios" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Difficulty</label>
                  <select :value="model.difficultyMode" @change="update('difficultyMode', ($event.target as HTMLSelectElement).value)" class="input-premium">
                    <option v-for="m in modes" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>
              </div>
              
              <label class="toggle-card card-interactive" :class="{ active: model.includePhonetics }">
                <input 
                  type="checkbox" 
                  :checked="model.includePhonetics" 
                  @change="update('includePhonetics', ($event.target as HTMLInputElement).checked)"
                  class="hidden-input"
                />
                <div class="toggle-content">
                  <div class="toggle-icon">🏮</div>
                  <div class="toggle-text">
                    <span class="title">Phonetic Guides</span>
                    <span class="desc">Show Furigana, Romaji, or Pinyin</span>
                  </div>
                </div>
                <div class="toggle-check">
                  <div class="check-box"></div>
                </div>
              </label>
            </div>

            <!-- Step 4: Review (Session Preview) -->
            <div v-else-if="activeTab === 4" class="step-pane">
              <div class="review-header-visual">
                <div class="visual-circle-premium">
                  <div class="pulse-ring-slow"></div>
                  <div class="pulse-ring-fast"></div>
                  <span class="icon-main">⚡</span>
                </div>
                <div class="header-text">
                  <h3>Your Session is Ready</h3>
                  <p class="text-muted">We've designed a custom curriculum based on your preferences.</p>
                </div>
              </div>
              
              <div class="session-summary-grid">
                <div class="summary-card">
                  <div class="summary-icon">🎯</div>
                  <div class="summary-details">
                    <span class="summary-label">Target</span>
                    <span class="summary-value">{{ model.targetLanguage }} ({{ model.proficiencyLevel }})</span>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">📝</div>
                  <div class="summary-details">
                    <span class="summary-label">Topic</span>
                    <span class="summary-value">{{ model.topic }}</span>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">🔍</div>
                  <div class="summary-details">
                    <span class="summary-label">Focus</span>
                    <span class="summary-value">{{ model.focusArea }}</span>
                  </div>
                </div>
                <div class="summary-card">
                  <div class="summary-icon">🎭</div>
                  <div class="summary-details">
                    <span class="summary-label">Tone</span>
                    <span class="summary-value">{{ model.tone }}</span>
                  </div>
                </div>
              </div>

              <div class="plan-details card-premium glass mt-4">
                <h4 class="plan-title">Curriculum Overview</h4>
                <ul class="plan-list">
                  <li><span class="dot"></span> <div>Immersive {{ model.focusArea }} practice in a {{ model.learningScenario }} context.</div></li>
                  <li><span class="dot"></span> <div>{{ model.quizLength }} adaptive questions with {{ model.explanationDepth }} feedback.</div></li>
                  <li><span class="dot"></span> <div>Real-time phonetic guides and color-coded linguistic breakdown.</div></li>
                </ul>
              </div>

              <div class="review-footer-action mt-5">
                <p class="text-subtle mb-3">Ready to transform your {{ model.targetLanguage }} skills?</p>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Wizard Actions -->
        <div class="wizard-actions">
          <button 
            v-if="activeTab > 0" 
            class="btn btn-outline" 
            @click="activeTab--"
          >
            Back
          </button>
          <div class="spacer"></div>
          <button 
            v-if="activeTab < tabs.length - 1" 
            class="btn btn-primary" 
            :disabled="!canContinue"
            @click="activeTab++"
          >
            Continue
          </button>
          <button 
            v-else 
            class="btn btn-primary start-pulse" 
            @click="$emit('start')"
          >
            Start Learning
          </button>
        </div>
      </main>

      <!-- Sidebar Preview (Desktop Only) -->
      <aside class="session-preview sidebar card-premium glass" v-if="activeTab < 4">
        <div class="preview-header">
          <span class="badge badge-primary">Session Preview</span>
          <h3>Live Curriculum</h3>
        </div>
        <div class="preview-body">
          <div class="preview-item">
            <span class="label">Goal</span>
            <span class="value">{{ model.learningGoal || 'Exploring...' }}</span>
          </div>
          <div class="preview-item">
            <span class="label">Topic</span>
            <span class="value">{{ model.topic || 'Custom Subject' }}</span>
          </div>
          <div class="preview-item">
            <span class="label">Config</span>
            <div class="mini-chips">
              <span class="mini-chip">{{ model.proficiencyLevel }}</span>
              <span class="mini-chip">{{ model.focusArea }}</span>
            </div>
          </div>
        </div>
        <div class="preview-footer">
          <div class="ready-check" :class="{ 'is-ready': canContinue }">
            <div class="dot"></div>
            <span>{{ canContinue ? 'Ready to proceed' : 'Pending input' }}</span>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.lumina-dashboard {
  max-width: 850px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem 1rem;
}

.dashboard-header {
  text-align: center;
}

.dashboard-header h1 {
  font-size: clamp(1.75rem, 5vw, 3.5rem);
  margin-bottom: 0.5rem;
}

.dashboard-header p {
  font-size: 1.125rem;
}

/* Progress Indicator */
.progress-wrapper {
  width: 100%;
  overflow-x: auto;
  padding: 1rem 0;
  -webkit-overflow-scrolling: touch;
}

.progress-container {
  padding: 1rem;
  position: relative;
  width: 100%;
  margin: 0 auto;
  border-radius: 20px;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.step-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  transition: all 0.3s var(--ease-premium);
}

.step-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-main);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.3s var(--ease-premium);
}

.step-node.active .step-icon-wrap {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-glow);
  transform: scale(1.1);
}

.step-node.completed .step-icon-wrap {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.step-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.step-node.active .step-label {
  color: var(--primary);
}

.progress-track-bg {
  position: absolute;
  top: 38px;
  left: 10%;
  right: 10%;
  height: 2px;
  background: var(--border-light);
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.6s var(--ease-premium);
}

/* Layout Grid */
.layout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  width: 100%;
}

@media (min-width: 900px) {
  .layout-grid {
    grid-template-columns: 1fr 320px;
    align-items: start;
  }
}

.wizard-content {
  width: 100%;
  padding: clamp(1.5rem, 5vw, 3rem);
  min-height: clamp(300px, 60vh, 550px);
  display: flex;
  flex-direction: column;
}

.step-pane h3 {
  font-size: 1.75rem;
  margin-bottom: 2rem;
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-group label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

/* Choice Cards */
.choice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1rem;
}

.choice-grid.cols-2 {
  grid-template-columns: 1fr 1fr;
}

.choice-card {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.choice-card.compact {
  padding: 0.75rem 1rem;
  justify-content: center;
}

.choice-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid var(--border-main);
  transition: all 0.2s ease;
}

.choice-card.active .choice-indicator {
  background: var(--primary);
  border-color: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-glow);
}

/* Chips */
.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.chip {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  border-radius: 99px;
}

.chip.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Toggle Card */
.toggle-card {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
}

.hidden-input {
  display: none;
}

.toggle-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.toggle-icon {
  font-size: 1.5rem;
}

.toggle-text {
  display: flex;
  flex-direction: column;
}

.toggle-text .title {
  font-weight: 700;
  color: var(--text-main);
}

.toggle-text .desc {
  font-size: 0.8rem;
  color: var(--text-subtle);
}

.check-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid var(--border-main);
  position: relative;
  transition: all 0.2s ease;
}

.toggle-card.active .check-box {
  background: var(--primary);
  border-color: var(--primary);
}

.toggle-card.active .check-box::after {
  content: '✓';
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.8rem;
  font-weight: 900;
}

/* Slider */
.slider-premium {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: var(--border-light);
  border-radius: 99px;
  outline: none;
}

.slider-premium::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  background: white;
  border: 3px solid var(--primary);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
}

.slider-premium::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 0 6px var(--primary-glow);
}

.wizard-actions {
  margin-top: auto;
  padding-top: 2rem;
  display: flex;
  align-items: center;
}

.spacer { flex: 1; }

.start-pulse {
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { box-shadow: 0 0 0 0 var(--primary-glow); }
  70% { box-shadow: 0 0 0 10px rgba(0, 220, 130, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 220, 130, 0); }
}

.review-header-visual {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  text-align: left;
}

.visual-circle-premium {
  position: relative;
  width: 80px;
  height: 80px;
  background: var(--primary);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  box-shadow: 0 10px 25px var(--primary-glow);
}

.pulse-ring-slow, .pulse-ring-fast {
  position: absolute;
  inset: -10px;
  border: 2px solid var(--primary);
  border-radius: 30px;
  opacity: 0;
}

.pulse-ring-slow { animation: pulse-ring 3s infinite; }
.pulse-ring-fast { animation: pulse-ring 3s infinite 1.5s; }

@keyframes pulse-ring {
  0% { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 0; }
}

.header-text h3 {
  font-size: 2rem;
  margin-bottom: 0.25rem;
  color: var(--text-main);
}

.session-summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: var(--bg-subtle);
  border-radius: 20px;
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px) scale(1.02);
  border-color: var(--primary-border);
  background: white;
  box-shadow: var(--shadow-lg);
}

.summary-icon {
  font-size: 1.75rem;
  width: 54px;
  height: 54px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
}

.summary-details {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.summary-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: 850;
  color: var(--text-main);
}

.plan-details {
  padding: 1.5rem;
  text-align: left;
}

@media (min-width: 600px) {
  .plan-details {
    padding: 2rem;
  }
}

.plan-title {
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.plan-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plan-list li {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  font-weight: 600;
  color: var(--text-main);
  line-height: 1.5;
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--primary-glow);
  flex-shrink: 0;
  margin-top: 0.6em;
}

.review-footer-action {
  text-align: center;
}

/* Sidebar Styles */
.session-preview {
  display: none;
}

@media (min-width: 900px) {
  .session-preview {
    display: flex;
    flex-direction: column;
    padding: 2rem;
    position: sticky;
    top: 2rem;
  }
}

.preview-header h3 {
  font-size: 1.25rem;
  margin-top: 0.5rem;
}

.preview-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin: 2rem 0;
}

.preview-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-item .label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-subtle);
  letter-spacing: 0.05em;
}

.preview-item .value {
  font-weight: 700;
  color: var(--text-main);
}

.mini-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.mini-chip {
  font-size: 0.7rem;
  padding: 0.25rem 0.6rem;
  background: var(--primary-glow);
  color: var(--primary);
  border-radius: 6px;
  font-weight: 700;
}

.preview-footer {
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-light);
}

.ready-check {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-subtle);
}

.ready-check.is-ready {
  color: var(--primary);
}

.ready-check .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-subtle);
}

.ready-check.is-ready .dot {
  background: var(--primary);
  box-shadow: 0 0 8px var(--primary-glow);
}

/* Responsive */
@media (max-width: 900px) {
  .lumina-dashboard {
    padding: 1rem;
    gap: 1.5rem;
  }
}

@media (max-width: 600px) {
  .wizard-content {
    padding: 1.5rem;
    min-height: auto;
  }
  
  .step-pane h3 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .choice-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .choice-grid.cols-2 {
    grid-template-columns: 1fr;
  }

  .session-summary-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .summary-card {
    padding: 1rem;
  }
}

@media (max-width: 520px) {
  .review-header-visual {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1rem;
  }
  
  .visual-circle-premium {
    width: 64px;
    height: 64px;
    font-size: 1.5rem;
  }

  .header-text h3 {
    font-size: 1.5rem;
  }
  .plan-title {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .plan-list li {
    font-size: 0.9rem;
    gap: 0.75rem;
  }
}
</style>
