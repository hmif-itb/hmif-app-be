import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import { createLaporan } from '~/repositories/laporan-warga.repo';
import { createLaporanRoute } from '~/routes/laporan-warga.route';
import { createAuthRouter } from './router-factory';

export const laporanWargaRouter = createAuthRouter();

laporanWargaRouter.openapi(createLaporanRoute, async (c) => {
  try {
    const body = c.req.valid('json');
    const { id: pelaporId } = c.var.user;

    const data = await createLaporan(db, body, pelaporId);

    if (!data) {
      return c.json({ error: 'Failed to create laporan' }, 400);
    }

    const serialized = {
      ...data,
      createdAt: data.createdAt?.toISOString?.() ?? data.createdAt,
      updatedAt: data.updatedAt?.toISOString?.() ?? data.updatedAt,
    };

    return c.json(serialized, 201) as unknown as any;
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400) as unknown as any;
    }
    throw error;
  }
});
