import { and, count, desc, eq, ilike, SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { medias, prestasi, createId, users } from '~/db/schema';

import { ListPrestasiQuerySchema } from '~/types/prestasi.types';
import { createMediasFromUrl } from './media.repo';

export async function getListPrestasi(
  db: Database,
  q: z.infer<typeof ListPrestasiQuerySchema>,
) {
  // If only prestasi related
  const prestasiConditions: Array<SQL<unknown>> = [];

  // If searched by user's name or title
  const joinConditions: Array<SQL<unknown>> = [];

  // Filter by category
  if (q.category) {
    const categoryMap = {
      competition: 'kompetisi',
      organization: 'organisasi',
      committee: 'kepanitiaan',
    } as const;

    prestasiConditions.push(
      eq(prestasi.jenisPrestasi, categoryMap[q.category]),
    );
    joinConditions.push(eq(prestasi.jenisPrestasi, categoryMap[q.category]));
  }

  // Filter by date range
  if (q.start_date) {
    const [year, month] = q.start_date.split('-').map(Number);
    const dateCondition = sql`(${prestasi.tahun} > ${year} OR (${prestasi.tahun} = ${year} AND ${prestasi.bulan} >= ${month}))`;
    prestasiConditions.push(dateCondition);
    joinConditions.push(dateCondition);
  }

  if (q.end_date) {
    const [year, month] = q.end_date.split('-').map(Number);
    const dateCondition = sql`(${prestasi.tahun} < ${year} OR (${prestasi.tahun} = ${year} AND ${prestasi.bulan} <= ${month}))`;
    prestasiConditions.push(dateCondition);
    joinConditions.push(dateCondition);
  }

  // Search by user full name or judul prestasi (penyelenggara)
  if (q.search) {
    joinConditions.push(
      sql`(${ilike(users.fullName, `%${q.search}%`)} OR ${ilike(prestasi.penyelenggara, `%${q.search}%`)})`,
    );
  }

  // Calculate offset
  const offset = (q.page - 1) * q.limit;

  // If search active
  if (q.search) {
    const joinWhere =
      joinConditions.length > 0 ? and(...joinConditions) : undefined;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(prestasi)
      .leftJoin(users, eq(prestasi.userId, users.id))
      .where(joinWhere);

    // Get paginated results
    const results = await db
      .select({
        id: prestasi.id,
        userId: prestasi.userId,
        jenisPrestasi: prestasi.jenisPrestasi,
        penyelenggara: prestasi.penyelenggara,
        deskripsi: prestasi.deskripsi,
        bulan: prestasi.bulan,
        tahun: prestasi.tahun,
        competitionType: prestasi.competitionType,
        createdAt: prestasi.createdAt,
        user: {
          id: users.id,
          nim: users.nim,
          fullName: users.fullName,
          picture: users.picture,
        },
      })
      .from(prestasi)
      .leftJoin(users, eq(prestasi.userId, users.id))
      .where(joinWhere)
      .orderBy(desc(prestasi.tahun), desc(prestasi.bulan))
      .limit(q.limit)
      .offset(offset);

    return {
      prestasi: results,
      total,
    };
  }

  // No search
  const prestasiWhere =
    prestasiConditions.length > 0 ? and(...prestasiConditions) : undefined;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(prestasi)
    .where(prestasiWhere);

  // Get paginated results
  const results = await db.query.prestasi.findMany({
    where: prestasiWhere,
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
      mediaSertifikat: true,
      mediaFotoAwarding: true,
      mediaFotoPribadi: true,
    },
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
    mediaSertifikat: string;
    mediaFotoPribadi: string;
    mediaFotoAwarding?: string;
  },
) {
  return await db.transaction(async (tx) => {
    const mediaUrls = [data.mediaSertifikat, data.mediaFotoPribadi];
    if (data.mediaFotoAwarding) {
      mediaUrls.push(data.mediaFotoAwarding);
    }

    // Create media entries from URLs if provided
    let mediaSertifikatId: string | undefined;
    let mediaFotoPribadiId: string | undefined;
    let mediaFotoAwardingId: string | undefined;

    if (mediaUrls && mediaUrls.length > 0) {
      const newMedias = await createMediasFromUrl(tx, mediaUrls, data.userId);

      // Assign media in order: certificate, awarding, personal
      if (newMedias[0]) mediaSertifikatId = newMedias[0].id;
      if (newMedias[1]) mediaFotoPribadiId = newMedias[1].id;
      if (newMedias.length > 2) {
        if (newMedias[2]) mediaFotoAwardingId = newMedias[2].id;
      }
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
    mediaSertifikat?: string;
    mediaFotoPribadi?: string;
    mediaFotoAwarding?: string;
  },
) {
  return await db.transaction(async (tx) => {
    // Get existing prestasi
    const existing = await tx.query.prestasi.findFirst({
      where: eq(prestasi.id, id),
    });

    if (!existing) {
      return null;
    }

    const mediaUrls = [];
    if (data.mediaSertifikat) {
      mediaUrls.push(data.mediaSertifikat);
    }
    if (data.mediaFotoPribadi) {
      mediaUrls.push(data.mediaFotoPribadi);
    }
    if (data.mediaFotoAwarding) {
      mediaUrls.push(data.mediaFotoAwarding);
    }

    // Create media entries from URLs if provided
    let mediaSertifikatId: string | undefined;
    let mediaFotoPribadiId: string | undefined;
    let mediaFotoAwardingId: string | undefined;

    if (mediaUrls && mediaUrls.length > 0) {
      const newMedias = await createMediasFromUrl(tx, mediaUrls, existing.userId);

      // Assign media in order: certificate, awarding, personal
      if (newMedias[0]) mediaSertifikatId = newMedias[0].id;
      if (newMedias[1]) mediaFotoPribadiId = newMedias[1].id;
      if (newMedias.length > 2) {
        if (newMedias[2]) mediaFotoAwardingId = newMedias[2].id;
      }
    }

    if (!mediaSertifikatId) {
      mediaSertifikatId = existing.mediaSertifikat ?? undefined;
    }
    if (!mediaFotoPribadiId) {
      mediaFotoPribadiId = existing.mediaFotoPribadi ?? undefined;
    }

    const [updatedPrestasi] = await tx
      .update(prestasi)
      .set({
        jenisPrestasi: data.jenisPrestasi,
        penyelenggara: data.penyelenggara,
        deskripsi: data.deskripsi,
        bulan: data.bulan,
        tahun: data.tahun,
        competitionType: data.competitionType,
        mediaSertifikat: mediaSertifikatId,
        mediaFotoAwarding: mediaFotoAwardingId ?? null,
        mediaFotoPribadi: mediaFotoPribadiId,
      })
      .where(eq(prestasi.id, id))
      .returning();


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
