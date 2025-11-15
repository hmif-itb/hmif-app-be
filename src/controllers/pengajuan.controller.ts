import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import {
  createPeminjaman,
  getWargaPropertiList,
} from '~/repositories/pengajuan.repo';
import {
  createPengajuanRoute,
  getWargaPropertiListRoute,
} from '~/routes/pengajuan.route';
import { createAuthRouter } from './router-factory';

export const pengajuanWargaRouter = createAuthRouter();

pengajuanWargaRouter.openapi(getWargaPropertiListRoute, async (c) => {
  try {
    const data = await getWargaPropertiList(db, c.req.valid('query'));

    const serialized = data.map((d) => ({
      ...d,
      createdAt: d.createdAt?.toISOString?.() ?? d.createdAt,
      updatedAt: d.updatedAt?.toISOString?.() ?? d.updatedAt,
    }));

    return c.json(serialized, 200) as unknown as any;
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400) as unknown as any;
    }
    throw error;
  }
});

pengajuanWargaRouter.openapi(createPengajuanRoute, async (c) => {
  try {
    const body = c.req.valid('json');
    const { fullName } = c.var.user;

    const data = await createPeminjaman(db, body, fullName);

    const serialized = {
      ...data,
      createdAt: data.createdAt?.toISOString?.() ?? data.createdAt,
      updatedAt: data.updatedAt?.toISOString?.() ?? data.updatedAt,
      startDate: data.startDate?.toISOString?.() ?? data.startDate,
      endDate: data.endDate?.toISOString?.() ?? data.endDate,
    };

    return c.json(serialized, 201) as unknown as any;
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400) as unknown as any;
    }
    if (error instanceof Error && error.message.includes('bertabrakan')) {
      return c.json({ error: error.message }, 409) as unknown as any;
    }
    throw error;
  }
});
