// Project categories as stored in the DB (projects.category CHECK constraint)
// and their i18n keys. Shared by the project grid, detail page and admin.
export const PROJECT_CATEGORIES = ['Fullstack', 'Frontend', 'Backend', 'Mobile', 'AI oriented'];

const I18N_KEYS = {
  Fullstack: 'fullstack',
  Frontend: 'frontend',
  Backend: 'backend',
  Mobile: 'mobile',
  'AI oriented': 'ai'
};

export function categoryLabel(t, category) {
  const key = I18N_KEYS[category];
  return key ? t(`projects.filters.${key}`) : category;
}
