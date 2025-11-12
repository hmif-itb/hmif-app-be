import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import { users, prestasi } from '~/db/schema';
import { eq, and, SQL, sql, desc } from 'drizzle-orm';
import {
  createPrestasi,
  getListPrestasi,
  getPrestasiById,
  updatePrestasi,
  deletePrestasi,
} from '~/repositories/prestasi.repo';
import {
  createPrestasiRoute,
  getListPrestasiRoute,
  getPrestasiByIdRoute,
  exportPrestasiRoute,
  updatePrestasiRoute,
  deletePrestasiRoute,
} from '~/routes/prestasi.route';
import { createAuthRouter } from './router-factory';
import ExcelJS from 'exceljs';
import { roleMiddleware } from '~/middlewares/role.middleware';

export const prestasiRouter = createAuthRouter();

prestasiRouter.openapi(getListPrestasiRoute, async (c) => {
  const query = c.req.valid('query');
  const result = await getListPrestasi(db, query);
  return c.json(result, 200);
});

prestasiRouter.openapi(getPrestasiByIdRoute, async (c) => {
  const { idPrestasi } = c.req.valid('param');
  const prestasi = await getPrestasiById(db, idPrestasi);
  if (!prestasi) {
    return c.json({ error: 'Achievement not found' }, 404);
  }

  const result = {
    id: prestasi.id,
    userId: prestasi.userId,
    jenisPrestasi: prestasi.jenisPrestasi,
    penyelenggara: prestasi.penyelenggara,
    deskripsi: prestasi.deskripsi,
    bulan: prestasi.bulan,
    tahun: prestasi.tahun,
    competitionType: prestasi.competitionType,
    createdAt: prestasi.createdAt,
    user: prestasi.user,
    mediaSertifikat: prestasi.mediaSertifikat?.url ?? '',
    mediaFotoPribadi: prestasi.mediaFotoPribadi?.url ?? '',
    mediaFotoAwarding: prestasi.mediaFotoAwarding?.url ?? '',
  };

  return c.json(result, 200);
});

prestasiRouter.openapi(createPrestasiRoute, async (c) => {
  try {
    const body = c.req.valid('json');
    const user = c.var.user;

    // Validate required media URLs
    if (!body.mediaSertifikat || !body.mediaFotoPribadi) {
      return c.json(
        {
          error:
            'Certificate (mediaSertifikat) and personal photo (mediaFotoPribadi) are required',
        },
        400,
      );
    }

    // Determine user ID
    const targetUserId = body.userId ?? user.id;

    // Verify user exists
    const [targetUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, targetUserId));

    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Create prestasi
    const newPrestasi = await createPrestasi(
      db,
      {
        userId: targetUserId,
        jenisPrestasi: body.jenisPrestasi,
        penyelenggara: body.penyelenggara,
        deskripsi: body.deskripsi ?? undefined,
        bulan: body.bulan,
        tahun: body.tahun,
        competitionType: body.competitionType ?? undefined,
        mediaSertifikat: body.mediaSertifikat,
        mediaFotoPribadi: body.mediaFotoPribadi,
        mediaFotoAwarding: body.mediaFotoAwarding ?? undefined,
      },
    );

    // Return response without media fields to match schema
    const response = {
      id: newPrestasi.id,
      userId: newPrestasi.userId,
      jenisPrestasi: newPrestasi.jenisPrestasi,
      penyelenggara: newPrestasi.penyelenggara,
      deskripsi: newPrestasi.deskripsi,
      bulan: newPrestasi.bulan,
      tahun: newPrestasi.tahun,
      competitionType: newPrestasi.competitionType,
      createdAt: newPrestasi.createdAt,
    };

    return c.json(response, 201);
  } catch (error) {
    console.error('Error creating prestasi:', error);

    if (error instanceof PostgresError) {
      if (error.code === '23503') {
        return c.json({ error: 'Foreign key constraint violation' }, 400);
      }
      if (error.code === '23505') {
        return c.json({ error: 'Duplicate entry' }, 400);
      }
    }

    return c.json({ error: 'Internal server error' }, 500);
  }
});

prestasiRouter.put(
  updatePrestasiRoute.getRoutingPath(),
  roleMiddleware(['people', 'peopledev', 'peoplemanage']),
);
prestasiRouter.openapi(updatePrestasiRoute, async (c) => {
  try {
    const { idPrestasi } = c.req.valid('param');
    const body = c.req.valid('json');

    // Get the existing prestasi to use its original userId for media creation
    const existing = await getPrestasiById(db, idPrestasi);

    if (!existing) {
      return c.json({ error: 'Achievement not found' }, 404);
    }

    // Update prestasi - use existing prestasi's userId for media creation
    // Merge with existing data for any undefined fields
    const updatedPrestasi = await updatePrestasi(
      db,
      idPrestasi,
      {
        jenisPrestasi: body.jenisPrestasi ?? existing.jenisPrestasi,
        penyelenggara: body.penyelenggara ?? existing.penyelenggara,
        deskripsi: body.deskripsi ?? existing.deskripsi ?? undefined,
        bulan: body.bulan ?? existing.bulan,
        tahun: body.tahun ?? existing.tahun,
        competitionType: body.competitionType ?? existing.competitionType,
      },
      body.mediaUrls,
      existing.userId,
    );

    if (!updatedPrestasi) {
      return c.json({ error: 'Achievement not found' }, 404);
    }

    // Return response without media fields to match schema
    const response = {
      id: updatedPrestasi.id,
      userId: updatedPrestasi.userId,
      jenisPrestasi: updatedPrestasi.jenisPrestasi,
      penyelenggara: updatedPrestasi.penyelenggara,
      deskripsi: updatedPrestasi.deskripsi,
      bulan: updatedPrestasi.bulan,
      tahun: updatedPrestasi.tahun,
      competitionType: updatedPrestasi.competitionType,
      createdAt: updatedPrestasi.createdAt,
    };

    return c.json(response, 200);
  } catch (error) {
    console.error('Error updating prestasi:', error);

    if (error instanceof PostgresError) {
      if (error.code === '23503') {
        return c.json(
          {
            formErrors: [],
            fieldErrors: { general: ['Foreign key constraint violation'] },
          },
          400,
        );
      }
      if (error.code === '23505') {
        return c.json(
          { formErrors: [], fieldErrors: { general: ['Duplicate entry'] } },
          400,
        );
      }
    }

    return c.json({ error: 'Internal server error' }, 500);
  }
});

prestasiRouter.delete(
  deletePrestasiRoute.getRoutingPath(),
  roleMiddleware(['people', 'peopledev', 'peoplemanage']),
);
prestasiRouter.openapi(deletePrestasiRoute, async (c) => {
  try {
    const { idPrestasi } = c.req.valid('param');

    const deleted = await deletePrestasi(db, idPrestasi);

    if (!deleted) {
      return c.json({ error: 'Achievement not found' }, 404);
    }

    return c.json({ message: 'Achievement deleted successfully' }, 200);
  } catch (error) {
    console.error('Error deleting prestasi:', error);

    if (error instanceof PostgresError) {
      if (error.code === '23503') {
        return c.json(
          {
            formErrors: [],
            fieldErrors: { general: ['Cannot delete: foreign key constraint'] },
          },
          400,
        );
      }
    }

    return c.json({ error: 'Internal server error' }, 500);
  }
});

prestasiRouter.get(
  exportPrestasiRoute.getRoutingPath(),
  roleMiddleware(['people', 'peopledev', 'peoplemanage', 'cnc']),
);
prestasiRouter.openapi(exportPrestasiRoute, async (c: any) => {
  const query = c.req.valid('query');

  // Apply filters similar to getListPrestasi but without pagination
  const conditions: Array<SQL<unknown>> = [];

  // Filter by category
  if (query.category) {
    const categoryMap = {
      competition: 'kompetisi',
      organization: 'organisasi',
      committee: 'kepanitiaan',
    } as const;

    conditions.push(
      eq(
        prestasi.jenisPrestasi,
        categoryMap[
          query.category as 'competition' | 'organization' | 'committee'
        ],
      ),
    );
  }

  // Filter by date range
  if (query.start_date) {
    const [year, month] = query.start_date.split('-').map(Number);
    conditions.push(
      sql`(${prestasi.tahun} > ${year} OR (${prestasi.tahun} = ${year} AND ${prestasi.bulan} >= ${month}))`,
    );
  }

  if (query.end_date) {
    const [year, month] = query.end_date.split('-').map(Number);
    conditions.push(
      sql`(${prestasi.tahun} < ${year} OR (${prestasi.tahun} = ${year} AND ${prestasi.bulan} <= ${month}))`,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  // Get all prestasi data with user information and media
  const prestasiData = await db.query.prestasi.findMany({
    where,
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
          angkatan: true,
          major: true,
          region: true,
        },
      },
      mediaSertifikat: {
        columns: {
          url: true,
        },
      },
      mediaFotoPribadi: {
        columns: {
          url: true,
        },
      },
      mediaFotoAwarding: {
        columns: {
          url: true,
        },
      },
    },
  });

  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Prestasi Data');

  // Define columns
  worksheet.columns = [
    { header: 'NIM', key: 'nim', width: 12 },
    { header: 'Nama Lengkap', key: 'fullName', width: 25 },
    { header: 'Angkatan', key: 'angkatan', width: 10 },
    { header: 'Jurusan', key: 'jurusan', width: 10 },
    { header: 'Kampus', key: 'kampus', width: 15 },
    { header: 'Jenis Prestasi', key: 'jenisPrestasi', width: 15 },
    { header: 'Nama kompetisi/organisasi', key: 'penyelenggara', width: 30 },
    { header: 'Deskripsi Prestasi', key: 'deskripsi', width: 40 },
    { header: 'Periode pencapaian prestasi', key: 'periode', width: 20 },
    { header: 'Sertifikat', key: 'sertifikat', width: 50 },
    { header: 'Foto pribadi', key: 'fotoPribadi', width: 50 },
    { header: 'Foto saat awarding', key: 'fotoAwarding', width: 50 },
  ];

  // Style the header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Add data rows
  prestasiData.forEach((prestasiItem) => {
    // Format periode (bulan-tahun)
    const monthNames = [
      'Januari',
      'Februari',
      'Maret',
      'April',
      'Mei',
      'Juni',
      'Juli',
      'Agustus',
      'September',
      'Oktober',
      'November',
      'Desember',
    ];
    const periode = `${monthNames[prestasiItem.bulan - 1]} ${prestasiItem.tahun}`;

    worksheet.addRow({
      nim: prestasiItem.user?.nim ?? '',
      fullName: prestasiItem.user?.fullName ?? '',
      angkatan: prestasiItem.user?.angkatan ?? '',
      jurusan: prestasiItem.user?.major ?? '',
      kampus: prestasiItem.user?.region ?? '',
      jenisPrestasi: prestasiItem.jenisPrestasi,
      penyelenggara: prestasiItem.penyelenggara,
      deskripsi: prestasiItem.deskripsi ?? '',
      periode,
      sertifikat: prestasiItem.mediaSertifikat?.url ?? '',
      fotoPribadi: prestasiItem.mediaFotoPribadi?.url ?? '',
      fotoAwarding: prestasiItem.mediaFotoAwarding?.url ?? '',
    });
  });

  // Generate Excel buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Set response headers
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `prestasi-export-${timestamp}.xlsx`;

  c.header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  );
  c.header('Content-Disposition', `attachment; filename="${filename}"`);
  c.header('Content-Length', buffer.byteLength.toString());

  return c.body(buffer);
});
