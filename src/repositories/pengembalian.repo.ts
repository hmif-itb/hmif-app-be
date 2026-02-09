import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { peminjaman, laporan } from '~/db/schema';
import { SubmitPengembalianBodySchema } from '~/types/pengembalian.types';

export async function getPeminjamanAktifByWarga(db: Database, userId: string) {
  return await db.query.peminjaman.findMany({
    where: and(
      eq(peminjaman.borrowerId, userId),
      eq(peminjaman.status, 'accepted'),
    ),
    with: {
      properti: true,
    },
    orderBy: [asc(peminjaman.startDate)],
  });
}

export async function getPeminjamanByIdAndWarga(
  db: Database,
  id: string,
  userId: string,
) {
  return await db.query.peminjaman.findFirst({
    where: and(eq(peminjaman.id, id), eq(peminjaman.borrowerId, userId)),
    with: {
      properti: true,
    },
  });
}

export async function submitPengembalianWarga(
  db: Database,
  peminjamanId: string,
  data: z.infer<typeof SubmitPengembalianBodySchema>,
) {
  const updatedPeminjaman = await db
    .update(peminjaman)
    .set({
      status: 'pending_return',
      buktiFotoUrl: data.buktiFotoUrl,
      updatedAt: new Date(),
    })
    .where(eq(peminjaman.id, peminjamanId))
    .returning()
    .then(firstSure);
  return updatedPeminjaman;
}
