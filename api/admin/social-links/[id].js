import { makeItemHandler } from '../../_lib/crud.js';

export default makeItemHandler({
  table: 'social_links',
  columns: ['name', 'url', 'icon_key', 'custom_svg', 'sort_order', 'is_visible'],
  hasUpdatedAt: false
});
