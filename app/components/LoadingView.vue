<template>
  <div class="loading-container animate-in">
    <div class="loading-content card-premium glass">
      <div class="loader-visual">
        <div class="orbit">
          <div class="planet"></div>
          <div class="satellite"></div>
        </div>
        <div class="core">
          <span class="pulse"></span>
        </div>
      </div>

      <div class="loading-text">
        <h2 class="status-title">{{ currentMessage }}</h2>
        <div class="progress-bar">
          <div class="progress-fill"></div>
        </div>
        <p class="status-subtitle">Gemini is crafting your personalized experience</p>
      </div>

      <div class="fact-box" v-if="currentFact">
        <span class="fact-icon">💡</span>
        <p class="fact-text">{{ currentFact }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const messages = [
  "Analyzing your proficiency...",
  "Gathering linguistic data...",
  "Generating grammar challenges...",
  "Curating relevant vocabulary...",
  "Building your personalized quiz...",
  "Finalizing interactive tokens...",
  "Optimizing for your learning goal..."
];

const facts = [
  "Did you know? The most translated book is the Bible, followed by The Little Prince.",
  "Language fact: There are over 7,000 languages spoken in the world today.",
  "Pro tip: Consistency is more important than intensity when learning a language.",
  "AI note: Lumina uses Gemini Flash for lightning-fast educational content generation.",
  "Culture tip: Many Japanese words describe feelings that have no direct English translation.",
  "Grammar fact: English is a Germanic language, but more than half of its vocabulary comes from French and Latin."
];

const currentMessage = ref(messages[0]);
const currentFact = ref(facts[0]);
let messageIndex = 0;
let factIndex = 0;

onMounted(() => {
  const msgInterval = setInterval(() => {
    messageIndex = (messageIndex + 1) % messages.length;
    currentMessage.value = messages[messageIndex];
  }, 2500);

  const factInterval = setInterval(() => {
    factIndex = (factIndex + 1) % facts.length;
    currentFact.value = facts[factIndex];
  }, 6000);

  onUnmounted(() => {
    clearInterval(msgInterval);
    clearInterval(factInterval);
  });
});
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  width: 100%;
}

.loading-content {
  width: 100%;
  max-width: 500px;
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  text-align: center;
}

/* Loader Visuals */
.loader-visual {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orbit {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px dashed var(--border-light);
  border-radius: 50%;
  animation: rotate 10s linear infinite;
}

.planet {
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: var(--primary);
  border-radius: 50%;
  box-shadow: 0 0 15px var(--primary-glow);
}

.satellite {
  position: absolute;
  bottom: 10%;
  right: 10%;
  width: 6px;
  height: 6px;
  background: var(--secondary);
  border-radius: 50%;
}

.core {
  width: 40px;
  height: 40px;
  background: var(--primary-soft);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse {
  width: 20px;
  height: 20px;
  background: var(--primary);
  border-radius: 6px;
  animation: pulse-morph 2s infinite ease-in-out;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse-morph {
  0%, 100% { transform: scale(1); border-radius: 6px; }
  50% { transform: scale(1.5); border-radius: 50%; opacity: 0.5; }
}

/* Text and Progress */
.loading-text {
  width: 100%;
}

.status-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 1.5rem;
  height: 1.8rem; /* Maintain height for transitions */
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--bg-subtle);
  border-radius: 99px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, var(--primary-light), var(--primary));
  border-radius: 99px;
  animation: slide-progress 2s infinite ease-in-out;
}

@keyframes slide-progress {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}

.status-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 600;
}

/* Fact Box */
.fact-box {
  background: rgba(0, 0, 0, 0.03);
  padding: 1.25rem;
  border-radius: var(--radius-md);
  border-left: 4px solid var(--primary);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  text-align: left;
  animation: fade-in 0.5s ease-out;
}

.fact-icon {
  font-size: 1.2rem;
}

.fact-text {
  font-size: 0.85rem;
  color: var(--text-subtle);
  line-height: 1.5;
  margin: 0;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
