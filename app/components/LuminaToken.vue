<script setup lang="ts">
defineProps<{
  text: string;
  reading?: string;
  romaji?: string;
  meaning?: string;
  colorIndex?: number | string;
  variant?: 'premium' | 'simple' | 'mini';
}>();
</script>

<template>
  <span class="lumina-token" :class="[variant || 'premium', colorIndex ? `token-${colorIndex}` : '']">
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
        
        <span v-if="meaning || romaji" class="token-tooltip">
          <div v-if="romaji" class="tooltip-romaji">{{ romaji }}</div>
          <div v-if="romaji && meaning" class="tooltip-divider"></div>
          <div v-if="meaning" class="tooltip-meaning">{{ meaning }}</div>
        </span>
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
  z-index: 10000; /* Extremely high to ensure tooltips are on top */
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
  visibility: hidden;
  position: absolute;
  bottom: 135%;
  left: 50%;
  transform: translateX(-50%) translateY(5px);
  background: #121826;
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  border-radius: 14px;
  font-size: 0.9rem;
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  z-index: 20000;
  opacity: 0;
  box-shadow: 
    0 10px 30px rgba(0,0,0,0.35),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: all 0.25s var(--ease-premium);
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

.token-content:hover .token-tooltip,
.token-content:focus .token-tooltip,
.token-content:focus-within .token-tooltip,
.token-content:active .token-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(-10px);
}

.token-simple {
  font-weight: 600;
}

ruby { ruby-position: over; }
rt { font-size: 0.55em; color: var(--text-subtle); font-weight: 500; }

/* Color tokens - fallback if not in main.css */
.token-0 { color: #3b82f6; }
.token-1 { color: #10b981; }
.token-2 { color: #8b5cf6; }
.token-3 { color: #f59e0b; }
.token-4 { color: #ef4444; }
</style>
