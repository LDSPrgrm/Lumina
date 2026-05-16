<template>
  <header class="app-header">
    <div class="header-content">
      <div class="brand">
        <div class="logo-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12H22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2617 12 22C9.49872 19.2617 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="brand-name">Lumina</span>
      </div>
      <nav class="header-nav">
        <slot name="nav"></slot>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(24px) saturate(160%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.4);
  padding: 0.75rem 0;
}

.header-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.brand:hover {
  opacity: 0.8;
}

.logo-box {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--primary), #00f2fe);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 220, 130, 0.2);
}

.brand-name {
  font-size: 1.35rem;
  font-weight: 850;
  color: var(--text-main);
  letter-spacing: -0.03em;
  background: linear-gradient(to bottom right, var(--text-main), var(--text-muted));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  min-width: 0;
  overflow: hidden;
}

@media (max-width: 640px) {
  .brand-name {
    display: none;
  }
  
  .header-content {
    padding: 0 1rem;
  }
}
</style>
