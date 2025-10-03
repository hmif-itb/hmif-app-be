import { db } from '~/db/drizzle';
import { getListPrestasi } from '~/repositories/prestasi.repo';
import { getListPrestasiRoute } from '~/routes/prestasi.route';
import { createAuthRouter } from './router-factory';

export const prestasiRouter = createAuthRouter();

prestasiRouter.openapi(getListPrestasiRoute, async (c) => {
  const query = c.req.valid('query');
  const result = await getListPrestasi(db, query);
  return c.json(result, 200);
});
