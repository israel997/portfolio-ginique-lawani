// Highlight colors for the About key points. Stored by name in
// key_figures.color; the actual shades are CSS variables (--fig-<name>)
// defined per theme in style.css.
export const FIGURE_COLORS = [
  { name: 'purple', label: 'Pourpre' },
  { name: 'magenta', label: 'Magenta' },
  { name: 'orange', label: 'Orange' },
  { name: 'blue', label: 'Bleu' },
  { name: 'green', label: 'Vert' },
  { name: 'teal', label: 'Turquoise' },
  { name: 'yellow', label: 'Jaune' },
  { name: 'red', label: 'Rouge' }
];

// A point without a chosen color takes the next one of purple / magenta / orange
export function figureColor(name, index = 0) {
  const known = FIGURE_COLORS.some((c) => c.name === name);
  const fallback = ['purple', 'magenta', 'orange'][index % 3];
  return `var(--fig-${known ? name : fallback})`;
}
