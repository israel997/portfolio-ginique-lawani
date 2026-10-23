<template>
  <div
    class="relative"
    aria-roledescription="carousel"
    :aria-label="label"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <!-- Native scroll-snap track: swipe works on touch for free -->
    <ul
      ref="track"
      class="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] md:mx-0 md:gap-6 md:px-0 [&::-webkit-scrollbar]:hidden"
      @scroll.passive="onScroll"
      @pointerdown="interacted"
      @touchstart.passive="interacted"
    >
      <li
        v-for="(item, i) in items"
        :key="item.key"
        class="w-[86%] shrink-0 snap-center sm:w-[70%] md:w-[calc(50%-0.75rem)] md:snap-start"
        :aria-label="`${i + 1} / ${items.length}`"
        aria-roledescription="slide"
      >
        <figure class="h-full overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          <!-- Photos come in every orientation: show them whole, letterboxed -->
          <component
            :is="zoomable ? 'button' : 'div'"
            :type="zoomable ? 'button' : undefined"
            class="group relative block aspect-[4/3] w-full overflow-hidden border-b border-line bg-panel-deep"
            :aria-label="zoomable ? `Agrandir l'image ${i + 1}` : undefined"
            @click="zoomable && $emit('open', i)"
          >
            <img
              :src="item.src"
              :alt="item.title || item.text || ''"
              :loading="i < 2 ? 'eager' : 'lazy'"
              decoding="async"
              class="h-full w-full object-contain"
            />
            <span class="absolute left-3 top-3 rounded-md bg-slate-950/70 px-2 py-1 font-mono text-[10px] tracking-wider text-white/80">
              {{ String(i + 1).padStart(2, '0') }} / {{ String(items.length).padStart(2, '0') }}
            </span>
            <span v-if="zoomable" class="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-slate-950/70 text-white md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
              <Maximize2 class="h-4 w-4" />
            </span>
          </component>
          <figcaption v-if="item.title || item.text" class="p-5 md:p-6">
            <h3 v-if="item.title" class="text-lg md:text-xl font-semibold mb-2">{{ item.title }}</h3>
            <p v-if="item.text" class="whitespace-pre-line text-sm md:text-[15px] leading-relaxed text-muted">{{ item.text }}</p>
          </figcaption>
        </figure>
      </li>
    </ul>

    <div v-if="items.length > 1" class="mt-6 flex items-center justify-center gap-4 md:justify-between">
      <div class="flex flex-wrap items-center justify-center gap-1.5" role="tablist">
        <button
          v-for="(item, i) in items"
          :key="item.key"
          type="button"
          role="tab"
          :aria-selected="active === i"
          :aria-label="`${i + 1}`"
          @click="interacted(); goTo(i)"
          class="grid h-6 place-items-center px-0.5"
        >
          <span :class="['block h-1.5 rounded-full transition-all duration-300', active === i ? 'w-6 bg-brand-text' : 'w-1.5 bg-line-strong']"></span>
        </button>
      </div>
      <div class="hidden gap-2 md:flex">
        <button type="button" @click="interacted(); goTo(active - 1)" :disabled="active === 0" class="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface transition-colors hover:bg-surface-hover disabled:opacity-30" aria-label="Précédent">
          <ChevronLeft class="h-5 w-5" />
        </button>
        <button type="button" @click="interacted(); goTo(active + 1)" :disabled="active >= items.length - 1" class="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface transition-colors hover:bg-surface-hover disabled:opacity-30" aria-label="Suivant">
          <ChevronRight class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-vue-next';

// Swipeable image carousel with optional title + text under each image.
// Used by the home "Ce que je sais faire" section and project galleries.
//   items: [{ key, src, title?, text? }]
const props = defineProps({
  items: { type: Array, required: true },
  label: { type: String, default: '' },
  autoplay: { type: Boolean, default: true },
  // Clicking an image emits `open` with its index (e.g. for a lightbox)
  zoomable: Boolean
});
defineEmits(['open']);

const AUTOPLAY_MS = 5000;
// After a manual swipe/click, wait before resuming autoplay
const RESUME_AFTER_MS = 10000;

const track = ref(null);
const active = ref(0);
const paused = ref(false);
const inView = ref(false);
let lastInteraction = 0;
let timer = null;
let observer = null;

function slides() {
  return track.value ? [...track.value.children] : [];
}

// The track is position:relative, so each slide's offsetLeft is measured
// from the track's padding edge and doesn't change while scrolling.
function goTo(i) {
  const list = slides();
  if (!list.length) return;
  const el = list[(i + list.length) % list.length];
  const centered = window.innerWidth < 768; // mobile snaps to center, desktop to start
  const left = centered ? el.offsetLeft - (track.value.clientWidth - el.clientWidth) / 2 : el.offsetLeft;
  track.value.scrollTo({ left });
}

function onScroll() {
  const list = slides();
  if (!list.length) return;
  const { scrollLeft, clientWidth, scrollWidth } = track.value;
  // At the right edge on desktop the last slide can never become "first"
  if (scrollLeft + clientWidth >= scrollWidth - 4) {
    active.value = list.length - 1;
    return;
  }
  const anchor = window.innerWidth < 768 ? scrollLeft + clientWidth / 2 : scrollLeft;
  let best = 0;
  let bestDistance = Infinity;
  list.forEach((el, i) => {
    const point = window.innerWidth < 768 ? el.offsetLeft + el.clientWidth / 2 : el.offsetLeft;
    const distance = Math.abs(point - anchor);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  });
  active.value = best;
}

function interacted() {
  lastInteraction = Date.now();
}

function tick() {
  if (paused.value || !inView.value || props.items.length < 2) return;
  if (Date.now() - lastInteraction < RESUME_AFTER_MS) return;
  goTo(active.value >= props.items.length - 1 ? 0 : active.value + 1);
}

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!props.autoplay || reducedMotion) return;
  // Only autoplay while the carousel is on screen
  observer = new IntersectionObserver(([entry]) => { inView.value = entry.isIntersecting; }, { threshold: 0.4 });
  if (track.value) observer.observe(track.value);
  timer = setInterval(tick, AUTOPLAY_MS);
});

onUnmounted(() => {
  clearInterval(timer);
  observer?.disconnect();
});
</script>
