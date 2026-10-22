// v-reveal="'left'" / v-reveal="'right'": the element slides in from that
// side the first time it scrolls into view. Styles live in style.css
// (.reveal, .reveal-left, .reveal-right, .is-revealed).
// An optional delay in ms: v-reveal:150="'right'".

let observer = null;

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
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );
  }
  return observer;
}

export default {
  mounted(el, binding) {
    // No observer support: just show the element
    if (typeof IntersectionObserver === 'undefined') return;
    el.classList.add('reveal', binding.value === 'right' ? 'reveal-right' : 'reveal-left');
    if (binding.arg) el.style.transitionDelay = `${Number(binding.arg)}ms`;
    getObserver().observe(el);
  },
  unmounted(el) {
    observer?.unobserve(el);
  }
};
