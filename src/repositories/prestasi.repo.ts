import { and, count, desc, eq, gte, lte, SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { prestasi, users } from '~/db/schema';
import { ListPrestasiQuerySchema } from '~/types/prestasi.types';

export async function getListPrestasi(
  db: Database,
  q: z.infer<typeof ListPrestasiQuerySchema>,
) {
  const conditions: SQL<unknown>[] = [];

  // Filter by category
  if (q.category) {
    const categoryMap = {
      competition: 'kompetisi',
      organization: 'organisasi',
      committee: 'kepanitiaan',
    } as const;

    conditions.push(
      eq(prestasi.jenisPrestasi, categoryMap[q.category]),
    );
  }

  // Filter by date range
  if (q.start_date) {
    const [year, month] = q.start_date.split('-').map(Number);
    conditions.push(
      sql`(${prestasi.tahun} > ${year} OR (${prestasi.tahun} = ${year} AND ${prestasi.bulan} >= ${month}))`,
    );
  }

  if (q.end_date) {
    const [year, month] = q.end_date.split('-').map(Number);
    conditions.push(
      sql`(${prestasi.tahun} < ${year} OR (${prestasi.tahun} = ${year} AND ${prestasi.bulan} <= ${month}))`,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Calculate offset
  const offset = (q.page - 1) * q.limit;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(prestasi)
    .where(where);

  // Get paginated results
  const results = await db.query.prestasi.findMany({
    where,
    limit: q.limit,
    offset,
    orderBy: [desc(prestasi.tahun), desc(prestasi.bulan)],
    columns: {
      id: true,
      userId: true,
      jenisPrestasi: true,
      namaPrestasi: true,
      deskripsi: true,
      bulan: true,
      tahun: true,
      competitionType: true,
      createdAt: true,
    },
    with: {
      user: {
        columns: {
          id: true,
          nim: true,
          fullName: true,
          picture: true,
        },
      },
    },
  });

  return {
    prestasi: results,
    total,
  };
}
