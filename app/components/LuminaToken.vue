<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
  text: string;
  reading?: string;
  romaji?: string;
  meaning?: string;
  colorIndex?: number | string;
  variant?: 'premium' | 'simple' | 'mini';
}>();

const showTooltip = ref(false);
const tooltipStyle = ref({ top: '0px', left: '0px', transform: 'none' });
const tokenRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);

function updatePosition() {
  if (!tokenRef.value) return;
  const rect = tokenRef.value.getBoundingClientRect();
  
  // Position above the token, centered horizontally
  // Bottom of tooltip = rect.top - gap
  // We'll set top to rect.top and use transform to move it up
  tooltipStyle.value = {
    top: `${rect.top}px`,
    left: `${rect.left + rect.width / 2}px`,
    transform: 'translateX(-50%) translateY(-100%) translateY(-8px)'
  };
}

function handleEnter() {
  showTooltip.value = true;
  // Use nextTick or a small timeout to ensure rect is updated if layout changed
  updatePosition();
}

function handleLeave() {
  showTooltip.value = false;
}

// Update position on scroll or resize to keep it attached to the token
onMounted(() => {
  window.addEventListener('scroll', updatePosition, true);
  window.addEventListener('resize', updatePosition);
});

onUnmounted(() => {
  window.removeEventListener('scroll', updatePosition, true);
  window.removeEventListener('resize', updatePosition);
});
</script>

<template>
  <span 
    ref="tokenRef"
    class="lumina-token" 
    :class="[variant || 'premium', colorIndex ? `token-${colorIndex}` : '']"
    @mouseenter="handleEnter"
    @mouseleave="handleLeave"
    @focusin="handleEnter"
    @focusout="handleLeave"
  >
    <template v-if="variant === 'simple'">
      {{ text }}
    </template>
    <template v-else>
      <span class="token-content" tabindex="0">
        <ruby v-if="reading && text !== reading">
          {{ text }}
          <rt>{{ reading }}</rt>
        </ruby>
        <span v-else>{{ text }}</span>
        
        <Teleport to="body">
          <Transition name="tooltip-fade">
            <span 
              v-if="(meaning || romaji) && showTooltip" 
              ref="tooltipRef"
              class="token-tooltip teleported"
              :style="tooltipStyle"
            >
              <div v-if="romaji" class="tooltip-romaji">{{ romaji }}</div>
              <div v-if="romaji && meaning" class="tooltip-divider"></div>
              <div v-if="meaning" class="tooltip-meaning">{{ meaning }}</div>
            </span>
          </Transition>
        </Teleport>
      </span>
    </template>
  </span>
</template>

<style scoped>
.lumina-token {
  display: inline-block;
  position: relative;
}

.token-content {
  position: relative;
  cursor: help;
  padding: 0.25rem 0.4rem;
  border-radius: 8px;
  font-weight: 850;
  transition: all 0.2s ease;
  display: inline-block;
  z-index: 1;
  outline: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.token-content:hover,
.token-content:focus,
.token-content:focus-within {
  background: var(--bg-subtle);
  z-index: 10000;
}

.premium .token-content {
  font-size: 1.15em;
}

.mini .token-content {
  font-size: 0.95em;
  padding: 0.15rem 0.3rem;
  border-radius: 6px;
}

.token-tooltip {
  position: fixed; /* Use fixed for teleported tooltips */
  background: #121826;
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  z-index: 99999; /* Max possible */
  box-shadow: 
    0 10px 30px rgba(0,0,0,0.35),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 100px;
}

.tooltip-romaji {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 900;
  color: #ffffff !important;
  letter-spacing: 0.03em;
  line-height: 1.2;
}

.tooltip-divider {
  width: 30px;
  height: 1.5px;
  background: rgba(255, 255, 255, 0.4);
  margin: 0.15rem 0;
  border-radius: 1px;
}

.tooltip-meaning {
  font-weight: 700;
  font-size: 0.85rem;
  color: #ffffff !important;
  line-height: 1.2;
  white-space: normal;
  max-width: 180px;
}

/* Tooltip arrow */
.token-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 8px;
  border-style: solid;
  border-color: #121826 transparent transparent transparent;
}

/* Transitions */
.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: all 0.25s var(--ease-premium);
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-100%) translateY(0px) !important;
}

.token-simple {
  font-weight: 600;
}

ruby { ruby-position: over; }
rt { font-size: 0.55em; color: var(--text-subtle); font-weight: 500; }

.token-0 { color: #3b82f6; }
.token-1 { color: #10b981; }
.token-2 { color: #8b5cf6; }
.token-3 { color: #f59e0b; }
.token-4 { color: #ef4444; }
</style>
