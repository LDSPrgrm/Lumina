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
  padding: 0.2rem 0.35rem;
  border-radius: 8px;
  font-weight: 850;
  transition: all 0.2s ease;
  display: inline-block;
  z-index: 1;
}

.token-content:hover {
  background: var(--bg-subtle);
  z-index: 2100; /* Bring hovered token above others */
}

.premium .token-content {
  font-size: 1.1em;
}

.mini .token-content {
  font-size: 0.9em;
  padding: 0.1rem 0.2rem;
  border-radius: 6px;
}

.token-tooltip {
  visibility: hidden;
  position: absolute;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: var(--text-main);
  color: white;
  padding: 0.65rem 1rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  z-index: 2200;
  opacity: 0;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  transition: all 0.25s var(--ease-premium);
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-width: 80px;
}

.tooltip-romaji {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  opacity: 0.7;
  font-style: italic;
  letter-spacing: 0.05em;
}

.tooltip-meaning {
  font-weight: 700;
}

/* Tooltip arrow */
.token-tooltip::after {
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px;
  border-style: solid;
  border-color: var(--text-main) transparent transparent transparent;
}

.token-content:hover .token-tooltip,
.token-content:focus .token-tooltip,
.token-content:focus-within .token-tooltip {
  visibility: visible;
  opacity: 1;
  transform: translateX(-50%) translateY(-8px);
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
