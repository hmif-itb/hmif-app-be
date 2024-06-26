import { db } from '~/db/drizzle';
import { getCategoryById, getCategoryList } from '~/repositories/category.repo';
import {
  getCategoryByIdRoute,
  getListCategoryRoute,
} from '~/routes/category.route';
import { createAuthRouter } from './router-factory';

export const categoryRouter = createAuthRouter();

categoryRouter.openapi(getListCategoryRoute, async (c) => {
  const categories = await getCategoryList(db);
  return c.json({ categories }, 200);
});

categoryRouter.openapi(getCategoryByIdRoute, async (c) => {
  const { categoryId } = c.req.valid('param');
  const category = await getCategoryById(db, categoryId);
  if (!category) return c.json({ error: 'Category not found' }, 404);
  return c.json(category, 200);
});
