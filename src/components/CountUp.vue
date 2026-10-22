<template>
  <span ref="el" :aria-label="value">{{ display }}</span>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

// Counts up to a figure such as "8+", "15+" or "02" the first time it scrolls
// into view. Text around the number is kept, and so is zero padding ("02").
const props = defineProps({
  value: { type: [String, Number], default: '' },
  duration: { type: Number, default: 1400 }
});

const el = ref(null);
const display = ref('');
let observer = null;
let frame = null;
let started = false;

function parts() {
  const match = String(props.value ?? '').match(/^(\D*)(\d+)(.*)$/);
  if (!match) return null;
  // Pad only figures written with a leading zero ("02"), not "15+"
  const width = match[2].length > 1 && match[2].startsWith('0') ? match[2].length : 1;
  return { prefix: match[1], target: Number(match[2]), width, suffix: match[3] };
}

function format(p, n) {
  return `${p.prefix}${String(n).padStart(p.width, '0')}${p.suffix}`;
}

function run() {
  const p = parts();
  if (!p) {
    display.value = String(props.value ?? '');
    return;
  }
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / props.duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    display.value = format(p, Math.round(p.target * eased));
    if (t < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
}

function showFinal() {
  display.value = String(props.value ?? '');
}

onMounted(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const p = parts();
  if (reduced || !p || typeof IntersectionObserver === 'undefined') {
    showFinal();
    return;
  }
  display.value = format(p, 0);
  observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || started) return;
    started = true;
    observer.disconnect();
    run();
  }, { threshold: 0.6 });
  observer.observe(el.value);
});

// Live content can replace the bundled snapshot after mount
watch(() => props.value, () => {
  if (started) showFinal();
  else {
    const p = parts();
    display.value = p ? format(p, 0) : String(props.value ?? '');
  }
});

onUnmounted(() => {
  observer?.disconnect();
  cancelAnimationFrame(frame);
});
</script>
