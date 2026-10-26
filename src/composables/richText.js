// Long project texts (Présentation, Ce que j'ai fait, Méthodologie) can be a
// paragraph or a list. A list is stored one item per line in the same text
// column; the display style lives in <field>_style.
export const TEXT_STYLES = [
  { value: 'text', label: 'Paragraphe' },
  { value: 'numbered', label: 'Liste numérotée' },
  { value: 'bullets', label: 'Liste à tirets' }
];

// Numbering or bullets typed by hand at the start of a line: "1- ", "02 ",
// "3. ", "4) ", "- ", "• ". A plain number that starts a sentence ("8 ans
// d'expérience") is kept: only zero-padded numbers or numbers followed by
// punctuation count as numbering.
const HAND_PREFIX = /^\s*(?:\d{1,2}\s*[-.):]\s*|0\d\s+|[-–—•*·]\s+)/;

export function stripPrefix(line) {
  return line.replace(HAND_PREFIX, '').trim();
}

export function toItems(text) {
  return (text || '').split('\n').map(stripPrefix).filter(Boolean);
}

export function fromItems(items) {
  return items.map((i) => i.trim()).filter(Boolean).join('\n');
}

// Passages to underline in yellow are written between double equals signs:
// "prendre un ==besoin flou==". The markers survive the automatic English
// translation. Returns [{ text, mark }] to render without v-html.
export function highlightParts(text) {
  return (text || '').split(/==([^=\n]+)==/).map((part, i) => ({ text: part, mark: i % 2 === 1 })).filter((p) => p.text);
}
