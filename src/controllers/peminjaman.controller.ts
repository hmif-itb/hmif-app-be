import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import {
  getPeminjaman,
  getPeminjamanNearingEnd,
} from '~/repositories/peminjaman.repo';
import {
  getPeminjamanNearingEndRoute,
  getPeminjamanRoute,
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
