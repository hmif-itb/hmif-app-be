import { and, count, desc, eq, SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { medias, prestasi, createId } from '~/db/schema';

import { ListPrestasiQuerySchema } from '~/types/prestasi.types';
import { createMediasFromUrl } from './media.repo';

export async function getListPrestasi(
  db: Database,
  q: z.infer<typeof ListPrestasiQuerySchema>,
) {
  const conditions: Array<SQL<unknown>> = [];

  // Filter by category
  if (q.category) {
    const categoryMap = {
      competition: 'kompetisi',
      organization: 'organisasi',
      committee: 'kepanitiaan',
    } as const;

    conditions.push(eq(prestasi.jenisPrestasi, categoryMap[q.category]));
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
      penyelenggara: true,
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

export async function getPrestasiById(db: Database, id: string) {
  const result = await db.query.prestasi.findFirst({
    where: eq(prestasi.id, id),
    with: {
      user: true,
    },
  });

  return result;
}

export async function getAllPrestasiForExport(db: Database) {
  const results = await db.query.prestasi.findMany({
    orderBy: [desc(prestasi.tahun), desc(prestasi.bulan)],
    columns: {
      id: true,
      jenisPrestasi: true,
      penyelenggara: true,
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
          email: true,
          angkatan: true,
          major: true,
          region: true,
          gender: true,
        },
      },
    },
  });

  return results;
}

export async function createPrestasi(
  db: Database,
  data: {
    userId: string;
    jenisPrestasi: 'organisasi' | 'kepanitiaan' | 'kompetisi';
    penyelenggara: string;
    deskripsi?: string;
    bulan: number;
    tahun: number;
    competitionType?: 'CP' | 'CTF' | 'BCC' | 'DS' | 'AI' | 'Hackathon';
  },
  mediaUrls?: string[],
) {
  return await db.transaction(async (tx) => {
    // Create media entries from URLs if provided
    let mediaSertifikatId: string | undefined;
    let mediaFotoAwardingId: string | undefined;
    let mediaFotoPribadiId: string | undefined;

    if (mediaUrls && mediaUrls.length > 0) {
      const newMedias = await createMediasFromUrl(tx, mediaUrls, data.userId);

      // Assign media in order: certificate, awarding, personal
      if (newMedias[0]) mediaSertifikatId = newMedias[0].id;
      if (newMedias[1]) mediaFotoAwardingId = newMedias[1].id;
      if (newMedias[2]) mediaFotoPribadiId = newMedias[2].id;
    }

    const [newPrestasi] = await tx
      .insert(prestasi)
      .values({
        id: createId(),
        userId: data.userId,
        jenisPrestasi: data.jenisPrestasi,
        penyelenggara: data.penyelenggara,
        deskripsi: data.deskripsi ?? 'Tidak ada deskripsi tersedia',
        bulan: data.bulan,
        tahun: data.tahun,
        mediaSertifikat: mediaSertifikatId,
        mediaFotoAwarding: mediaFotoAwardingId,
        mediaFotoPribadi: mediaFotoPribadiId,
        competitionType: data.competitionType,
      })
      .returning();

    return newPrestasi;
  });
}

export async function updatePrestasi(
  db: Database,
  id: string,
  data: {
    jenisPrestasi: 'organisasi' | 'kepanitiaan' | 'kompetisi';
    penyelenggara: string;
    deskripsi?: string;
    bulan: number;
    tahun: number;
    competitionType?: 'CP' | 'CTF' | 'BCC' | 'DS' | 'AI' | 'Hackathon' | null;
  },
  mediaUrls?: string[],
  userId?: string,
) {
  return await db.transaction(async (tx) => {
    // Get existing prestasi
    const existing = await tx.query.prestasi.findFirst({
      where: eq(prestasi.id, id),
    });

    if (!existing) {
      return null;
    }

    // Check old media
    const oldMediaIds: string[] = [];
    if (existing.mediaSertifikat) oldMediaIds.push(existing.mediaSertifikat);
    if (existing.mediaFotoAwarding)
      oldMediaIds.push(existing.mediaFotoAwarding);
    if (existing.mediaFotoPribadi) oldMediaIds.push(existing.mediaFotoPribadi);

    const [updatedPrestasi] = await tx
      .update(prestasi)
      .set({
        jenisPrestasi: data.jenisPrestasi,
        penyelenggara: data.penyelenggara,
        deskripsi: data.deskripsi,
        bulan: data.bulan,
        tahun: data.tahun,
        competitionType: data.competitionType,
      })
      .where(eq(prestasi.id, id))
      .returning();

    // Handle media URLs if provided
    if (mediaUrls !== undefined) {
      if (mediaUrls.length > 0) {
        // Create new media records
        const newMedias = await createMediasFromUrl(
          tx,
          mediaUrls,
          userId ?? existing.userId,
        );

        // Update prestasi with new media IDs
        const [finalPrestasi] = await tx
          .update(prestasi)
          .set({
            mediaSertifikat: newMedias[0]?.id || null,
            mediaFotoAwarding: newMedias[1]?.id || null,
            mediaFotoPribadi: newMedias[2]?.id || null,
          })
          .where(eq(prestasi.id, id))
          .returning();

        // Delete old media
        if (oldMediaIds.length > 0) {
          await tx.delete(medias).where(
            sql`${medias.id} IN (${sql.join(
              oldMediaIds.map((id) => sql`${id}`),
              sql`, `,
            )})`,
          );
        }

        return finalPrestasi;
      } else {
        const [finalPrestasi] = await tx
          .update(prestasi)
          .set({
            mediaSertifikat: null,
            mediaFotoAwarding: null,
            mediaFotoPribadi: null,
          })
          .where(eq(prestasi.id, id))
          .returning();

        // Delete old media records
        if (oldMediaIds.length > 0) {
          await tx.delete(medias).where(
            sql`${medias.id} IN (${sql.join(
              oldMediaIds.map((id) => sql`${id}`),
              sql`, `,
            )})`,
          );
        }

        return finalPrestasi;
      }
    }

    return updatedPrestasi;
  });
}

export async function deletePrestasi(db: Database, id: string) {
  return await db.transaction(async (tx) => {
    // Get the prestasi
    const existing = await tx.query.prestasi.findFirst({
      where: eq(prestasi.id, id),
    });

    if (!existing) {
      return null;
    }

    // Check media
    const mediaIdsToDelete: string[] = [];
    if (existing.mediaSertifikat)
      mediaIdsToDelete.push(existing.mediaSertifikat);
    if (existing.mediaFotoAwarding)
      mediaIdsToDelete.push(existing.mediaFotoAwarding);
    if (existing.mediaFotoPribadi)
      mediaIdsToDelete.push(existing.mediaFotoPribadi);

    // Delete prestasi
    const [deleted] = await tx
      .delete(prestasi)
      .where(eq(prestasi.id, id))
      .returning();

    // Delete associated media
    if (mediaIdsToDelete.length > 0) {
      await tx.delete(medias).where(
        sql`${medias.id} IN (${sql.join(
          mediaIdsToDelete.map((id) => sql`${id}`),
          sql`, `,
        )})`,
      );
    }

    return deleted;
  });
}
