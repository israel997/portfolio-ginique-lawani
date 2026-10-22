import { ref, onMounted, onUnmounted } from 'vue';

// Tracks which page section is currently in view, for nav highlighting.
// One shared IntersectionObserver instead of a scroll listener per nav bar.
const SECTION_IDS = ['hero', 'about', 'projects', 'skills', 'showcase', 'timeline', 'testimonials', 'contact'];

const activeSection = ref('hero');
let observer = null;
let subscribers = 0;
const observed = new Set();

// Observe any tracked section now in the DOM. Safe to call repeatedly:
// sections that render late (after the API responds) get picked up.
function refresh() {
  if (!observer) return;
  SECTION_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el && !observed.has(el)) {
      observer.observe(el);
      observed.add(el);
    }
  });
}

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
  refresh();
}

export function useActiveSection() {
  onMounted(() => {
    if (subscribers++ === 0) start();
  });
  onUnmounted(() => {
    if (--subscribers === 0) {
      observer?.disconnect();
      observer = null;
      observed.clear();
    }
  });
  return { activeSection, refresh };
}
