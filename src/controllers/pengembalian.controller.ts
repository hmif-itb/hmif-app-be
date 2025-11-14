import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import {
  getPeminjamanAktifByWarga,
  getPeminjamanByIdAndWarga,
  submitPengembalianWarga,
} from '~/repositories/pengembalian.repo';
import {
  getPeminjamanAktifRoute,
  submitPengembalianRoute,
} from '~/routes/pengembalian.route';
import { createAuthRouter } from './router-factory';

export const pengembalianWargaRouter = createAuthRouter();

pengembalianWargaRouter.openapi(getPeminjamanAktifRoute, async (c) => {
  try {
    const { fullName } = c.var.user;
    const data = await getPeminjamanAktifByWarga(db, fullName);

    const serialized = data.map((d) => ({
      ...d,
      createdAt: d.createdAt?.toISOString?.() ?? d.createdAt,
      updatedAt: d.updatedAt?.toISOString?.() ?? d.updatedAt,
      startDate: d.startDate?.toISOString?.() ?? d.startDate,
      endDate: d.endDate?.toISOString?.() ?? d.endDate,
    }));

    return c.json(serialized, 200) as unknown as any;
  } catch (error) {
    console.error('Error in /pengembalian/saya:', error);

    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400) as unknown as any;
    }

    return c.json(
      { error: 'Internal Server Error', message: (error as any).message },
      500,
    );
  }
});

pengembalianWargaRouter.openapi(submitPengembalianRoute, async (c) => {
  try {
    const { peminjamanId } = c.req.valid('param');
    const body = c.req.valid('json');
    const { fullName } = c.var.user;

    const existing = await getPeminjamanByIdAndWarga(
      db,
      peminjamanId,
      fullName,
    );

    if (!existing) {
      return c.json(
        { error: 'Peminjaman tidak ditemukan atau bukan milik Anda' },
        404,
      ) as unknown as any;
    }

    if (existing.status !== 'accepted') {
      return c.json(
        {
          error:
            'Hanya peminjaman yang sedang berjalan (accepted) yang bisa dikembalikan',
        },
        400,
      ) as unknown as any;
    }

    const data = await submitPengembalianWarga(db, peminjamanId, body);

    const serialized = {
      ...data,
      createdAt: data.createdAt?.toISOString?.() ?? data.createdAt,
      updatedAt: data.updatedAt?.toISOString?.() ?? data.updatedAt,
      startDate: data.startDate?.toISOString?.() ?? data.startDate,
      endDate: data.endDate?.toISOString?.() ?? data.endDate,
    };

    return c.json(serialized, 200) as unknown as any;
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400) as unknown as any;
    }
    throw error;
  }
});
