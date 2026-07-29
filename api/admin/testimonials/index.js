import { makeListHandler } from '../../_lib/crud.js';

export default makeListHandler({
  table: 'testimonials',
  columns: ['name', 'role_fr', 'role_en', 'initials', 'avatar_gradient_class', 'quote_fr', 'quote_en', 'sort_order', 'is_visible']
});
