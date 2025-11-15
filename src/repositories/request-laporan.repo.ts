import { and, asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { laporan, peminjaman, properti, users } from '~/db/schema';
import {
  GetLaporanParamsSchema,
  GetRequestParamsSchema,
  UpdateLaporanStatusSchema,
  UpdatePeminjamanStatusSchema,
} from '~/types/request-laporan.types';

export async function getPeminjamanRequests(
  db: Database,
  q: z.infer<typeof GetRequestParamsSchema>,
) {
  const requests = await db
    .select()
    .from(peminjaman)
    .leftJoin(properti, eq(peminjaman.propertyId, properti.id))
    .where(and(q.category ? eq(properti.category, q.category) : undefined))
    .orderBy(asc(peminjaman.startDate));

  return requests.map((row) => ({
    ...row.peminjaman,
    borrowerName: row.peminjaman.borrowerName,
    properti: row.properti,
  }));
}

export async function updatePeminjamanStatus(
  db: Database,
  id: string,
  data: z.infer<typeof UpdatePeminjamanStatusSchema>,
) {
  return await db
    .update(peminjaman)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(peminjaman.id, id))
    .returning()
    .then(firstSure);
}

export async function getPeminjamanRequestById(db: Database, id: string) {
  const result = await db
    .select()
    .from(peminjaman)
    .leftJoin(properti, eq(peminjaman.propertyId, properti.id))
    .where(eq(peminjaman.id, id))
    .limit(1);

  if (!result.length) return undefined;
  return { ...result[0].peminjaman, properti: result[0].properti };
}

export async function getLaporanList(
  db: Database,
  q: z.infer<typeof GetLaporanParamsSchema>,
) {
  const reports = await db
    .select()
    .from(laporan)
    .leftJoin(properti, eq(laporan.propertiId, properti.id))
    .leftJoin(users, eq(laporan.pelaporId, users.id))
    .where(and(q.category ? eq(properti.category, q.category) : undefined))
    .orderBy(desc(laporan.createdAt));

  return reports.map((row) => ({
    ...row.laporan,
    properti: row.properti,
    pelapor: {
      id: row.users?.id,
      fullName: row.users?.fullName,
      nim: row.users?.nim,
    },
  }));
}

export async function updateLaporanStatus(
  db: Database,
  id: string,
  data: z.infer<typeof UpdateLaporanStatusSchema>,
) {
  return await db
    .update(laporan)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(laporan.id, id))
    .returning()
    .then(firstSure);
}

export async function getLaporanById(db: Database, id: string) {
  const result = await db
    .select()
    .from(laporan)
    .leftJoin(properti, eq(laporan.propertiId, properti.id))
    .leftJoin(users, eq(laporan.pelaporId, users.id))
    .where(eq(laporan.id, id))
    .limit(1);

  if (!result.length) return undefined;

  return {
    ...result[0].laporan,
    properti: result[0].properti,
    pelapor: {
      id: result[0].users?.id,
      fullName: result[0].users?.fullName,
      nim: result[0].users?.nim,
    },
  };
}
