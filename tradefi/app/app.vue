<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.UButton:hover, button:hover, .btn:hover {
  background: linear-gradient(90deg, var(--color-green-500), var(--color-gold-400));
  color: #fff !important;
  border-color: var(--color-gold-400);
  box-shadow: 0 0 12px 0 var(--color-gold-400), 0 4px 32px 0 rgba(0,0,0,0.18);
  transform: translateY(-2px) scale(1.04);
}

/* Remove the active-glow class if present */
.active-glow {
  box-shadow: none !important;
}
</style>
