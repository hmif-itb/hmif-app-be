import { and, asc, count, desc, eq, ilike, or, sql } from 'drizzle-orm';
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
  const conditions = [];

  // Filter by category
  if (q.category) {
    conditions.push(eq(properti.category, q.category));
  }

  // Filter by status
  if (q.status) {
    conditions.push(eq(peminjaman.status, q.status));
  }

  // Search by borrowerName or title
  if (q.search) {
    conditions.push(
      or(
        ilike(peminjaman.borrowerName, `%${q.search}%`),
        ilike(peminjaman.title, `%${q.search}%`),
      ),
    );
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
  const requests = await db
    .select()
    .from(peminjaman)
    .leftJoin(properti, eq(peminjaman.propertyId, properti.id))
    .where(whereClause)
    .orderBy(
      sql`CASE ${peminjaman.status}
        WHEN 'pending' THEN 1
        WHEN 'pending_return' THEN 2
        WHEN 'accepted' THEN 3
        WHEN 'completed' THEN 4
        WHEN 'rejected' THEN 5
        ELSE 6
      END`,
      desc(peminjaman.createdAt),
    )
    .limit(q.limit)
    .offset(offset);

  const mapped = requests.map((row) => ({
    ...row.peminjaman,
    borrowerName: row.peminjaman.borrowerName,
    properti: row.properti,
  }));

  return {
    requests: mapped,
    total,
    page: q.page,
    limit: q.limit,
  };
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

export async function getPeminjamanSchedule(db: Database, propertyId: string) {
  const property = await db
    .select()
    .from(properti)
    .where(eq(properti.id, propertyId))
    .limit(1);

  if (!property.length) return undefined;

  const schedules = await db
    .select({
      startDate: peminjaman.startDate,
      endDate: peminjaman.endDate,
      jenisPeminjaman: peminjaman.jenisPeminjaman,
    })
    .from(peminjaman)
    .where(
      and(
        eq(peminjaman.propertyId, propertyId),
        eq(peminjaman.status, 'accepted'),
      ),
    )
    .orderBy(asc(peminjaman.startDate));

  return {
    propertyId,
    schedules,
  };
}

export async function getLaporanList(
  db: Database,
  q: z.infer<typeof GetLaporanParamsSchema>,
) {
  const conditions = [];

  // Filter by category
  if (q.category) {
    conditions.push(eq(properti.category, q.category));
  }

  // Filter by status
  if (q.status) {
    conditions.push(eq(laporan.status, q.status));
  }

  // Search by description
  if (q.search) {
    conditions.push(ilike(laporan.deskripsi, `%${q.search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Calculate offset
  const offset = (q.page - 1) * q.limit;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(laporan)
    .leftJoin(properti, eq(laporan.propertiId, properti.id))
    .leftJoin(users, eq(laporan.pelaporId, users.id))
    .where(whereClause);

  // Get paginated results
  const reports = await db
    .select()
    .from(laporan)
    .leftJoin(properti, eq(laporan.propertiId, properti.id))
    .leftJoin(users, eq(laporan.pelaporId, users.id))
    .where(whereClause)
    .orderBy(desc(laporan.createdAt))
    .limit(q.limit)
    .offset(offset);

  const mapped = reports.map((row) => ({
    ...row.laporan,
    properti: row.properti,
    pelapor: {
      id: row.users?.id,
      fullName: row.users?.fullName,
      nim: row.users?.nim,
    },
  }));

  return {
    laporan: mapped,
    total,
    page: q.page,
    limit: q.limit,
  };
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
