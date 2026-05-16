<script setup lang="ts">
import { ref, computed } from 'vue';
import { levels, focuses, formats, tones, scenarios, modes, depths } from "~/composables/useQuiz";

const props = defineProps<{
  modelValue: {
    targetLanguage: string;
    learningGoal: string;
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

const popularLanguages = [
  { name: 'Japanese', icon: '🇯🇵', color: '#ff4b5c' },
  { name: 'Spanish', icon: '🇪🇸', color: '#ffb400' },
  { name: 'French', icon: '🇫🇷', color: '#0055a4' },
  { name: 'Korean', icon: '🇰🇷', color: '#0047a0' },
  { name: 'German', icon: '🇩🇪', color: '#000000' },
  { name: 'Chinese', icon: '🇨🇳', color: '#ee1c25' },
];

const contextTypes = [
  { id: 'text', label: 'Raw Text', icon: '📄' },
  { id: 'topics', label: 'Key Topics', icon: '💡' },
  { id: 'scenario', label: 'Real-world', icon: '🎭' }
];

const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue];
  start: [];
}>();

const getContextTypeDesc = (id: string) => {
  const descs: Record<string, string> = {
    text: 'Analyze custom text snippets or articles',
    topics: 'Target specific knowledge areas',
    scenario: 'Immersive roleplay and real-world situations'
  };
  return descs[id] || '';
};

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const activeContextType = ref('topics');
const commonTopics = ['Travel', 'Food & Dining', 'Work/Business', 'Shopping', 'Hobbies', 'Technology', 'Science', 'Art'];
const scenarioPresets = ['Ordering at a restaurant', 'Checking into a hotel', 'Business meeting', 'First date', 'Emergency at the hospital'];

function update(key: keyof typeof model.value, value: any) {
  model.value = { ...model.value, [key]: value };
}

function toggleTopic(topic: string) {
  const current = model.value.topic.split(',').map(s => s.trim()).filter(Boolean);
  const next = current.includes(topic) 
    ? current.filter(t => t !== topic)
    : [...current, topic];
  update('topic', next.join(', '));
}

const activeTab = ref(0);
const tabs = [
  { id: 'language', title: 'Language', icon: '🌍', description: 'Phase 01' },
  { id: 'context', title: 'Context', icon: '📄', description: 'Phase 02' },
  { id: 'focus', title: 'Focus', icon: '🎯', description: 'Phase 03' },
  { id: 'config', title: 'Config', icon: '⚙️', description: 'Phase 04' },
  { id: 'review', title: 'Review', icon: '📝', description: 'Final' }
];

const canContinue = computed(() => {
  if (activeTab.value === 0) return !!model.value.targetLanguage;
  if (activeTab.value === 1) {
    if (activeContextType.value === 'scenario') return !!model.value.learningScenario;
    return !!model.value.topic;
  }
  return true;
});

const progressWidth = computed(() => (activeTab.value / (tabs.length - 1)) * 100);
</script>

<template>
  <div class="lumina-dashboard animate-in">
    <!-- Decorative Background Elements -->
    <div class="background-decor">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
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
      <div class="wizard-content card-premium">
        <button 
          v-if="activeTab < tabs.length - 1" 
          class="btn btn-primary btn-sm" 
          :disabled="!canContinue"
          @click="activeTab++"
        >
          Continue
        </button>
        <button 
          v-else 
          class="btn btn-primary btn-sm start-pulse" 
          @click="$emit('start')"
        >
          Start Learning
        </button>

        <div class="wizard-scroll-body">
          <Transition name="fade-slide" mode="out-in">
            <div :key="activeTab" class="tab-view">
              <!-- Phase 01: Language -->
              <div v-if="activeTab === 0" class="step-pane">
                <div class="step-header-modern">
                  <div class="step-badge">Phase 01</div>
                  <h3 class="hero-title">Where are we starting?</h3>
                  <p class="hero-subtitle">Select a target language to begin your personalized linguistic journey.</p>
                </div>

                <div class="form-stack">
                  <div class="form-group">
                    <div class="language-grid-premium">
                      <div 
                        v-for="(lang, idx) in popularLanguages" 
                        :key="lang.name"
                        class="lang-card-premium"
                        :class="{ active: model.targetLanguage === lang.name }"
                        :style="{ '--idx': idx }"
                        @click="update('targetLanguage', lang.name)"
                      >
                        <div class="lang-visual" :style="{ '--lang-color': lang.color }">
                          <span class="lang-emoji">{{ lang.icon }}</span>
                          <div class="lang-glow"></div>
                        </div>
                        <span class="lang-title-text">{{ lang.name }}</span>
                        <div class="lang-check" v-if="model.targetLanguage === lang.name">
                          <span class="check-icon">✓</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="form-group mt-6">
                    <label class="section-label-premium">Or explore another world</label>
                    <div class="input-wrapper-premium">
                      <div class="input-prefix">🌍</div>
                      <input 
                        :value="model.targetLanguage" 
                        @input="update('targetLanguage', ($event.target as HTMLInputElement).value)" 
                        type="text" 
                        class="input-premium-v2" 
                        placeholder="Type any language (e.g. Italian, Swedish, Arabic...)" 
                      />
                      <div class="input-focus-line"></div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Phase 02: Context -->
              <div v-else-if="activeTab === 1" class="step-pane">
                <div class="step-header-modern">
                  <div class="step-badge">Phase 02</div>
                  <h3 class="hero-title">Building the context</h3>
                  <p class="hero-subtitle">What's the setting for today's session? Choose how you want to define the theme.</p>
                </div>

                <div class="context-type-grid-premium">
                  <div 
                    v-for="(type, idx) in contextTypes" 
                    :key="type.id"
                    class="context-type-card-premium"
                    :class="{ active: activeContextType === type.id }"
                    :style="{ '--idx': idx }"
                    @click="activeContextType = type.id"
                  >
                    <div class="type-visual">
                      <span class="type-emoji">{{ type.icon }}</span>
                      <div class="type-glow"></div>
                    </div>
                    <div class="type-info">
                      <span class="type-label">{{ type.label }}</span>
                      <span class="type-desc">{{ getContextTypeDesc(type.id) }}</span>
                    </div>
                    <div class="type-active-indicator" v-if="activeContextType === type.id">
                      <span class="dot"></span>
                    </div>
                  </div>
                </div>

                <div class="context-content-area mt-8">
                  <Transition name="fade-scale" mode="out-in">
                    <div v-if="activeContextType === 'text'" key="text" class="context-pane">
                      <label class="section-label-premium">Custom Material</label>
                      <div class="textarea-wrapper-premium">
                        <textarea 
                          :value="model.topic" 
                          @input="update('topic', ($event.target as HTMLTextAreaElement).value)"
                          class="textarea-premium" 
                          placeholder="Paste an article snippet, a song lyric, or a work email here..."
                          rows="6"
                        ></textarea>
                        <div class="textarea-glow"></div>
                      </div>
                    </div>

                    <div v-else-if="activeContextType === 'topics'" key="topics" class="context-pane">
                      <div class="label-row">
                        <label class="section-label-premium">Popular Directions</label>
                        <span class="selection-count" v-if="model.topic.split(',').filter(Boolean).length">
                          {{ model.topic.split(',').filter(Boolean).length }} Selected
                        </span>
                      </div>
                      <div class="topic-chip-grid-premium">
                        <button 
                          v-for="(t, idx) in commonTopics" 
                          :key="t"
                          class="topic-chip-premium"
                          :class="{ active: model.topic.includes(t) }"
                          :style="{ '--idx': idx }"
                          @click="toggleTopic(t)"
                        >
                          <span class="chip-dot" v-if="model.topic.includes(t)"></span>
                          {{ t }}
                        </button>
                      </div>
                      <div class="form-group mt-10">
                        <label class="section-label-premium">Custom Focus</label>
                        <div class="input-wrapper-premium v2">
                          <div class="input-prefix">✨</div>
                          <input 
                            :value="model.topic" 
                            @input="update('topic', ($event.target as HTMLInputElement).value)" 
                            type="text" 
                            class="input-premium-v2" 
                            placeholder="Type any custom topic or interest..." 
                          />
                        </div>
                      </div>
                    </div>

                    <div v-else-if="activeContextType === 'scenario'" key="scenario" class="context-pane">
                      <label class="section-label-premium">Choose Your Environment</label>
                      <div class="scenario-grid-premium">
                        <div 
                          v-for="(s, idx) in scenarioPresets" 
                          :key="s"
                          class="scenario-card-premium"
                          :class="{ active: model.learningScenario === s }"
                          :style="{ '--idx': idx }"
                          @click="update('learningScenario', s)"
                        >
                          <div class="scenario-content">
                            <span class="scenario-text">{{ s }}</span>
                            <span class="scenario-meta">Scenario Mode</span>
                          </div>
                          <div class="scenario-icon-wrap">
                            <span class="icon" v-if="model.learningScenario === s">✦</span>
                            <span class="icon" v-else>→</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Transition>
                </div>
              </div>

              <!-- Phase 03: Scope -->
              <div v-else-if="activeTab === 2" class="step-pane">
                <div class="step-header-modern">
                  <div class="step-badge">Phase 03</div>
                  <h3 class="hero-title">Setting the scope</h3>
                  <p class="hero-subtitle">How advanced should we go? Define your current proficiency and focus area.</p>
                </div>

                <div class="form-stack">
                  <div class="form-group">
                    <label class="section-label-premium">Proficiency Level</label>
                    <div class="proficiency-grid-premium">
                      <div 
                        v-for="(lvl, idx) in levels" 
                        :key="lvl"
                        class="lvl-card-premium"
                        :class="{ active: model.proficiencyLevel === lvl }"
                        :style="{ '--idx': idx }"
                        @click="update('proficiencyLevel', lvl)"
                      >
                        <span class="lvl-text">{{ lvl }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="form-group mt-8">
                    <label class="section-label-premium">Specific Focus (Optional)</label>
                    <div class="input-wrapper-premium">
                      <div class="input-prefix">🎯</div>
                      <input 
                        :value="model.focusArea" 
                        @input="update('focusArea', ($event.target as HTMLInputElement).value)" 
                        type="text" 
                        class="input-premium-v2" 
                        placeholder="e.g. Verbs, Medical Vocabulary, Formal Tone..." 
                      />
                    </div>
                    <p class="text-xs text-muted mt-3">Leave blank for a balanced mix of vocabulary and grammar.</p>
                  </div>

                  <div class="form-group mt-8">
                    <label class="section-label-premium">Learning Depth</label>
                    <div class="choice-grid-premium cols-4">
                      <div 
                        v-for="d in depths" 
                        :key="d"
                        class="card-interactive choice-card-v2"
                        :class="{ active: model.explanationDepth === d }"
                        @click="update('explanationDepth', d)"
                      >
                        <span>{{ d }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Phase 04: Config -->
              <div v-else-if="activeTab === 3" class="step-pane">
                <div class="step-header-modern">
                  <div class="step-badge">Phase 04</div>
                  <h3 class="hero-title">Personalizing the experience</h3>
                  <p class="hero-subtitle">Fine-tune the session dynamics to match your mood and schedule.</p>
                </div>

                <div class="form-stack">
                  <div class="config-grid-premium">
                    <div class="form-group">
                      <label class="section-label-premium">Question Count</label>
                      <div class="slider-container-premium">
                        <div class="slider-header">
                          <span class="slider-val">{{ model.quizLength }} questions</span>
                        </div>
                        <input 
                          type="range" 
                          min="3" 
                          max="20" 
                          :value="model.quizLength" 
                          @input="update('quizLength', parseInt(($event.target as HTMLInputElement).value))"
                          class="slider-premium"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label class="section-label-premium">Tone</label>
                      <div class="format-toggle-grid">
                        <button 
                          v-for="t in tones" 
                          :key="t"
                          class="format-btn-premium"
                          :class="{ active: model.tone === t }"
                          @click="update('tone', t)"
                        >
                          {{ t }}
                        </button>
                      </div>
                    </div>

                    <div class="form-group">
                      <label class="section-label-premium">Difficulty</label>
                      <div class="format-toggle-grid">
                        <button 
                          v-for="m in modes" 
                          :key="m"
                          class="format-btn-premium"
                          :class="{ active: model.difficultyMode === m }"
                          @click="update('difficultyMode', m)"
                        >
                          {{ m }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="form-group mt-10">
                    <label class="toggle-card card-interactive premium-toggle" :class="{ active: model.includePhonetics }">
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
                          <span class="desc">Show Furigana, Romaji, or Pinyin for complex characters</span>
                        </div>
                      </div>
                      <div class="toggle-check">
                        <div class="check-box"></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Phase 05: Review -->
              <div v-else-if="activeTab === 4" class="step-pane">
                <div class="review-header-visual">
                  <div class="visual-circle-premium">
                    <div class="pulse-ring-slow"></div>
                    <div class="pulse-ring-fast"></div>
                    <span class="icon-main">⚡</span>
                  </div>
                  <div class="header-text">
                    <h3>Your Session is Ready</h3>
                    <p class="text-muted">Lumina has generated a personalized curriculum based on your choices.</p>
                  </div>
                </div>
                
                <div class="session-summary-grid">
                  <div class="summary-card">
                    <div class="summary-icon">🎯</div>
                    <div class="summary-details">
                      <span class="summary-label">Language</span>
                      <span class="summary-value">{{ model.targetLanguage }}</span>
                    </div>
                  </div>
                  <div class="summary-card">
                    <div class="summary-icon">📈</div>
                    <div class="summary-details">
                      <span class="summary-label">Level</span>
                      <span class="summary-value">{{ model.proficiencyLevel }}</span>
                    </div>
                  </div>
                  <div class="summary-card">
                    <div class="summary-icon">📝</div>
                    <div class="summary-details">
                      <span class="summary-label">Setting</span>
                      <span class="summary-value">{{ activeContextType === 'scenario' ? model.learningScenario : (model.topic || 'Custom') }}</span>
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
                  <h4 class="plan-title">Linguistic Overview</h4>
                  <ul class="plan-list">
                    <li><span class="dot"></span> <div>{{ model.quizLength }} adaptive questions designed for {{ model.proficiencyLevel }}.</div></li>
                    <li><span class="dot"></span> <div>Immersive focus on {{ model.focusArea || 'General Vocabulary' }} within a {{ model.tone.toLowerCase() }} context.</div></li>
                    <li><span class="dot"></span> <div>{{ model.explanationDepth }} feedback with real-time phonetic support enabled.</div></li>
                  </ul>
                </div>
              </div>
            </div>
          </Transition>
        </div>

      </div>

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
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  position: relative;
  background: var(--bg-main);
}

.background-decor {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.blob {
  position: absolute;
  filter: blur(80px);
  opacity: 0.15;
  border-radius: 50%;
  animation: blob-float 20s infinite alternate ease-in-out;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: var(--primary);
  top: -100px;
  left: -100px;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: #f472b6;
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
  animation-duration: 25s;
}

.blob-3 {
  width: 300px;
  height: 300px;
  background: #818cf8;
  top: 40%;
  left: 30%;
  animation-delay: -10s;
  animation-duration: 30s;
}

/* Staggered Entry Animation */
.step-pane > * {
  animation: fade-in-up 0.6s var(--ease-premium) both;
  animation-delay: calc(var(--idx, 0) * 0.1s);
}

@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dashboard-header {
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.dashboard-header.compact {
  text-align: left;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title {
  font-size: 1.75rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0;
}

/* Progress Indicator */
.progress-wrapper {
  width: 100%;
  padding: 1rem 0;
}

.progress-container {
  padding: 1.25rem;
  position: relative;
  width: 100%;
  margin: 0 auto;
  border-radius: 24px;
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
  gap: 0.75rem;
  cursor: pointer;
  flex: 1;
  min-width: 0;
  transition: all 0.3s var(--ease-premium);
}

.step-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-main);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.35rem;
  transition: all 0.3s var(--ease-premium);
  position: relative;
  z-index: 1;
}

.step-node.active .step-icon-wrap {
  animation: float 3s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1.15); }
  50% { transform: translateY(-8px) scale(1.15); }
}

.step-node.active .step-icon-wrap {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 0 0 5px var(--primary-glow);
  transform: scale(1.15);
}

.step-node.completed .step-icon-wrap {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.step-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.step-node.active .step-label {
  color: var(--primary);
}

.progress-track-bg {
  position: absolute;
  top: 42px;
  left: 10%;
  right: 10%;
  height: 3px;
  background: var(--border-light);
  z-index: 1;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.6s var(--ease-premium);
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 15px;
  height: 100%;
  background: white;
  filter: blur(5px);
  opacity: 0.8;
  animation: bar-glow 1s infinite alternate;
}

@keyframes bar-glow {
  from { opacity: 0.4; transform: scaleX(0.8); }
  to { opacity: 0.8; transform: scaleX(1.2); }
}

/* Layout Grid - Stacked Layout */
.layout-grid {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.wizard-content {
  width: 100%;
  margin: 0 auto;
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  border-radius: 40px;
  background: var(--bg-main);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.wizard-scroll-body {
  flex: 1;
  overflow-y: auto;
  padding: clamp(1.5rem, 4vw, 3rem);
}


.step-pane {
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

.step-pane h3 {
  font-size: 1.75rem;
  margin-bottom: 2rem;
}

/* Enhanced Step Header */
.step-header-modern {
  margin-bottom: 3rem;
  text-align: left;
}

.step-badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: var(--primary-soft);
  color: var(--primary);
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 850;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 900;
  letter-spacing: -0.04em;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--text-main), #475569);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--text-subtle);
  max-width: 600px;
  line-height: 1.6;
}

.section-label-premium {
  display: block;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.25rem;
}

/* Language Grid Premium */
.language-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 1.25rem;
}

.lang-card-premium {
  position: relative;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.lang-card-premium:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.08);
  border-color: var(--primary-border);
}

.lang-card-premium.active {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 10px 25px var(--primary-glow), inset 0 0 0 2px var(--primary);
  transform: scale(1.05);
}

.lang-card-premium.active::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  box-shadow: 0 0 20px var(--primary-glow);
  animation: electric-pulse 2s infinite;
  pointer-events: none;
}

@keyframes electric-pulse {
  0% { box-shadow: 0 0 0 0 var(--primary-glow); }
  50% { box-shadow: 0 0 20px var(--primary-glow); }
  100% { box-shadow: 0 0 0 0 var(--primary-glow); }
}

.lang-visual {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.25rem;
  position: relative;
  transition: all 0.4s var(--ease-premium);
  border: 1px solid var(--border-light);
}

.lang-card-premium:hover .lang-visual {
  transform: scale(1.1) rotate(5deg);
}

.lang-card-premium.active .lang-visual {
  background: white;
  border-color: var(--primary);
  transform: scale(1.05);
}

.lang-glow {
  position: absolute;
  inset: -10px;
  background: var(--lang-color);
  opacity: 0.05;
  filter: blur(15px);
  border-radius: 50%;
  transition: opacity 0.3s ease;
}

.lang-card-premium.active .lang-glow {
  opacity: 0.15;
}

.lang-title-text {
  font-weight: 800;
  color: var(--text-main);
  font-size: 1rem;
}

.lang-check {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 900;
  animation: pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes pop-in {
  0% { transform: scale(0) rotate(-45deg); opacity: 0; }
  70% { transform: scale(1.2) rotate(5deg); }
  100% { transform: scale(1) rotate(0); opacity: 1; }
}

/* Input Premium v2 */
.input-wrapper-premium {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-subtle);
  border-radius: 20px;
  border: 2px solid transparent;
  transition: all 0.3s var(--ease-premium);
  padding: 0 1.25rem;
}

.input-wrapper-premium:focus-within {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 10px 25px var(--primary-glow);
}

.input-prefix {
  font-size: 1.5rem;
  margin-right: 1rem;
}

.input-premium-v2 {
  flex: 1;
  background: transparent;
  border: none;
  padding: 1.25rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  outline: none;
}

.input-premium-v2::placeholder {
  color: var(--text-muted);
  font-weight: 600;
}

.input-focus-line {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: var(--primary);
  transition: all 0.4s var(--ease-premium);
  transform: translateX(-50%);
}

.input-wrapper-premium:focus-within .input-focus-line {
  width: 80%;
}

@keyframes scale-in {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

/* Choice Grid Premium */
.choice-grid-premium {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.choice-card-premium {
  position: relative;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.3s var(--ease-premium);
}

.choice-card-premium:hover {
  border-color: var(--primary-border);
  background: var(--bg-subtle);
  transform: translateX(10px);
}

.choice-card-premium.active {
  background: white;
  border-color: var(--primary);
  border-width: 2px;
  box-shadow: 0 10px 25px var(--primary-glow);
}

.choice-visual {
  width: 54px;
  height: 54px;
  background: var(--bg-subtle);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  transition: all 0.3s ease;
}

.choice-card-premium.active .choice-visual {
  background: var(--primary-soft);
  color: var(--primary);
}

.choice-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.choice-label {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--text-main);
}

.choice-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 500;
}

.choice-check {
  margin-left: auto;
  width: 24px;
  height: 24px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 900;
}

/* Textarea Premium */
.textarea-premium {
  width: 100%;
  background: var(--bg-subtle);
  border: 2px solid transparent;
  border-radius: 20px;
  padding: 1.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-main);
  resize: none;
  outline: none;
  transition: all 0.3s var(--ease-premium);
}

.textarea-premium:focus {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 10px 25px var(--primary-glow);
}

.textarea-wrapper-premium {
  position: relative;
}

.textarea-glow {
  position: absolute;
  inset: -20px;
  background: var(--primary);
  opacity: 0;
  filter: blur(30px);
  border-radius: 40px;
  pointer-events: none;
  transition: opacity 0.4s ease;
  z-index: -1;
}

.textarea-premium:focus + .textarea-glow {
  opacity: 0.05;
}

/* Context Type Grid Premium */
.context-type-grid-premium {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.context-type-card-premium {
  position: relative;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 28px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.4s var(--ease-premium);
}

.context-type-card-premium:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border-color: var(--primary-border);
}

.context-type-card-premium.active {
  background: white;
  border-color: var(--primary);
  border-width: 2px;
  box-shadow: 0 15px 35px var(--primary-glow);
  transform: scale(1.02) translateY(-4px);
}

.context-type-card-premium.active .type-visual {
  animation: bounce-subtle 2s infinite ease-in-out;
}

@keyframes bounce-subtle {
  0%, 100% { transform: scale(1.1) translateY(0); }
  50% { transform: scale(1.1) translateY(-5px); }
}

.type-visual {
  width: 56px;
  height: 56px;
  background: var(--bg-subtle);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  position: relative;
  transition: all 0.4s var(--ease-premium);
}

.context-type-card-premium.active .type-visual {
  background: var(--primary-soft);
  transform: scale(1.1);
}

.type-glow {
  position: absolute;
  inset: -8px;
  background: var(--primary);
  opacity: 0;
  filter: blur(12px);
  border-radius: 50%;
  transition: opacity 0.3s ease;
}

.context-type-card-premium.active .type-glow {
  opacity: 0.1;
}

.type-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.type-label {
  font-weight: 850;
  font-size: 1.15rem;
  color: var(--text-main);
}

.type-desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
  line-height: 1.4;
}

.type-active-indicator {
  position: absolute;
  top: 1.75rem;
  right: 1.75rem;
}

.type-active-indicator .dot {
  width: 10px;
  height: 10px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--primary-glow);
  animation: pulse-ring 2s infinite;
}

.context-type-card-premium.active::before {
  content: '✦';
  position: absolute;
  top: 10px;
  left: 10px;
  color: var(--primary);
  font-size: 1.2rem;
  animation: sparkle 1.5s infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.5) rotate(180deg); opacity: 0.5; }
}

/* Topic Chips Premium */
.topic-chip-grid-premium {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.topic-chip-premium {
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 99px;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.3s var(--ease-premium);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.topic-chip-premium:hover {
  background: var(--bg-subtle);
  border-color: var(--primary-border);
  transform: translateY(-2px);
}

.topic-chip-premium.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 8px 20px var(--primary-glow);
  transform: scale(1.05);
  position: relative;
}

.topic-chip-premium.active::after {
  content: '';
  position: absolute;
  inset: -2px;
  border: 2px solid var(--primary);
  border-radius: 99px;
  animation: ripple 1s ease-out;
  pointer-events: none;
}

@keyframes ripple {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(1.3); opacity: 0; }
}

.chip-dot {
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

/* Scenario Grid Premium */
.scenario-grid-premium {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.scenario-card-premium {
  position: relative;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  padding: 1.25rem 1.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.3s var(--ease-premium);
}

.scenario-card-premium:hover {
  border-color: var(--primary-border);
  background: var(--bg-subtle);
  transform: translateX(10px);
}

.scenario-card-premium.active {
  background: white;
  border-color: var(--primary);
  border-width: 2px;
  box-shadow: 0 10px 25px var(--primary-glow);
}

.scenario-content {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.scenario-text {
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--text-main);
}

.scenario-meta {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.scenario-icon-wrap {
  width: 40px;
  height: 40px;
  background: var(--bg-subtle);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.scenario-card-premium.active .scenario-icon-wrap {
  background: var(--primary);
  color: white;
}

.selection-count {
  font-size: 0.7rem;
  font-weight: 850;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  margin-left: auto;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s var(--ease-premium);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Config Grid Premium */
.config-grid-premium {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.config-item.full-width {
  grid-column: 1 / -1;
}

/* Proficiency Grid Premium */
.proficiency-grid-premium {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.lvl-card-premium {
  padding: 1.25rem;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s var(--ease-premium);
}

.lvl-card-premium:hover {
  transform: translateY(-4px);
  border-color: var(--primary-border);
  box-shadow: var(--shadow-md);
}

.lvl-card-premium.active {
  background: var(--primary-soft);
  border-color: var(--primary);
  box-shadow: 0 8px 20px var(--primary-glow);
}

.lvl-text {
  font-weight: 850;
  font-size: 1.1rem;
  color: var(--text-main);
}

.choice-grid-premium {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.choice-card-v2 {
  padding: 1rem;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s var(--ease-premium);
}

.choice-card-v2.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 5px 15px var(--primary-glow);
}

/* Format Buttons Premium */
.format-btn-premium {
  padding: 0.85rem 1.25rem;
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 14px;
  font-weight: 700;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.3s ease;
}

.format-btn-premium:hover {
  background: var(--bg-subtle);
  border-color: var(--border-main);
}

.format-btn-premium.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 5px 15px var(--primary-glow);
}

.premium-toggle {
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid var(--border-light);
  background: white;
}

.premium-toggle.active {
  border-color: var(--primary);
  background: var(--primary-soft);
}

/* Select Premium */
.select-wrapper-premium {
  position: relative;
  width: 100%;
}

.select-premium {
  width: 100%;
  appearance: none;
  background: var(--bg-subtle);
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.3s var(--ease-premium);
}

.select-premium:focus {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 10px 25px var(--primary-glow);
}

.select-arrow {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-muted);
  font-size: 1.25rem;
}

/* Format Toggle Grid */
.format-toggle-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.format-toggle-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--bg-subtle);
  border: 2px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s var(--ease-premium);
}

.format-toggle-card:hover {
  background: white;
  border-color: var(--border-light);
}

.format-toggle-card.active {
  background: white;
  border-color: var(--primary);
  box-shadow: 0 10px 25px var(--primary-glow);
}

.format-icon {
  font-size: 1.5rem;
}

.format-content {
  display: flex;
  flex-direction: column;
}

.format-title {
  font-weight: 800;
  color: var(--text-main);
  font-size: 1rem;
}

.format-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Review Grid Premium */
.review-grid-premium {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.review-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.review-item.full-width {
  grid-column: 1 / -1;
}

.review-label {
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-subtle);
}

.review-pill {
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  display: inline-flex;
  align-items: center;
}

.review-content-box {
  background: var(--bg-subtle);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  padding: 1.25rem;
  min-height: 80px;
}

.review-value {
  font-weight: 700;
  color: var(--text-main);
  font-size: 1.1rem;
}

/* Footer Actions Premium */
.dashboard-footer-premium {
  padding: 2rem 3rem;
  background: var(--bg-subtle);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-back-premium {
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 0.75rem 2rem;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-back-premium:hover {
  background: var(--border-light);
  color: var(--text-main);
}

.btn-next-premium, .btn-start-premium {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.75rem 2.5rem;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s var(--ease-premium);
  box-shadow: 0 4px 15px var(--primary-glow);
  position: relative;
  overflow: hidden;
}

.btn-primary:not(:disabled)::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.btn-primary:not(:disabled):hover::before {
  left: 100%;
}

.btn-primary:not(:disabled) {
  animation: energy-pulse 4s infinite;
}

@keyframes energy-pulse {
  0%, 100% { box-shadow: 0 4px 15px var(--primary-glow); }
  50% { box-shadow: 0 4px 25px var(--primary-glow), 0 0 0 4px var(--primary-soft); }
}

.btn-next-premium:hover:not(:disabled), .btn-start-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--primary-glow);
}

.btn-next-premium:disabled, .btn-start-premium:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(1);
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
  flex-wrap: nowrap;
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
  min-width: 0;
  flex: 1;
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
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  gap: 0.75rem;
  z-index: 10;
}

.btn-sm {
  padding: 0.4rem 1rem;
  font-size: 0.85rem;
}

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
  overflow: hidden;
}

.visual-circle-premium::before {
  content: '';
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 50%;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  from { top: -100%; }
  to { top: 200%; }
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
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

@media (min-width: 900px) {
  .session-summary-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 600px) and (max-width: 899px) {
  .session-summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
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
  width: 100%;
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
    width: 100%;
  }

  .preview-body {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    align-items: start;
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
  margin: 1.5rem 0;
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
  background: var(--primary-soft);
  color: var(--primary);
  border: 1px solid var(--primary-border);
  border-radius: 6px;
  font-weight: 700;
  transition: all 0.2s ease;
}

.mini-chip:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-1px);
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
  .lumina-dashboard {
    padding: 0.5rem;
    gap: 1rem;
  }

  .dashboard-header.compact {
    margin-bottom: 1rem;
  }

  .wizard-content {
    padding: 1rem;
    padding-top: 4rem; /* Space for top-right buttons */
    min-height: auto;
  }
  
  .wizard-actions {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    justify-content: flex-end;
  }
  
  .step-pane h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
  }

  .hero-title {
    font-size: 1.75rem;
    margin-bottom: 0.25rem;
  }

  .hero-subtitle {
    font-size: 0.95rem;
  }

  .premium-toggle {
    padding: 1.25rem;
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

  .context-type-grid-premium {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .proficiency-grid-premium {
    grid-template-columns: 1fr;
  }

  .review-grid-premium {
    grid-template-columns: 1fr;
  }

  .choice-grid-premium {
    grid-template-columns: 1fr 1fr;
  }

  .config-grid-premium {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .format-toggle-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-footer-premium {
    padding: 1.5rem;
    flex-direction: column-reverse;
  }

  .dashboard-footer-premium .btn-next-premium,
  .dashboard-footer-premium .btn-start-premium,
  .dashboard-footer-premium .btn-back-premium {
    width: 100%;
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
