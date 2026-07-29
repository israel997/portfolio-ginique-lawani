import { makeListHandler } from '../../_lib/crud.js';

export default makeListHandler({
  table: 'social_links',
  columns: ['name', 'url', 'icon_key', 'custom_svg', 'sort_order', 'is_visible']
});
