import {
  and,
  asc,
  gte,
  lte,
  eq,
  or,
  ilike,
  count,
  desc,
  sql,
} from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { peminjaman, properti } from '~/db/schema';
import {
  GetPeminjamanParamsSchema,
  GetUserPeminjamanParamsSchema,
} from '~/types/peminjaman.types';

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
        eq(peminjaman.status, 'accepted'),
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

export async function getUserPeminjaman(
  db: Database,
  q: z.infer<typeof GetUserPeminjamanParamsSchema>,
  userId: string,
) {
  const conditions = [eq(peminjaman.borrowerId, userId)];

  // Filter by category
  if (q.category) {
    conditions.push(eq(properti.category, q.category));
  }

  // Filter by status
  if (q.status) {
    conditions.push(eq(peminjaman.status, q.status));
  }

  // Search by property name or title
  if (q.search) {
    const searchCondition = or(
      ilike(properti.name, `%${q.search}%`),
      ilike(peminjaman.title, `%${q.search}%`),
    );
    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Calculate offset
  const offset = (q.page - 1) * q.limit;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(peminjaman)
    .leftJoin(properti, eq(peminjaman.propertyId, properti.id))
    .where(whereClause);

  // Get paginated results
  const results = await db
    .select({
      id: peminjaman.id,
      title: peminjaman.title,
      borrowerName: peminjaman.borrowerName,
      propertyName: properti.name,
      category: properti.category,
      startDate: peminjaman.startDate,
      endDate: peminjaman.endDate,
      status: peminjaman.status,
      alasan: peminjaman.alasan,
      jenisPeminjaman: peminjaman.jenisPeminjaman,
      buktiFotoUrl: peminjaman.buktiFotoUrl,
      createdAt: peminjaman.createdAt,
    })
    .from(peminjaman)
    .leftJoin(properti, eq(peminjaman.propertyId, properti.id))
    .where(whereClause)
    .orderBy(desc(peminjaman.createdAt))
    .limit(q.limit)
    .offset(offset);

  return {
    peminjaman: results,
    total,
    page: q.page,
    limit: q.limit,
  };
}
