import { and, asc, desc, eq, ilike, lte, gte, or } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { peminjaman, properti } from '~/db/schema';
import {
  GetWargaPropertiParamsSchema,
  CreatePengajuanBodySchema,
} from '~/types/pengajuan.types';

export async function getWargaPropertiList(
  db: Database,
  q: z.infer<typeof GetWargaPropertiParamsSchema>,
) {
  const { search, category, condition, sortBy } = q;
  const [sortKey, sortOrder] = sortBy.split('_') as ['name', 'asc' | 'desc'];

  return await db
    .select()
    .from(properti)
    .where(
      and(
        eq(properti.status, 'available'),
        search ? ilike(properti.name, `%${search}%`) : undefined,
        category ? eq(properti.category, category) : undefined,
        condition ? eq(properti.condition, condition) : undefined,
      ),
    )
    .orderBy(
      sortOrder === 'asc' ? asc(properti[sortKey]) : desc(properti[sortKey]),
    );
}

async function checkKonflikPeminjaman(
  db: Database,
  propertyId: string,
  startDate: Date,
  endDate: Date,
) {
  const konflik = await db
    .select({ id: peminjaman.id })
    .from(peminjaman)
    .where(
      and(
        eq(peminjaman.propertyId, propertyId),
        eq(peminjaman.jenisPeminjaman, 'eksklusif'),
        eq(peminjaman.status, 'accepted'),
        or(
          and(
            lte(peminjaman.startDate, startDate),
            gte(peminjaman.endDate, startDate),
          ),
          and(
            lte(peminjaman.startDate, endDate),
            gte(peminjaman.endDate, endDate),
          ),
          and(
            gte(peminjaman.startDate, startDate),
            lte(peminjaman.endDate, endDate),
          ),
        ),
      ),
    )
    .then(first);

  return !!konflik;
}

export async function createPeminjaman(
  db: Database,
  data: z.infer<typeof CreatePengajuanBodySchema>,
  userId: string,
  borrowerName: string,
) {
  const { propertyId, startDate, endDate, jenisPeminjaman } = data;
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (jenisPeminjaman === 'eksklusif') {
    const adaKonflik = await checkKonflikPeminjaman(db, propertyId, start, end);
    if (adaKonflik) {
      throw new Error(
        'Jadwal peminjaman eksklusif bertabrakan dengan yang sudah ada.',
      );
    }
  }

  const dataInsert: typeof peminjaman.$inferInsert = {
    ...data,
    startDate: start,
    endDate: end,
    borrowerId: userId,
    borrowerName,
    alasan: data.alasan ?? null,
    status: 'pending',
  };

  return await db
    .insert(peminjaman)
    .values(dataInsert)
    .returning()
    .then(firstSure);
}
