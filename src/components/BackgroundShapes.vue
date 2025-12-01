<template>
  <svg v-if="type === 'timeline'" class="absolute inset-0 w-full h-full pointer-events-none -z-10" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Ligne ondulée abstraite -->
    <path d="M0,160 C360,320 1080,0 1440,160" stroke="#ec4899" stroke-width="3" stroke-linecap="round" stroke-dasharray="12 8"/>
    <!-- Cercle abstrait -->
    <circle cx="1200" cy="80" r="60" stroke="#a78bfa" stroke-width="2" stroke-dasharray="6 6"/>
    <!-- Courbe supplémentaire -->
    <path d="M200,300 Q400,100 800,200 T1440,100" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-dasharray="10 10"/>
  </svg>
  <svg v-else-if="type === 'about'" class="absolute inset-0 w-full h-full pointer-events-none -z-10" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- Exemple: blob abstrait -->
    <path d="M200,160 Q400,80 600,160 T1000,160 Q1200,240 1440,160" stroke="#f59e42" stroke-width="3" stroke-linecap="round" stroke-dasharray="14 10"/>
    <ellipse cx="300" cy="80" rx="60" ry="30" stroke="#f472b6" stroke-width="2" stroke-dasharray="8 8"/>
  </svg>
  <!-- Ajoute d'autres variantes pour chaque section -->
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -10;
  pointer-events: none;
}
</style>
