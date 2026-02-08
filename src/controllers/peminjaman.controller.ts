import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import {
  getPeminjaman,
  getPeminjamanNearingEnd,
  getUserPeminjaman,
} from '~/repositories/peminjaman.repo';
import {
  getPeminjamanNearingEndRoute,
  getPeminjamanRoute,
  getUserPeminjamanRoute,
} from '~/routes/peminjaman.route';
import { createAuthRouter } from './router-factory';
import { Peminjaman } from '~/types/peminjaman.types';

export const peminjamanRouter = createAuthRouter();

peminjamanRouter.openapi(getPeminjamanRoute, async (c) => {
  const { startDate, endDate } = c.req.valid('query');

  try {
    const data: Peminjaman[] = await getPeminjaman(db, {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return c.json(data, 200);
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

peminjamanRouter.openapi(getPeminjamanNearingEndRoute, async (c) => {
  const { days } = c.req.valid('query');

  try {
    const data: Peminjaman[] = await getPeminjamanNearingEnd(
      db,
      parseInt(days, 10),
    );
    return c.json(data, 200);
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

peminjamanRouter.openapi(getUserPeminjamanRoute, async (c) => {
  try {
    const queryParams = c.req.valid('query');
    const { id: userId } = c.var.user;

    const result = await getUserPeminjaman(db, queryParams, userId);

    const serialized = {
      peminjaman: result.peminjaman.map((p) => ({
        ...p,
        createdAt: p.createdAt?.toISOString?.() ?? p.createdAt,
        startDate: p.startDate?.toISOString?.() ?? p.startDate,
        endDate: p.endDate?.toISOString?.() ?? p.endDate,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };

    return c.json(serialized, 200) as unknown as any;
  } catch (error) {
    return c.json(
      { error: 'Terjadi kesalahan tidak dikenal' },
      500,
    ) as unknown as any;
  }
});
