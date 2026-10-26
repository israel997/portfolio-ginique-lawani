<script setup>
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { startAmbientMusic, play, pause } from './composables/useAmbientMusic'

// Background music, started here (outside the views) so it keeps playing
// from page to page; never in the admin. The button is in the navbar.
const route = useRoute()
const inAdmin = () => route.path.startsWith('/admin')
onMounted(() => startAmbientMusic(inAdmin))
watch(() => route.path, () => (inAdmin() ? pause() : play()))
</script>

<template>
  <router-view />
</template>
