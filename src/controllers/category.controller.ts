import {
  getCategoryByIdRoute,
  getListCategoryRoute,
} from '~/routes/category.route';
import { createAuthRouter } from './router-factory';
import { db } from '~/db/drizzle';
import { getCategoryById, getCategoryList } from '~/repositories/category.repo';

export const categoryRouter = createAuthRouter();

categoryRouter.openapi(getListCategoryRoute, async (c) => {
  const categories = await getCategoryList(db);
  return c.json({ categories }, 200);
});

categoryRouter.openapi(getCategoryByIdRoute, async (c) => {
  try {
    const { id } = c.req.valid('param');
    const category = await getCategoryById(db, id);
    if (!category) return c.json({ error: 'Category not found' }, 404);
    return c.json(category, 200);
  } catch (err) {
    return c.json(
      {
        error: 'Something went wrong',
      },
      400,
    );
  }
});
