import { and, asc, gte, lte, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { peminjaman, properti } from '~/db/schema';
import { GetPeminjamanParamsSchema } from '~/types/peminjaman.types';

export async function getPeminjaman(
  db: Database,
  q: z.infer<typeof GetPeminjamanParamsSchema>,
) {
  const { startDate, endDate } = q;
  const loans = await db
    .select({
      id: peminjaman.id,
      title: peminjaman.title,
      borrowerName: peminjaman.borrowerName,
      propertyName: properti.name,
      category: properti.category,
      startDate: peminjaman.startDate,
      endDate: peminjaman.endDate,
      status: peminjaman.status,
    })
    .from(peminjaman)
    .innerJoin(properti, eq(peminjaman.propertyId, properti.id))
    .where(
      and(
        lte(peminjaman.startDate, endDate),
        gte(peminjaman.endDate, startDate),
      ),
    )
    .orderBy(asc(peminjaman.startDate));

  return loans;
}

export async function getPeminjamanNearingEnd(db: Database, days: number) {
  const today = new Date();
  const targetDate = new Date();
  targetDate.setDate(today.getDate() + days);

  const nearingEndLoans = await db
    .select({
      id: peminjaman.id,
      title: peminjaman.title,
      borrowerName: peminjaman.borrowerName,
      propertyName: properti.name,
      category: properti.category,
      startDate: peminjaman.startDate,
      endDate: peminjaman.endDate,
      status: peminjaman.status,
    })
    .from(peminjaman)
    .innerJoin(properti, eq(peminjaman.propertyId, properti.id))
    .where(
      and(
        gte(peminjaman.endDate, today),
        lte(peminjaman.endDate, targetDate),
        eq(peminjaman.status, 'accepted'),
      ),
    )
    .orderBy(asc(peminjaman.endDate));

  return nearingEndLoans;
}
