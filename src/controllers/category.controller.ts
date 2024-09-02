import { db } from '~/db/drizzle';
import {
  getCategoryById,
  getCategoryList,
  getListAngkatan,
} from '~/repositories/category.repo';
import {
  getCategoryByIdRoute,
  getListAngkatanRoute,
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

categoryRouter.openapi(getListAngkatanRoute, async (c) => {
  const angkatan = await getListAngkatan(db);
  return c.json(angkatan, 200);
});
