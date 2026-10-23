import { useI18n } from 'vue-i18n';
import { useContent } from './useContent';

// Section names shown in the menus and section headings, renamable in
// Admin > Sections. Stored in admin_settings.sections as
// { <id>: { nav_fr, nav_en, title_fr, title_en, subtitle_fr, subtitle_en } };
// anything left empty falls back to the default text of that language.
export const SECTIONS = [
  { id: 'about', label: 'À propos', fields: ['nav', 'title', 'subtitle'] },
  { id: 'projects', label: 'Projets', fields: ['nav', 'title'] },
  { id: 'skills', label: 'Compétences', fields: ['nav', 'title'] },
  { id: 'showcase', label: 'Savoir-faire', fields: ['nav', 'title'] },
  { id: 'timeline', label: 'Parcours', fields: ['nav', 'title'] },
  { id: 'testimonials', label: 'Références', fields: ['nav', 'title'] },
  { id: 'contact', label: 'Contact', fields: ['nav', 'title', 'subtitle'] }
];

// i18n key of the default text for a section field
export function defaultKey(id, field) {
  return field === 'nav' ? `nav.${id}` : `${id}.${field}`;
}

export function useSectionText() {
  const { t, locale } = useI18n();
  const { content } = useContent();

  function sectionText(id, field) {
    const custom = content.value.settings?.sections?.[id]?.[`${field}_${locale.value === 'en' ? 'en' : 'fr'}`];
    return custom?.trim() || t(defaultKey(id, field));
  }

  return { sectionText };
}
