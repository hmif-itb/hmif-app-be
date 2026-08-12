import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import { internshipEligibilityMiddleware } from '~/middlewares/internship-eligibility.middleware';
import { roleMiddleware } from '~/middlewares/role.middleware';
import {
  createDepartment,
  createDivision,
  deleteDepartment,
  deleteDivision,
  getDepartmentsWithDivisions,
  getSubmissionById,
  getSubmissionByUserId,
  getSubmissionsList,
  updateDepartment,
  updateDivision,
  upsertSubmission,
} from '~/repositories/internship.repo';
import {
  createInternshipDepartmentRoute,
  createInternshipDivisionRoute,
  deleteInternshipDepartmentRoute,
  deleteInternshipDivisionRoute,
  getInternshipDepartmentsRoute,
  getInternshipSubmissionByIdRoute,
  getMyInternshipSubmissionRoute,
  listInternshipSubmissionsRoute,
  submitMyInternshipSubmissionRoute,
  updateInternshipDepartmentRoute,
  updateInternshipDivisionRoute,
  upsertMyInternshipSubmissionRoute,
} from '~/routes/internship.route';
import { createAuthRouter } from './router-factory';

const SPARTA_ADMIN_ROLES = ['peoplemanage'] as const;

export const internshipRouter = createAuthRouter();

internshipRouter.openapi(getInternshipDepartmentsRoute, async (c) => {
  const departments = await getDepartmentsWithDivisions(db);
  return c.json({ departments }, 200);
});

internshipRouter.post(
  createInternshipDepartmentRoute.getRoutingPath(),
  roleMiddleware([...SPARTA_ADMIN_ROLES]),
);
internshipRouter.openapi(createInternshipDepartmentRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const department = await createDepartment(db, data);
    return c.json(department, 201);
  } catch (err) {
    if (err instanceof PostgresError) {
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }
});

internshipRouter.put(
  updateInternshipDepartmentRoute.getRoutingPath(),
  roleMiddleware([...SPARTA_ADMIN_ROLES]),
);
internshipRouter.openapi(updateInternshipDepartmentRoute, async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const department = await updateDepartment(db, id, data);
  if (!department) return c.json({ error: 'Department not found' }, 404);
  return c.json(department, 200);
});

internshipRouter.delete(
  deleteInternshipDepartmentRoute.getRoutingPath(),
  roleMiddleware([...SPARTA_ADMIN_ROLES]),
);
internshipRouter.openapi(deleteInternshipDepartmentRoute, async (c) => {
  const { id } = c.req.valid('param');
  const department = await deleteDepartment(db, id);
  if (!department) return c.json({ error: 'Department not found' }, 404);
  return c.json(department, 200);
});

internshipRouter.post(
  createInternshipDivisionRoute.getRoutingPath(),
  roleMiddleware([...SPARTA_ADMIN_ROLES]),
);
internshipRouter.openapi(createInternshipDivisionRoute, async (c) => {
  try {
    const data = c.req.valid('json');
    const division = await createDivision(db, data);
    return c.json(division, 201);
  } catch (err) {
    if (err instanceof PostgresError) {
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }
});

internshipRouter.put(
  updateInternshipDivisionRoute.getRoutingPath(),
  roleMiddleware([...SPARTA_ADMIN_ROLES]),
);
internshipRouter.openapi(updateInternshipDivisionRoute, async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const division = await updateDivision(db, id, data);
  if (!division) return c.json({ error: 'Division not found' }, 404);
  return c.json(division, 200);
});

internshipRouter.delete(
  deleteInternshipDivisionRoute.getRoutingPath(),
  roleMiddleware([...SPARTA_ADMIN_ROLES]),
);
internshipRouter.openapi(deleteInternshipDivisionRoute, async (c) => {
  const { id } = c.req.valid('param');
  const division = await deleteDivision(db, id);
  if (!division) return c.json({ error: 'Division not found' }, 404);
  return c.json(division, 200);
});

internshipRouter.use(
  getMyInternshipSubmissionRoute.getRoutingPath(),
  internshipEligibilityMiddleware,
);
internshipRouter.openapi(getMyInternshipSubmissionRoute, async (c) => {
  const submission = await getSubmissionByUserId(db, c.var.user.id);
  return c.json(submission ?? null, 200);
});

internshipRouter.use(
  upsertMyInternshipSubmissionRoute.getRoutingPath(),
  internshipEligibilityMiddleware,
);
internshipRouter.openapi(upsertMyInternshipSubmissionRoute, async (c) => {
  const data = c.req.valid('json');
  try {
    const submission = await upsertSubmission(
      db,
      {
        id: c.var.user.id,
        nim: c.var.user.nim,
        fullName: c.var.user.fullName,
        major: c.var.user.major,
      },
      data,
      false,
    );
    return c.json(submission, 200);
  } catch (err) {
    if (err instanceof Error && err.message === 'LOCKED') {
      return c.json({ error: 'Submission is already locked' }, 409);
    }
    if (err instanceof PostgresError) {
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }
});

internshipRouter.use(
  submitMyInternshipSubmissionRoute.getRoutingPath(),
  internshipEligibilityMiddleware,
);
internshipRouter.openapi(submitMyInternshipSubmissionRoute, async (c) => {
  const data = c.req.valid('json');
  try {
    const submission = await upsertSubmission(
      db,
      {
        id: c.var.user.id,
        nim: c.var.user.nim,
        fullName: c.var.user.fullName,
        major: c.var.user.major,
      },
      data,
      true,
    );
    return c.json(submission, 200);
  } catch (err) {
    if (err instanceof Error && err.message === 'LOCKED') {
      return c.json({ error: 'Submission is already locked' }, 409);
    }
    if (err instanceof PostgresError) {
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }
});

internshipRouter.get(
  listInternshipSubmissionsRoute.getRoutingPath(),
  roleMiddleware([...SPARTA_ADMIN_ROLES]),
);
internshipRouter.openapi(listInternshipSubmissionsRoute, async (c) => {
  const query = c.req.valid('query');
  const submissions = await getSubmissionsList(db, query);
  return c.json({ submissions }, 200);
});

internshipRouter.get(
  getInternshipSubmissionByIdRoute.getRoutingPath(),
  roleMiddleware([...SPARTA_ADMIN_ROLES]),
);
internshipRouter.openapi(getInternshipSubmissionByIdRoute, async (c) => {
  const { id } = c.req.valid('param');
  const submission = await getSubmissionById(db, id);
  if (!submission) return c.json({ error: 'Submission not found' }, 404);
  return c.json(submission, 200);
});
