import { db } from '~/db/drizzle';
import {
  getCategoryList,
  getInfoCategoryList,
  getListAngkatan,
} from '~/repositories/category.repo';
import { getUserRoles } from '~/repositories/user-role.repo';
import {
  getInfoListCategoryRoute,
  getListAngkatanRoute,
  getListCategoryRoute,
} from '~/routes/category.route';
import { createAuthRouter } from './router-factory';

export const categoryRouter = createAuthRouter();

categoryRouter.openapi(getListCategoryRoute, async (c) => {
  const categories = await getCategoryList(db);
  return c.json({ categories }, 200);
});

categoryRouter.openapi(getListAngkatanRoute, async (c) => {
  const angkatan = await getListAngkatan(db);
  return c.json(angkatan, 200);
});

categoryRouter.openapi(getInfoListCategoryRoute, async (c) => {
  const userRoles = await getUserRoles(db, c.var.user.id);
  const categories = await getInfoCategoryList(db, userRoles);
  return c.json({ categories }, 200);
});
