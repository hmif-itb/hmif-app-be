import { db } from '~/db/drizzle';
import { isInRoles } from '~/lib/roles';
import {
  getLaporanById,
  getLaporanList,
  getPeminjamanRequestById,
  getPeminjamanRequests,
  getPeminjamanSchedule,
  updateLaporanStatus,
  updatePeminjamanStatus,
} from '~/repositories/request-laporan.repo';
import {
  getLaporanListRoute,
  getPeminjamanScheduleRoute,
  getRequestListRoute,
  updateLaporanStatusRoute,
  updateRequestStatusRoute,
} from '~/routes/request-laporan.route';
import { createAuthRouter } from './router-factory';

export const requestLaporanRouter = createAuthRouter();

requestLaporanRouter.openapi(getRequestListRoute, async (c) => {
  try {
    const roles = await db.query.userRoles.findMany({
      where: (ur, { eq }) => eq(ur.userId, c.var.user.id),
    });
    const userRoleNames = roles.map((r) => r.role);
    const isAdmin = isInRoles(userRoleNames, ['household', 'admin']);

    if (!isAdmin) {
      return c.json({ error: 'Akses ditolak' }, 403) as unknown as any;
    }

    const data = await getPeminjamanRequests(db, c.req.valid('query'));
    const serialized = data.map((d) => ({
      ...d,
      createdAt: d.createdAt?.toISOString?.() ?? d.createdAt,
      startDate: d.startDate?.toISOString?.() ?? d.startDate,
      endDate: d.endDate?.toISOString?.() ?? d.endDate,
    }));

    return c.json(serialized, 200) as unknown as any;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error
    ) {
      return c.json(
        {
          error: (error as { message: string }).message,
        },
        400,
      ) as unknown as any;
    }

    if (error instanceof Error) {
      return c.json({ error: error.message }, 500) as unknown as any;
    }

    return c.json(
      { error: 'Terjadi kesalahan tidak dikenal' },
      500,
    ) as unknown as any;
  }
});

requestLaporanRouter.openapi(getPeminjamanScheduleRoute, async (c) => {
  try {
    const { propertiId } = c.req.valid('param');
    const schedule = await getPeminjamanSchedule(db, propertiId);

    if (!schedule) {
      return c.json(
        { error: 'Properti tidak ditemukan' },
        404,
      ) as unknown as any;
    }

    const serialized = {
      propertyId: schedule.propertyId,
      schedules: schedule.schedules.map((s) => ({
        ...s,
        startDate: s.startDate?.toISOString?.() ?? s.startDate,
        endDate: s.endDate?.toISOString?.() ?? s.endDate,
      })),
    };

    return c.json(serialized, 200) as unknown as any;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error
    ) {
      return c.json(
        {
          error: (error as { message: string }).message,
        },
        400,
      ) as unknown as any;
    }

    if (error instanceof Error) {
      return c.json({ error: error.message }, 500) as unknown as any;
    }

    return c.json(
      { error: 'Terjadi kesalahan tidak dikenal' },
      500,
    ) as unknown as any;
  }
});

requestLaporanRouter.openapi(updateRequestStatusRoute, async (c) => {
  try {
    const roles = await db.query.userRoles.findMany({
      where: (ur, { eq }) => eq(ur.userId, c.var.user.id),
    });
    const userRoleNames = roles.map((r) => r.role);
    const isAdmin = isInRoles(userRoleNames, ['household', 'admin']);

    if (!isAdmin) {
      return c.json({ error: 'Akses ditolak' }, 403) as unknown as any;
    }

    const { peminjamanId } = c.req.valid('param');
    const body = c.req.valid('json');
    const existing = await getPeminjamanRequestById(db, peminjamanId);

    if (!existing) {
      return c.json(
        { error: 'Request tidak ditemukan' },
        404,
      ) as unknown as any;
    }

    const data = await updatePeminjamanStatus(db, peminjamanId, body);
    const serialized = {
      ...data,
      createdAt: data.createdAt?.toISOString?.() ?? data.createdAt,
      startDate: data.startDate?.toISOString?.() ?? data.startDate,
      endDate: data.endDate?.toISOString?.() ?? data.endDate,
    };

    return c.json(serialized, 200) as unknown as any;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error
    ) {
      return c.json(
        {
          error: (error as { message: string }).message,
        },
        400,
      ) as unknown as any;
    }

    if (error instanceof Error) {
      return c.json({ error: error.message }, 500) as unknown as any;
    }

    return c.json(
      { error: 'Terjadi kesalahan tidak dikenal' },
      500,
    ) as unknown as any;
  }
});

requestLaporanRouter.openapi(getLaporanListRoute, async (c) => {
  try {
    const roles = await db.query.userRoles.findMany({
      where: (ur, { eq }) => eq(ur.userId, c.var.user.id),
    });
    const userRoleNames = roles.map((r) => r.role);
    const isAdmin = isInRoles(userRoleNames, ['household', 'admin']);

    if (!isAdmin) {
      return c.json({ error: 'Akses ditolak' }, 403) as unknown as any;
    }

    const data = await getLaporanList(db, c.req.valid('query'));
    const serialized = data.map((d) => ({
      ...d,
      createdAt: d.createdAt?.toISOString?.() ?? d.createdAt,
      updatedAt: d.updatedAt?.toISOString?.() ?? d.updatedAt,
    }));

    return c.json(serialized, 200) as unknown as any;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error
    ) {
      return c.json(
        {
          error: (error as { message: string }).message,
        },
        400,
      ) as unknown as any;
    }

    if (error instanceof Error) {
      return c.json({ error: error.message }, 500) as unknown as any;
    }

    return c.json(
      { error: 'Terjadi kesalahan tidak dikenal' },
      500,
    ) as unknown as any;
  }
});

requestLaporanRouter.openapi(updateLaporanStatusRoute, async (c) => {
  try {
    const roles = await db.query.userRoles.findMany({
      where: (ur, { eq }) => eq(ur.userId, c.var.user.id),
    });
    const userRoleNames = roles.map((r) => r.role);
    const isAdmin = isInRoles(userRoleNames, ['household', 'admin']);

    if (!isAdmin) {
      return c.json({ error: 'Akses ditolak' }, 403) as unknown as any;
    }

    const { laporanId } = c.req.valid('param');
    const body = c.req.valid('json');
    const existing = await getLaporanById(db, laporanId);

    if (!existing) {
      return c.json(
        { error: 'Laporan tidak ditemukan' },
        404,
      ) as unknown as any;
    }

    const data = await updateLaporanStatus(db, laporanId, body);
    const serialized = {
      ...data,
      createdAt: data.createdAt?.toISOString?.() ?? data.createdAt,
      updatedAt: data.updatedAt?.toISOString?.() ?? data.updatedAt,
    };

    return c.json(serialized, 200) as unknown as any;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      'message' in error
    ) {
      return c.json(
        {
          error: (error as { message: string }).message,
        },
        400,
      ) as unknown as any;
    }

    if (error instanceof Error) {
      return c.json({ error: error.message }, 500) as unknown as any;
    }

    return c.json(
      { error: 'Terjadi kesalahan tidak dikenal' },
      500,
    ) as unknown as any;
  }
});
