<template>
  <div>
    <!-- Native scroll-snap track: 1 card per view on phones, 2 on tablets, 3 on desktop -->
    <ul
      ref="track"
      class="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] md:mx-0 md:gap-6 md:px-0 [&::-webkit-scrollbar]:hidden"
      :aria-label="label"
      @scroll.passive="onTrackScroll"
    >
      <li
        v-for="(item, i) in items"
        :key="item.key ?? i"
        class="w-[86%] shrink-0 snap-center md:w-[calc(50%-0.75rem)] md:snap-start lg:w-[calc((100%-3rem)/3)]"
      >
        <slot :item="item" :index="i" />
      </li>
    </ul>
    <div v-if="items.length > 1 && !(atStart && atEnd)" class="mt-6 flex items-center justify-center gap-4 md:justify-between">
      <div class="flex flex-wrap justify-center gap-1.5">
        <button
          v-for="(item, i) in items"
          :key="item.key ?? i"
          type="button"
          @click="goTo(i)"
          :aria-label="`${i + 1} / ${items.length}`"
          :aria-current="active === i ? 'true' : undefined"
          class="grid h-6 place-items-center px-0.5"
        >
          <span :class="['block h-1.5 rounded-full transition-all duration-300', active === i ? 'w-6 bg-brand-text' : 'w-1.5 bg-line-strong']"></span>
        </button>
      </div>
      <div class="hidden gap-2 md:flex">
        <button type="button" @click="step(-1)" :disabled="atStart" class="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface shadow-card transition-colors hover:bg-surface-hover disabled:opacity-30" :aria-label="$t('projectDetail.previous')">
          <ChevronLeft class="h-5 w-5" />
        </button>
        <button type="button" @click="step(1)" :disabled="atEnd" class="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface shadow-card transition-colors hover:bg-surface-hover disabled:opacity-30" :aria-label="$t('projectDetail.next')">
          <ChevronRight class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

// Horizontal carousel of cards (default slot = one card), same behaviour as
// the projects carousel: swipe, dots, arrows one card at a time, controls
// hidden when every card already fits.
const props = defineProps({
  items: { type: Array, required: true },
  label: { type: String, default: '' }
});

const track = ref(null);
const active = ref(0);
const atStart = ref(true);
const atEnd = ref(false);
// Phones snap cards to the center, larger screens to the start
const centered = () => window.innerWidth < 768;

function onTrackScroll() {
  const el = track.value;
  if (!el?.children.length) return;
  atStart.value = el.scrollLeft <= 4;
  atEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
  if (atEnd.value) {
    active.value = el.children.length - 1;
    return;
  }
  const anchor = centered() ? el.scrollLeft + el.clientWidth / 2 : el.scrollLeft;
  let best = 0;
  let bestDistance = Infinity;
  [...el.children].forEach((child, i) => {
    const point = centered() ? child.offsetLeft + child.clientWidth / 2 : child.offsetLeft;
    const distance = Math.abs(point - anchor);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = i;
    }
  });
  active.value = best;
}

function goTo(i) {
  const child = track.value?.children[i];
  if (!child) return;
  const left = centered() ? child.offsetLeft - (track.value.clientWidth - child.clientWidth) / 2 : child.offsetLeft;
  track.value.scrollTo({ left });
}

function step(direction) {
  const el = track.value;
  if (!el?.children.length) return;
  const [first, second] = el.children;
  const gap = second ? second.offsetLeft - first.offsetLeft - first.clientWidth : 0;
  el.scrollBy({ left: direction * (first.clientWidth + gap) });
}

const onResize = () => onTrackScroll();
onMounted(() => {
  window.addEventListener('resize', onResize, { passive: true });
  nextTick(onTrackScroll);
});
onUnmounted(() => window.removeEventListener('resize', onResize));
watch(() => props.items, () => nextTick(onTrackScroll));
</script>
