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

// Categories of a project: the `categories` list, or the older single
// `category` for data that predates it
export function projectCategories(project) {
  if (Array.isArray(project?.categories) && project.categories.length) return project.categories;
  return project?.category ? [project.category] : [];
}

export function categoryLabel(t, category) {
  const key = I18N_KEYS[category];
  return key ? t(`projects.filters.${key}`) : category;
}
