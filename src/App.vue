<script setup>
import AmbientMusic from './components/AmbientMusic.vue'
</script>

<template>
  <router-view />
  <!-- Outside the views so the music keeps playing from page to page -->
  <AmbientMusic />
</template>
