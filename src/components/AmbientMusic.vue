<template>
  <button
    v-if="!isAdmin"
    type="button"
    data-music-toggle
    @click="toggle"
    class="fixed left-4 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-50 grid h-11 w-11 place-items-center rounded-full border border-line bg-nav text-ink shadow-card backdrop-blur-md transition-colors hover:bg-surface-hover md:h-12 md:w-12 lg:bottom-8 lg:left-8"
    :aria-label="muted ? $t('music.unmute') : $t('music.mute')"
    :title="muted ? $t('music.unmute') : $t('music.mute')"
    :aria-pressed="!muted"
  >
    <VolumeX v-if="muted" class="h-5 w-5 text-muted" />
    <!-- Little equalizer while the music is actually playing -->
    <span v-else-if="playing" class="flex h-4 items-end gap-[3px]" aria-hidden="true">
      <span v-for="n in 3" :key="n" class="music-bar w-[3px] rounded-full bg-brand-text" :style="{ animationDelay: `${(n - 1) * 0.18}s` }"></span>
    </span>
    <Volume2 v-else class="h-5 w-5 text-brand-text" />
  </button>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { Volume2, VolumeX } from 'lucide-vue-next';

// Background music for the public site (never in the admin).
//
// - Tracks play in a random order, reshuffled on every visit; the first
//   track is never the one the same visitor started with last time, and a
//   new round never starts with the track that just ended.
// - Browsers block sound until the visitor interacts with the page, so the
//   music starts on the first click / tap / key press (scrolling doesn't count).
// - The mute button is remembered; the music pauses while the tab is hidden.
const TRACKS = [
  '/audio/alex-morgan-ambient-lofi.mp3',
  '/audio/atlasaudio-ambient-piano.mp3',
  '/audio/leberch-peaceful-piano.mp3'
];
const VOLUME = 0.35;
const MUTED_KEY = 'music-muted';
const LAST_FIRST_KEY = 'music-last-first';

const route = useRoute();
const isAdmin = computed(() => route.path.startsWith('/admin'));

const muted = ref(read(MUTED_KEY) === '1');
const playing = ref(false);

let audio = null;
let queue = [];
let current = null;
let fadeTimer = null;
let resumeOnShow = false;

function read(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: the choice lasts for this visit
  }
}

// Fisher-Yates shuffle; `avoid` (if any) is moved away from the first place
function shuffled(avoid) {
  const list = [...TRACKS];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  if (avoid && list.length > 1 && list[0] === avoid) {
    const j = 1 + Math.floor(Math.random() * (list.length - 1));
    [list[0], list[j]] = [list[j], list[0]];
  }
  return list;
}

function nextTrack() {
  if (!queue.length) queue = shuffled(current);
  current = queue.shift();
  return current;
}

function fadeTo(target, done) {
  clearInterval(fadeTimer);
  fadeTimer = setInterval(() => {
    const delta = target - audio.volume;
    if (Math.abs(delta) < 0.02) {
      audio.volume = target;
      clearInterval(fadeTimer);
      done?.();
      return;
    }
    audio.volume = Math.min(1, Math.max(0, audio.volume + Math.sign(delta) * 0.02));
  }, 60);
}

async function play() {
  if (muted.value || isAdmin.value || playing.value) return;
  if (!audio) {
    audio = new Audio();
    audio.preload = 'auto';
    audio.addEventListener('ended', () => startTrack(nextTrack()));
    audio.addEventListener('error', () => startTrack(nextTrack())); // missing file: skip it
    audio.src = nextTrack();
  }
  try {
    audio.volume = 0;
    await audio.play();
    playing.value = true;
    fadeTo(VOLUME);
  } catch {
    // Not allowed yet (no interaction): the next click / tap retries
  }
}

function startTrack(src) {
  if (!audio) return;
  audio.src = src;
  if (playing.value) audio.play().catch(() => { playing.value = false; });
}

function pause() {
  if (!audio || !playing.value) return;
  playing.value = false;
  fadeTo(0, () => audio.pause());
}

function toggle() {
  muted.value = !muted.value;
  write(MUTED_KEY, muted.value ? '1' : '0');
  if (muted.value) pause();
  else play();
}

// First interaction anywhere on the page (except the button itself, which
// handles its own click) starts the music
function onInteraction(event) {
  if (event.target?.closest?.('[data-music-toggle]')) return;
  play();
}
const INTERACTIONS = ['pointerdown', 'keydown', 'touchend'];

function onVisibility() {
  if (document.hidden) {
    resumeOnShow = playing.value;
    pause();
  } else if (resumeOnShow) {
    resumeOnShow = false;
    play();
  }
}

onMounted(() => {
  // A different opening track from this visitor's previous visit
  queue = shuffled(read(LAST_FIRST_KEY));
  write(LAST_FIRST_KEY, queue[0]);
  INTERACTIONS.forEach((e) => window.addEventListener(e, onInteraction, { passive: true }));
  document.addEventListener('visibilitychange', onVisibility);
  play(); // works right away when the browser allows it
});

onUnmounted(() => {
  INTERACTIONS.forEach((e) => window.removeEventListener(e, onInteraction));
  document.removeEventListener('visibilitychange', onVisibility);
  clearInterval(fadeTimer);
  audio?.pause();
});

watch(isAdmin, (admin) => (admin ? pause() : play()));
</script>

<style scoped>
.music-bar {
  height: 40%;
  animation: music-bar 0.9s ease-in-out infinite alternate;
}
@keyframes music-bar {
  from { height: 25%; }
  to { height: 100%; }
}
</style>
