import { ref } from 'vue';

// Background music for the public site (never in the admin).
//
// - Tracks play in a random order, reshuffled on every visit; the first
//   track is never the one the same visitor started with last time, and a
//   new round never starts with the track that just ended.
// - Browsers block sound until the visitor interacts with the page, so the
//   music starts on the first click / tap / key press (scrolling doesn't count).
// - The mute button (MusicToggle, in the navbar) is remembered; the music
//   pauses while the tab is hidden.
// - Volume fades are a bonus only: iPhone Safari ignores `audio.volume`, so
//   pausing never waits for a fade to finish.
//
// Module-level state: App.vue starts it once, the navbar button shares it.
const TRACKS = [
  '/audio/alex-morgan-ambient-lofi.mp3',
  '/audio/atlasaudio-ambient-piano.mp3',
  '/audio/leberch-peaceful-piano.mp3'
];
const VOLUME = 0.35;
const FADE_STEPS = 18; // ~1 s at 60 ms a step
const MUTED_KEY = 'music-muted';
const LAST_FIRST_KEY = 'music-last-first';

const muted = ref(read(MUTED_KEY) === '1');
const playing = ref(false);

let audio = null;
let queue = [];
let current = null;
let fadeTimer = null;
let resumeOnShow = false;
let blocked = () => false; // set by start(): true on admin pages
let started = false;

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

// Fade-in only, over a fixed number of steps (works where volume is
// settable, harmless where it isn't)
function fadeIn() {
  clearInterval(fadeTimer);
  let step = 0;
  try {
    audio.volume = 0;
  } catch {
    // read-only volume
  }
  fadeTimer = setInterval(() => {
    step++;
    try {
      audio.volume = Math.min(VOLUME, (VOLUME * step) / FADE_STEPS);
    } catch {
      // read-only volume
    }
    if (step >= FADE_STEPS) clearInterval(fadeTimer);
  }, 60);
}

function startTrack(src) {
  if (!audio) return;
  audio.src = src;
  if (playing.value) audio.play().catch(() => { playing.value = false; });
}

export async function play() {
  if (muted.value || blocked() || playing.value) return;
  if (!audio) {
    audio = new Audio();
    audio.preload = 'auto';
    audio.addEventListener('ended', () => startTrack(nextTrack()));
    audio.addEventListener('error', () => startTrack(nextTrack())); // missing file: skip it
    audio.src = nextTrack();
  }
  try {
    playing.value = true;
    await audio.play();
    if (muted.value || blocked()) return pause(); // muted while it was starting
    fadeIn();
  } catch {
    playing.value = false; // not allowed yet (no interaction): the next click / tap retries
  }
}

export function pause() {
  clearInterval(fadeTimer);
  playing.value = false;
  audio?.pause();
}

export function toggleMusic() {
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

function onVisibility() {
  if (document.hidden) {
    resumeOnShow = playing.value;
    pause();
  } else if (resumeOnShow) {
    resumeOnShow = false;
    play();
  }
}

// Called once by App.vue. `isBlocked` returns true where no music should play.
export function startAmbientMusic(isBlocked) {
  if (started) return;
  started = true;
  blocked = isBlocked;
  // A different opening track from this visitor's previous visit
  queue = shuffled(read(LAST_FIRST_KEY));
  write(LAST_FIRST_KEY, queue[0]);
  ['pointerdown', 'keydown', 'touchend'].forEach((e) => window.addEventListener(e, onInteraction, { passive: true }));
  document.addEventListener('visibilitychange', onVisibility);
  play(); // works right away when the browser allows it
}

export function useAmbientMusic() {
  return { muted, playing, toggle: toggleMusic };
}
