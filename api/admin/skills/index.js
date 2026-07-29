import { makeListHandler } from '../../_lib/crud.js';

export default makeListHandler({
  table: 'skills',
  columns: ['title_fr', 'title_en', 'description_fr', 'description_en', 'icon_key', 'icon_bg_class', 'techs', 'sort_order', 'is_visible']
});
