import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { peminjaman, laporan } from '~/db/schema';
import { SubmitPengembalianBodySchema } from '~/types/pengembalian.types';

export async function getPeminjamanAktifByWarga(db: Database, borrowerName: string) {
  return await db.query.peminjaman.findMany({
    where: and(
      eq(peminjaman.borrowerName, borrowerName),
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
  borrowerName: string,
) {
  return await db.query.peminjaman.findFirst({
    where: and(
      eq(peminjaman.id, id),
      eq(peminjaman.borrowerName, borrowerName),
    ),
    with: {
      properti: true,
    },
  });
}

export async function submitPengembalianWarga(
  db: Database,
  peminjamanId: string,
  data: z.infer<typeof SubmitPengembalianBodySchema>,
  pelaporId: string,
  borrowerName: string,
) {
  return await db.transaction(async (tx) => {
    const peminjamanData = await tx.query.peminjaman.findFirst({
      where: eq(peminjaman.id, peminjamanId),
      columns: {
        propertyId: true,
        title: true,
      },
    });

    if (!peminjamanData) {
      throw new Error('Peminjaman tidak ditemukan saat transaksi.');
    }

    const updatedPeminjaman = await tx
      .update(peminjaman)
      .set({
        status: 'pending_return',
        buktiFotoUrl: data.buktiFotoUrl,
        updatedAt: new Date(),
      })
      .where(eq(peminjaman.id, peminjamanId))
      .returning()
      .then(firstSure);

    await tx.insert(laporan).values({
      propertiId: peminjamanData.propertyId,
      pelaporId: pelaporId,
      deskripsi: `Laporan pengembalian untuk: "${peminjamanData.title}" oleh ${borrowerName}.`,
      fotoUrl: data.buktiFotoUrl,
      status: 'pending',
    });

    return updatedPeminjaman;
  });
}