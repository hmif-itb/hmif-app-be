import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { laporan } from '~/db/schema';
import { CreateLaporanBodySchema } from '~/types/laporan-warga.types';

export async function createLaporan(
  db: Database,
  data: z.infer<typeof CreateLaporanBodySchema>,
  pelaporId: string,
) {
  const dataInsert: typeof laporan.$inferInsert = {
    ...data,
    pelaporId,
    status: 'pending',
    fotoUrl: data.fotoUrl ?? null,
  };

  const newLaporan = await db
    .insert(laporan)
    .values(dataInsert)
    .returning()
    .then(firstSure);

  return await db.query.laporan.findFirst({
    where: (l, { eq }) => eq(l.id, newLaporan.id),
    with: {
      properti: true,
      pelapor: {
        columns: {
          id: true,
          fullName: true,
          nim: true,
        },
      },
    },
  });
}
