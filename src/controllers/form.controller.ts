import { PostgresError } from 'postgres';
import { db } from '~/db/drizzle';
import { Form, FormQuestion, FormSection } from '~/db/schema';
import { roleMiddleware } from '~/middlewares/role.middleware';
import {
  buildAnalytics,
  createFormResponse,
  getActiveForms,
  getFormById,
  getFormResponsesCount,
  getFormResponsesForAnalytics,
  getFormResponsesList,
  getResponseByUserId,
} from '~/repositories/form.repo';
import {
  getFormAnalyticsRoute,
  getFormResponsesCountRoute,
  getFormRoute,
  getMyFormResponseRoute,
  listAllFormsRoute,
  listFormResponsesRoute,
  listFormsRoute,
  submitFormResponseRoute,
} from '~/routes/form.route';
import { formAdminRoom, getIo } from '~/websocket/setup';
import { createAuthRouter } from './router-factory';

const FORM_ADMIN_ROLES = ['admin'] as const;

// One-off early-access allowlist: these NIMs may fill the form before opensAt.
const EARLY_ACCESS_NIMS = ['18225020', '13525006'];

function isFormOpenForUser(form: Pick<Form, 'opensAt'>, nim: string): boolean {
  return (
    new Date() >= new Date(form.opensAt) || EARLY_ACCESS_NIMS.includes(nim)
  );
}

export const formRouter = createAuthRouter();

function computeStatus(
  form: Pick<Form, 'opensAt'>,
  hasResponse: boolean,
  nim: string,
): 'not_opened' | 'open' | 'already_responded' {
  if (hasResponse) return 'already_responded';
  if (!isFormOpenForUser(form, nim)) return 'not_opened';
  return 'open';
}

formRouter.openapi(listFormsRoute, async (c) => {
  const user = c.var.user;
  const activeForms = await getActiveForms(db);
  const eligibleForms = activeForms.filter((f) =>
    f.eligibleAngkatan.includes(user.angkatan),
  );

  const forms = await Promise.all(
    eligibleForms.map(async (f) => {
      const response = await getResponseByUserId(db, f.id, user.id);
      const { sections: _sections, ...rest } = f;
      return {
        ...rest,
        status: computeStatus(f, !!response, user.nim),
      };
    }),
  );

  return c.json({ forms }, 200);
});

formRouter.get(
  listAllFormsRoute.getRoutingPath(),
  roleMiddleware([...FORM_ADMIN_ROLES]),
);
formRouter.openapi(listAllFormsRoute, async (c) => {
  const activeForms = await getActiveForms(db);
  const forms = activeForms.map(({ sections: _sections, ...rest }) => rest);
  return c.json({ forms }, 200);
});

formRouter.openapi(getFormRoute, async (c) => {
  const { formId } = c.req.valid('param');
  const user = c.var.user;
  const form = await getFormById(db, formId);
  if (!form) return c.json({ error: 'Form not found' }, 404);

  const opened = isFormOpenForUser(form, user.nim);

  return c.json(
    {
      ...form,
      sections: opened ? form.sections : null,
    },
    200,
  );
});

formRouter.openapi(getMyFormResponseRoute, async (c) => {
  const { formId } = c.req.valid('param');
  const form = await getFormById(db, formId);
  if (!form) return c.json({ error: 'Form not found' }, 404);

  const response = await getResponseByUserId(db, formId, c.var.user.id);
  return c.json(response ?? null, 200);
});

formRouter.openapi(submitFormResponseRoute, async (c) => {
  const { formId } = c.req.valid('param');
  const user = c.var.user;
  const data = c.req.valid('json');

  const form = await getFormById(db, formId);
  if (!form) return c.json({ error: 'Form not found' }, 404);

  if (!form.eligibleAngkatan.includes(user.angkatan)) {
    return c.json({ error: 'You are not eligible for this form' }, 403);
  }

  if (!isFormOpenForUser(form, user.nim)) {
    return c.json({ error: 'This form has not opened yet' }, 403);
  }

  const missing = findMissingRequiredQuestions(form.sections, data.answers);
  if (missing.length > 0) {
    return c.json(
      { error: `Missing required answers: ${missing.join(', ')}` },
      400,
    );
  }

  try {
    const response = await createFormResponse(db, formId, user.id, data);

    getIo()
      .to(formAdminRoom(formId))
      .emit('form:new-response', {
        total: await getFormResponsesCount(db, formId),
        nim: user.nim,
        fullName: user.fullName,
        submittedAt: response.submittedAt,
      });

    return c.json(response, 201);
  } catch (err) {
    if (err instanceof PostgresError) {
      if (err.code === '23505') {
        return c.json(
          { error: 'Already submitted a response for this form' },
          409,
        );
      }
      return c.json({ error: err.message }, 400);
    }
    throw err;
  }
});

formRouter.get(
  listFormResponsesRoute.getRoutingPath(),
  roleMiddleware([...FORM_ADMIN_ROLES]),
);
formRouter.openapi(listFormResponsesRoute, async (c) => {
  const { formId } = c.req.valid('param');
  const query = c.req.valid('query');
  const { responses, total } = await getFormResponsesList(db, formId, query);
  return c.json(
    { responses, total, page: query.page, limit: query.limit },
    200,
  );
});

formRouter.get(
  getFormResponsesCountRoute.getRoutingPath(),
  roleMiddleware([...FORM_ADMIN_ROLES]),
);
formRouter.openapi(getFormResponsesCountRoute, async (c) => {
  const { formId } = c.req.valid('param');
  const total = await getFormResponsesCount(db, formId);
  return c.json({ total }, 200);
});

formRouter.get(
  getFormAnalyticsRoute.getRoutingPath(),
  roleMiddleware([...FORM_ADMIN_ROLES]),
);
formRouter.openapi(getFormAnalyticsRoute, async (c) => {
  const { formId } = c.req.valid('param');
  const form = await getFormById(db, formId);
  if (!form) return c.json({ error: 'Form not found' }, 404);

  const responses = await getFormResponsesForAnalytics(db, formId);
  const analytics = buildAnalytics(form.sections, responses);
  return c.json(analytics, 200);
});

/**
 * Returns labels of required questions that were not answered. A question is
 * only required if it doesn't have a `dependsOn`, or its `dependsOn`
 * condition is satisfied by the submitted answers (see plan's judgment call
 * on question #17 — conditionally-required questions aren't required when
 * N/A).
 */
function findMissingRequiredQuestions(
  sections: FormSection[],
  answers: Array<{ questionId: string; answer: string | string[] }>,
): string[] {
  const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));
  const missing: string[] = [];

  const isAnswered = (questionId: string) => {
    const answer = answerMap.get(questionId);
    if (answer === undefined) return false;
    return Array.isArray(answer) ? answer.length > 0 : answer.trim() !== '';
  };

  const isRequired = (question: FormQuestion) => {
    if (question.optional) return false;
    if (!question.dependsOn) return true;
    const dependsAnswer = answerMap.get(question.dependsOn.questionId);
    if (Array.isArray(dependsAnswer)) {
      return dependsAnswer.includes(question.dependsOn.value);
    }
    return dependsAnswer === question.dependsOn.value;
  };

  for (const section of sections) {
    for (const question of section.questions) {
      if (isRequired(question) && !isAnswered(question.id)) {
        missing.push(question.label);
      }
    }
  }

  return missing;
}
