import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import {
  createProperti,
  deleteProperti,
  getPropertiById,
  getPropertiList,
  updateProperti,
} from '~/repositories/properti.repo';
import {
  createPropertiRoute,
  deletePropertiRoute,
  getPropertiByIdRoute,
  getPropertiListRoute,
  updatePropertiRoute,
} from '~/routes/properti.route';
import { createAuthRouter } from './router-factory';
import { isInRoles } from '~/lib/roles';

export const propertiRouter = createAuthRouter();

propertiRouter.openapi(getPropertiListRoute, async (c) => {
  try {
    const data = await getPropertiList(db, c.req.valid('query'));

    const serialized = data.map((p) => ({
      ...p,
      status: p.status ?? 'available',
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      location: p.location as 'Sekretariat 1' | 'Sekretariat 2' | 'Jatinangor',
    }));

    return c.json(serialized, 200);
  } catch (error) {
    if (error instanceof PostgresError) {
      return c.json({ error: error.message }, 400);
    }
    throw error;
  }
});

propertiRouter.openapi(getPropertiByIdRoute, async (c) => {
  const { propertiId } = c.req.valid('param');
  const data = await getPropertiById(db, propertiId);

  if (!data) {
    return c.json({ error: 'Properti tidak ditemukan' }, 404);
  }

  return c.json(
    {
      ...data,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
    },
    200,
  );
});

propertiRouter.openapi(createPropertiRoute, async (c) => {
  const roles = await db.query.userRoles.findMany({
    where: (ur, { eq }) => eq(ur.userId, c.var.user.id),
  });
  const userRoleNames = roles.map((r) => r.role);

  const isAdmin = isInRoles(userRoleNames, ['household', 'admin']);

  if (!isAdmin) {
    return c.json({ error: 'Akses ditolak' }, 403);
  }

  const body = c.req.valid('json');

  const data = await createProperti(db, body);

  return c.json(data, 201);
});

propertiRouter.openapi(updatePropertiRoute, async (c) => {
  const roles = await db.query.userRoles.findMany({
    where: (ur, { eq }) => eq(ur.userId, c.var.user.id),
  });
  const userRoleNames = roles.map((r) => r.role);
  const isAdmin = isInRoles(userRoleNames, ['household', 'admin']);

  if (!isAdmin) {
    return c.json({ error: 'Akses ditolak' }, 403);
  }

  const { propertiId } = c.req.valid('param');
  const body = c.req.valid('json');

  const existing = await getPropertiById(db, propertiId);
  if (!existing) {
    return c.json({ error: 'Properti tidak ditemukan' }, 404);
  }

  const data = await updateProperti(db, propertiId, body);
  return c.json(data, 200);
});

propertiRouter.openapi(deletePropertiRoute, async (c) => {
  const roles = await db.query.userRoles.findMany({
    where: (ur, { eq }) => eq(ur.userId, c.var.user.id),
  });
  const userRoleNames = roles.map((r) => r.role);
  const isAdmin = isInRoles(userRoleNames, ['household', 'admin']);

  if (!isAdmin) {
    return c.json({ error: 'Akses ditolak' }, 403);
  }

  const { propertiId } = c.req.valid('param');
  const data = await deleteProperti(db, propertiId);

  if (!data) {
    return c.json({ error: 'Properti tidak ditemukan' }, 404);
  }

  return c.body(null, 204);
});
