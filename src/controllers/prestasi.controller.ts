import { db } from '~/db/drizzle';
import { getListPrestasi, getPrestasiById } from '~/repositories/prestasi.repo';
import {
  getListPrestasiRoute,
  getPrestasiByIdRoute,
} from '~/routes/prestasi.route';
import { createAuthRouter } from './router-factory';

export const prestasiRouter = createAuthRouter();

prestasiRouter.openapi(getListPrestasiRoute, async (c) => {
  const query = c.req.valid('query');
  const result = await getListPrestasi(db, query);
  return c.json(result, 200);
});

prestasiRouter.openapi(getPrestasiByIdRoute, async (c) => {
  const { idPrestasi } = c.req.valid('param');
  const result = await getPrestasiById(db, idPrestasi);

  if (!result) {
    return c.json({ error: 'Achievement not found' }, 404);
  }

  return c.json(result, 200);
});
