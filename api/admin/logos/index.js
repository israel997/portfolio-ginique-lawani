import { makeListHandler } from '../../_lib/crud.js';

export default makeListHandler({
  table: 'tech_logos',
  columns: ['name', 'image_url', 'sort_order', 'is_visible']
});
