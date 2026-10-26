// "Découvrir" page content: visible sections that have at least one card
// with text. Sections still empty aren't shown (nor are the links to the
// page while every section is empty).
const filled = (card) => [card.title_fr, card.text_fr, card.title_en, card.text_en].some((v) => v?.trim());

export function discoverSections(content) {
  return (content?.discover || [])
    .map((section) => ({ ...section, cards: (section.cards || []).filter(filled) }))
    .filter((section) => section.cards.length);
}
