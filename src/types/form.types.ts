import { z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { forms } from '~/db/schema';

export const FormQuestionSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['text', 'textarea', 'radio', 'checkbox']),
    options: z.array(z.string()).optional(),
    dependsOn: z
      .object({ questionId: z.string(), value: z.string() })
      .optional(),
  })
  .openapi('FormQuestion');

export const FormSectionSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    questions: z.array(FormQuestionSchema),
  })
  .openapi('FormSection');

export const FormAnswerSchema = z
  .object({
    questionId: z.string(),
    answer: z.union([z.string(), z.array(z.string())]),
  })
  .openapi('FormAnswer');

export const FormStatusSchema = z.enum([
  'not_opened',
  'open',
  'already_responded',
]);

export const FormListItemSchema = createSelectSchema(forms, {
  eligibleAngkatan: z.array(z.number()),
  sections: z.array(FormSectionSchema),
  opensAt: z.union([z.string(), z.date()]),
  createdAt: z.union([z.string(), z.date()]),
})
  .omit({ sections: true })
  .extend({ status: FormStatusSchema })
  .openapi('FormListItem');

export const ListFormsSchema = z.object({
  forms: z.array(FormListItemSchema),
});

export const AdminFormListItemSchema = createSelectSchema(forms, {
  eligibleAngkatan: z.array(z.number()),
  sections: z.array(FormSectionSchema),
  opensAt: z.union([z.string(), z.date()]),
  createdAt: z.union([z.string(), z.date()]),
})
  .omit({ sections: true })
  .openapi('AdminFormListItem');

export const AdminListFormsSchema = z.object({
  forms: z.array(AdminFormListItemSchema),
});

export const FormDetailSchema = createSelectSchema(forms, {
  eligibleAngkatan: z.array(z.number()),
  sections: z.array(FormSectionSchema).nullable(),
  opensAt: z.union([z.string(), z.date()]),
  createdAt: z.union([z.string(), z.date()]),
}).openapi('FormDetail');

export const FormIdParamSchema = z.object({
  formId: z.string().openapi({
    param: { in: 'path', description: 'Form id', example: 'abc12345' },
  }),
});

export const FormResponseSchema = z
  .object({
    id: z.string(),
    formId: z.string(),
    userId: z.string(),
    answers: z.array(FormAnswerSchema),
    submittedAt: z.union([z.string(), z.date()]),
  })
  .openapi('FormResponse');

export const SubmitFormResponseSchema = z.object({
  answers: z.array(FormAnswerSchema),
});

export const AdminFormResponseItemSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    nim: z.string(),
    fullName: z.string(),
    major: z.string(),
    angkatan: z.number(),
    answers: z.array(FormAnswerSchema),
    submittedAt: z.union([z.string(), z.date()]),
  })
  .openapi('AdminFormResponseItem');

export const ListFormResponsesQuerySchema = z.object({
  search: z
    .string()
    .optional()
    .openapi({
      param: { in: 'query', description: 'Search by NIM or name' },
    }),
  page: z.coerce
    .number()
    .int()
    .min(1)
    .optional()
    .default(1)
    .openapi({ param: { in: 'query' } }),
  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .openapi({ param: { in: 'query' } }),
});

export const ListFormResponsesSchema = z.object({
  responses: z.array(AdminFormResponseItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const FormResponsesCountSchema = z.object({
  total: z.number(),
});

export const FormAnalyticsOptionCountSchema = z.object({
  value: z.string(),
  count: z.number(),
});

export const FormAnalyticsQuestionSchema = z.object({
  questionId: z.string(),
  label: z.string(),
  type: z.enum(['radio', 'checkbox']),
  options: z.array(FormAnalyticsOptionCountSchema),
});

export const FormAnalyticsSchema = z.object({
  totalResponses: z.number(),
  questions: z.array(FormAnalyticsQuestionSchema),
});
