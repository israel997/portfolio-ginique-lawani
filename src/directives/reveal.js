// v-reveal="'left'" / v-reveal="'right'": the element slides in from that
// side when it scrolls into view. Styles live in style.css
// (.reveal, .reveal-left, .reveal-right, .is-revealed).
// An optional delay in ms: v-reveal:150="'right'".
//
// Nothing reveals before the visitor's first scroll. While the page is still
// loading, content and images keep pushing headings around, so a heading
// that ends up just below the fold (e.g. "01 / À propos" on phones) would
// otherwise play its animation unseen during load.

let observer = null;
let armed = false;
const pending = new Set();

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          observer.unobserve(entry.target);
        });
      },
      // Trigger once the element reaches the upper ~2/3 of the screen
      { threshold: 0.2, rootMargin: '0px 0px -32% 0px' }
    );
  }
  return observer;
}

function arm() {
  armed = true;
  pending.forEach((el) => getObserver().observe(el));
  pending.clear();
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', arm, { once: true, passive: true });
}

export default {
  mounted(el, binding) {
    // No observer support: just show the element
    if (typeof IntersectionObserver === 'undefined') return;
    el.classList.add('reveal', binding.value === 'right' ? 'reveal-right' : 'reveal-left');
    if (binding.arg) el.style.transitionDelay = `${Number(binding.arg)}ms`;
    if (armed) getObserver().observe(el);
    else pending.add(el);
  },
  unmounted(el) {
    pending.delete(el);
    observer?.unobserve(el);
  }
};
