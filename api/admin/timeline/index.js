import { makeListHandler } from '../../_lib/crud.js';

export default makeListHandler({
  table: 'timeline_items',
  columns: ['year_label', 'title_fr', 'title_en', 'company_fr', 'company_en', 'description_fr', 'description_en', 'sort_order', 'is_visible']
});
