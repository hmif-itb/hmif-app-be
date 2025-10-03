import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import { users } from '~/db/schema';
import { eq } from 'drizzle-orm';
import { createPrestasi, getListPrestasi, getPrestasiById } from '~/repositories/prestasi.repo';
import {
  createPrestasiRoute,
  getListPrestasiRoute,
  getPrestasiByIdRoute,
} from '~/routes/prestasi.route';
import { createAuthRouter } from './router-factory';

export const prestasiRouter = createAuthRouter();

prestasiRouter.openapi(getListPrestasiRoute, async (c) => {
  const query = c.req.valid('query');
  const result = await getListPrestasi(db, query);
  return c.json(result, 200);
});

prestasiRouter.openapi(getPrestasiByIdRoute, async (c) => {
  const { idPrestasi } = c.req.valid('param');
  const result = await getPrestasiById(db, idPrestasi);

  if (!result) {
    return c.json({ error: 'Achievement not found' }, 404);
  }

  return c.json(result, 200);
});

prestasiRouter.openapi(createPrestasiRoute, async (c) => {
  try {
    const body = c.req.valid('json');
    const user = c.var.user;

    // Determine user ID - use provided userId for admin, otherwise use current user
    const targetUserId = body.userId || user.id;

    // Verify user exists
    const [targetUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, targetUserId));

    if (!targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    // Create prestasi
    const newPrestasi = await createPrestasi(db, {
      userId: targetUserId,
      jenisPrestasi: body.jenisPrestasi,
      penyelenggara: body.penyelenggara,
      deskripsi: body.deskripsi || undefined,
      bulan: body.bulan,
      tahun: body.tahun,
      competitionType: body.competitionType || undefined,
    }, body.mediaUrls);

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
