import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import {
  internshipDepartments,
  internshipDivisions,
  internshipSubmissionChoices,
  internshipSubmissions,
} from '~/db/schema';
import {
  CreateInternshipDepartmentSchema,
  CreateInternshipDivisionSchema,
  ListInternshipSubmissionsQuerySchema,
  UpdateInternshipDepartmentSchema,
  UpdateInternshipDivisionSchema,
  UpsertInternshipSubmissionSchema,
} from '~/types/internship.types';

const SUBMISSIONS_PER_PAGE = 20;

export async function getDepartmentsWithDivisions(db: Database) {
  return await db.query.internshipDepartments.findMany({
    orderBy: asc(internshipDepartments.order),
    with: {
      divisions: {
        orderBy: asc(internshipDivisions.order),
      },
    },
  });
}

export async function createDepartment(
  db: Database,
  data: z.infer<typeof CreateInternshipDepartmentSchema>,
) {
  return await db
    .insert(internshipDepartments)
    .values(data)
    .returning()
    .then(firstSure);
}

export async function updateDepartment(
  db: Database,
  id: string,
  data: z.infer<typeof UpdateInternshipDepartmentSchema>,
) {
  return await db
    .update(internshipDepartments)
    .set(data)
    .where(eq(internshipDepartments.id, id))
    .returning()
    .then(first);
}

export async function deleteDepartment(db: Database, id: string) {
  return await db
    .delete(internshipDepartments)
    .where(eq(internshipDepartments.id, id))
    .returning()
    .then(first);
}

export async function createDivision(
  db: Database,
  data: z.infer<typeof CreateInternshipDivisionSchema>,
) {
  return await db
    .insert(internshipDivisions)
    .values(data)
    .returning()
    .then(firstSure);
}

export async function updateDivision(
  db: Database,
  id: string,
  data: z.infer<typeof UpdateInternshipDivisionSchema>,
) {
  return await db
    .update(internshipDivisions)
    .set(data)
    .where(eq(internshipDivisions.id, id))
    .returning()
    .then(first);
}

export async function deleteDivision(db: Database, id: string) {
  return await db
    .delete(internshipDivisions)
    .where(eq(internshipDivisions.id, id))
    .returning()
    .then(first);
}

export async function getDivisionById(db: Database, id: string) {
  return await db.query.internshipDivisions.findFirst({
    where: eq(internshipDivisions.id, id),
  });
}

export async function getSubmissionByUserId(db: Database, userId: string) {
  return await db.query.internshipSubmissions.findFirst({
    where: eq(internshipSubmissions.userId, userId),
    with: {
      choices: {
        orderBy: asc(internshipSubmissionChoices.priorityOrder),
        with: {
          division: {
            with: { department: true },
          },
        },
      },
    },
  });
}

export async function getSubmissionById(db: Database, id: string) {
  return await db.query.internshipSubmissions.findFirst({
    where: eq(internshipSubmissions.id, id),
    with: {
      choices: {
        orderBy: asc(internshipSubmissionChoices.priorityOrder),
        with: {
          division: {
            with: { department: true },
          },
        },
      },
    },
  });
}

export async function upsertSubmission(
  db: Database,
  user: { id: string; nim: string; fullName: string; major: string },
  data: z.infer<typeof UpsertInternshipSubmissionSchema>,
  submit: boolean,
) {
  return await db.transaction(async (trx) => {
    const existing = await trx.query.internshipSubmissions.findFirst({
      where: eq(internshipSubmissions.userId, user.id),
    });

    if (existing?.isLocked) {
      throw new Error('LOCKED');
    }

    const submissionValues = {
      userId: user.id,
      nim: user.nim,
      fullName: user.fullName,
      jurusan: user.major,
      kelas: data.kelas,
      idLine: data.idLine,
      pengalamanOrganisasi: data.pengalamanOrganisasi,
      kesibukan: data.kesibukan,
      ...(submit ? { isLocked: true, submittedAt: new Date() } : {}),
      updatedAt: new Date(),
    };

    const submission = existing
      ? await trx
          .update(internshipSubmissions)
          .set(submissionValues)
          .where(eq(internshipSubmissions.id, existing.id))
          .returning()
          .then(firstSure)
      : await trx
          .insert(internshipSubmissions)
          .values(submissionValues)
          .returning()
          .then(firstSure);

    await trx
      .delete(internshipSubmissionChoices)
      .where(eq(internshipSubmissionChoices.submissionId, submission.id));

    if (data.choices.length > 0) {
      await trx.insert(internshipSubmissionChoices).values(
        data.choices.map((choice) => ({
          submissionId: submission.id,
          divisionId: choice.divisionId,
          priorityOrder: choice.priorityOrder,
          answers: choice.answers,
        })),
      );
    }

    return submission;
  });
}

export async function getSubmissionsList(
  db: Database,
  q: z.infer<typeof ListInternshipSubmissionsQuerySchema>,
) {
  const lockedQ =
    q.locked !== undefined
      ? eq(internshipSubmissions.isLocked, q.locked === 'true')
      : undefined;

  const where = and(lockedQ);

  const submissions = await db.query.internshipSubmissions.findMany({
    where,
    limit: SUBMISSIONS_PER_PAGE,
    offset: q.offset,
    orderBy: asc(internshipSubmissions.createdAt),
    with: {
      choices: {
        orderBy: asc(internshipSubmissionChoices.priorityOrder),
        with: {
          division: {
            with: { department: true },
          },
        },
      },
    },
  });

  if (q.divisionId) {
    return submissions.filter((s) =>
      s.choices.some((c) => c.divisionId === q.divisionId),
    );
  }

  return submissions;
}
