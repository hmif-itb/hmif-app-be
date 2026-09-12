import { and, asc, desc, eq, ilike, or, sql } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { forms, formResponses, FormSection, users } from '~/db/schema';
import {
  ListFormResponsesQuerySchema,
  SubmitFormResponseSchema,
} from '~/types/form.types';

export async function getActiveForms(db: Database) {
  return await db.query.forms.findMany({
    where: eq(forms.isActive, true),
    orderBy: asc(forms.order),
  });
}

export async function getFormById(db: Database, formId: string) {
  return await db.query.forms.findFirst({
    where: eq(forms.id, formId),
  });
}

export async function getResponseByUserId(
  db: Database,
  formId: string,
  userId: string,
) {
  return await db.query.formResponses.findFirst({
    where: and(
      eq(formResponses.formId, formId),
      eq(formResponses.userId, userId),
    ),
  });
}

export async function createFormResponse(
  db: Database,
  formId: string,
  userId: string,
  data: z.infer<typeof SubmitFormResponseSchema>,
) {
  return await db
    .insert(formResponses)
    .values({
      formId,
      userId,
      answers: data.answers,
    })
    .returning()
    .then(firstSure);
}

export async function getFormResponsesList(
  db: Database,
  formId: string,
  q: z.infer<typeof ListFormResponsesQuerySchema>,
) {
  const searchQ = q.search
    ? or(
        ilike(users.nim, `%${q.search}%`),
        ilike(users.fullName, `%${q.search}%`),
      )
    : undefined;

  const where = and(eq(formResponses.formId, formId), searchQ);

  const [responses, [{ count }]] = await Promise.all([
    db
      .select({
        id: formResponses.id,
        userId: formResponses.userId,
        answers: formResponses.answers,
        submittedAt: formResponses.submittedAt,
        nim: users.nim,
        fullName: users.fullName,
        major: users.major,
        angkatan: users.angkatan,
      })
      .from(formResponses)
      .innerJoin(users, eq(formResponses.userId, users.id))
      .where(where)
      .orderBy(desc(formResponses.submittedAt))
      .limit(q.limit)
      .offset((q.page - 1) * q.limit),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(formResponses)
      .innerJoin(users, eq(formResponses.userId, users.id))
      .where(where),
  ]);

  return { responses, total: count };
}

export async function getFormResponsesCount(db: Database, formId: string) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(formResponses)
    .where(eq(formResponses.formId, formId));
  return count;
}

export async function getFormResponsesForAnalytics(
  db: Database,
  formId: string,
) {
  return await db
    .select({ answers: formResponses.answers })
    .from(formResponses)
    .where(eq(formResponses.formId, formId));
}

export function buildAnalytics(
  sections: FormSection[],
  responses: Array<{
    answers: Array<{ questionId: string; answer: string | string[] }>;
  }>,
) {
  const choiceQuestions = sections.flatMap((s) =>
    s.questions.filter(
      (q) => q.type === 'radio' || q.type === 'checkbox' || q.type === 'rating',
    ),
  );

  const questions = choiceQuestions.map((question) => {
    const counts = new Map<string, number>();
    for (const option of question.options ?? []) {
      counts.set(option, 0);
    }

    for (const response of responses) {
      const answer = response.answers.find(
        (a) => a.questionId === question.id,
      )?.answer;
      if (!answer) continue;

      const values = Array.isArray(answer) ? answer : [answer];
      for (const value of values) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }

    return {
      questionId: question.id,
      label: question.label,
      type: question.type as 'radio' | 'checkbox' | 'rating',
      options: Array.from(counts.entries()).map(([value, count]) => ({
        value,
        count,
      })),
    };
  });

  return { totalResponses: responses.length, questions };
}
