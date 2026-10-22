import { ref, onMounted, onUnmounted } from 'vue';

// Tracks which page section is currently in view, for nav highlighting.
// One shared IntersectionObserver instead of a scroll listener per nav bar.
const SECTION_IDS = ['hero', 'about', 'skills', 'timeline', 'projects', 'testimonials', 'contact'];

const activeSection = ref('hero');
let observer = null;
let subscribers = 0;

function start() {
  const visible = new Map();
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
      const current = SECTION_IDS.find((id) => visible.get(id));
      if (current) activeSection.value = current;
    },
    // A section counts as active once it crosses the upper third of the viewport
    { rootMargin: '-35% 0px -60% 0px' }
  );
  SECTION_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}

export function useActiveSection() {
  onMounted(() => {
    if (subscribers++ === 0) start();
  });
  onUnmounted(() => {
    if (--subscribers === 0) {
      observer?.disconnect();
      observer = null;
    }
  });
  return { activeSection };
}
