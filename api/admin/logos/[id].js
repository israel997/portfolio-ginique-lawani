import { makeItemHandler } from '../../_lib/crud.js';

export default makeItemHandler({
  table: 'tech_logos',
  columns: ['name', 'image_url', 'sort_order', 'is_visible'],
  hasUpdatedAt: false
});
