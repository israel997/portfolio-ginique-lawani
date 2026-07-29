import { makeListHandler } from '../../_lib/crud.js';

export default makeListHandler({
  table: 'projects',
  columns: ['name', 'description_fr', 'description_en', 'tags', 'gradient_class', 'category', 'image_url', 'project_url', 'sort_order', 'is_visible']
});
