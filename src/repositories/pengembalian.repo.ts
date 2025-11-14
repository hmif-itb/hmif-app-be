import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { peminjaman, properti } from '~/db/schema';
import { SubmitPengembalianBodySchema } from '~/types/pengembalian.types';

export async function getPeminjamanAktifByWarga(
  db: Database,
  borrowerName: string,
) {
  const peminjamanList = await db
    .select({
      id: peminjaman.id,
      borrowerName: peminjaman.borrowerName,
      propertiId: peminjaman.propertyId,
      startDate: peminjaman.startDate,
      endDate: peminjaman.endDate,
      status: peminjaman.status,
      createdAt: peminjaman.createdAt,
      updatedAt: peminjaman.updatedAt,
    })
    .from(peminjaman)
    .where(
      and(
        eq(peminjaman.borrowerName, borrowerName),
        eq(peminjaman.status, 'accepted'),
      ),
    )
    .orderBy(asc(peminjaman.startDate));

  const propertiList = await db
    .select({
      id: properti.id,
      name: properti.name,
      category: properti.category,
      quantity: properti.quantity,
    })
    .from(properti);

  return peminjamanList.map((p) => ({
    ...p,
    properti: propertiList.find((prop) => prop.id === p.propertiId) ?? null,
  }));
}

export async function getPeminjamanByIdAndWarga(
  db: Database,
  id: string,
  borrowerName: string,
) {
  return await db.query.peminjaman.findFirst({
    where: and(
      eq(peminjaman.id, id),
      eq(peminjaman.borrowerName, borrowerName),
    ),
  });
}

export async function submitPengembalianWarga(
  db: Database,
  id: string,
  data: z.infer<typeof SubmitPengembalianBodySchema>,
) {
  return await db
    .update(peminjaman)
    .set({
      status: 'pending_return',
      buktiFotoUrl: data.buktiFotoUrl,
      updatedAt: new Date(),
    })
    .where(eq(peminjaman.id, id))
    .returning()
    .then(firstSure);
}
