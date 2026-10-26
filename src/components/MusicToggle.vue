<template>
  <button
    type="button"
    data-music-toggle
    @click="toggle"
    class="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--fig-red)]/40 bg-surface transition-colors hover:bg-surface-hover touch-manipulation"
    :aria-label="muted ? $t('music.unmute') : $t('music.mute')"
    :title="muted ? $t('music.unmute') : $t('music.mute')"
    :aria-pressed="!muted"
  >
    <VolumeX v-if="muted" class="h-4 w-4 text-muted" />
    <!-- Red equalizer while the music is actually playing -->
    <span v-else-if="playing" class="flex h-3.5 items-end gap-[3px]" aria-hidden="true">
      <span v-for="n in 3" :key="n" class="music-bar w-[3px] rounded-full" :style="{ animationDelay: `${(n - 1) * 0.18}s` }"></span>
    </span>
    <Volume2 v-else class="h-4 w-4 text-[color:var(--fig-red)]" />
  </button>
</template>

<script setup>
import { Volume2, VolumeX } from 'lucide-vue-next';
import { useAmbientMusic } from '../composables/useAmbientMusic';

// Navbar button: mute / play the background music (see useAmbientMusic.js)
const { muted, playing, toggle } = useAmbientMusic();
</script>

<style scoped>
.music-bar {
  height: 40%;
  background: var(--fig-red);
  animation: music-bar 0.9s ease-in-out infinite alternate;
}
@keyframes music-bar {
  from { height: 25%; }
  to { height: 100%; }
}
</style>
