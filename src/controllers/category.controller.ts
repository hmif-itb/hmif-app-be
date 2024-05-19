import {
  getCategoryByIdRoute,
  getListCategoryRoute,
} from '~/routes/category.route';
import { createAuthRouter } from './router-factory';
import { db } from '~/db/drizzle';
import { getCategoryById, getCategoryList } from '~/repositories/category.repo';

export const categorySchema = createAuthRouter();

categorySchema.openapi(getListCategoryRoute, async (c) => {
  const categories = await getCategoryList(db);
  return c.json({ categories }, 200);
});

categorySchema.openapi(getCategoryByIdRoute, async (c) => {
  const param = c.req.valid('param');
  const categoryId = param.id;
  const category = await getCategoryById(db, categoryId);
  if (!category) {
    return c.json({ error: 'Category not found' }, 404);
  }
  return c.json(category, 200);
});
