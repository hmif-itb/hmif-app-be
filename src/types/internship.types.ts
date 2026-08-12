import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import {
  internshipDepartments,
  internshipDivisions,
  internshipSubmissionChoices,
  internshipSubmissions,
} from '~/db/schema';

export const InternshipQuestionSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['text', 'textarea', 'select']),
    options: z.array(z.string()).optional(),
    required: z.boolean(),
  })
  .openapi('InternshipQuestion');

export const InternshipKesibukanSchema = z
  .object({
    jabatan: z.string(),
    organisasi: z.string(),
    periode: z.string(),
  })
  .openapi('InternshipKesibukan');

export const InternshipAnswerSchema = z
  .object({
    questionId: z.string(),
    answer: z.string(),
  })
  .openapi('InternshipAnswer');

export const InternshipDivisionSchema = createSelectSchema(
  internshipDivisions,
  {
    questions: z.array(InternshipQuestionSchema),
    questionsRaw: z.string().nullable(),
  },
).openapi('InternshipDivision');

export const InternshipDepartmentSchema = createSelectSchema(
  internshipDepartments,
)
  .extend({
    divisions: z.array(InternshipDivisionSchema).optional(),
  })
  .openapi('InternshipDepartment');

export const CreateInternshipDepartmentSchema = createInsertSchema(
  internshipDepartments,
).omit({ id: true });

export const UpdateInternshipDepartmentSchema =
  CreateInternshipDepartmentSchema.partial();

export const CreateInternshipDivisionSchema = createInsertSchema(
  internshipDivisions,
  {
    questions: z.array(InternshipQuestionSchema).optional(),
  },
).omit({ id: true });

export const UpdateInternshipDivisionSchema =
  CreateInternshipDivisionSchema.partial();

export const InternshipIdParamSchema = z.object({
  id: z.string().openapi({
    param: { in: 'path', description: 'Id', example: '1' },
  }),
});

export const InternshipSubmissionChoiceSchema = createSelectSchema(
  internshipSubmissionChoices,
  {
    answers: z.array(InternshipAnswerSchema),
  },
)
  .extend({
    division: InternshipDivisionSchema.optional(),
  })
  .openapi('InternshipSubmissionChoice');

export const InternshipSubmissionSchema = createSelectSchema(
  internshipSubmissions,
  {
    kesibukan: z.array(InternshipKesibukanSchema),
    createdAt: z.union([z.string(), z.date()]),
    updatedAt: z.union([z.string(), z.date()]),
    submittedAt: z.union([z.string(), z.date(), z.null()]),
  },
)
  .extend({
    choices: z.array(InternshipSubmissionChoiceSchema).optional(),
  })
  .openapi('InternshipSubmission');

export const UpsertInternshipSubmissionChoiceSchema = z.object({
  divisionId: z.string(),
  priorityOrder: z.number().int().min(1),
  answers: z.array(InternshipAnswerSchema),
});

export const UpsertInternshipSubmissionSchema = z.object({
  kelas: z.string().min(1),
  idLine: z.string().min(1),
  pengalamanOrganisasi: z.string().optional(),
  kesibukan: z.array(InternshipKesibukanSchema).default([]),
  choices: z
    .array(UpsertInternshipSubmissionChoiceSchema)
    .min(1)
    .max(4)
    .openapi({
      description: 'Pilihan divisi berdasarkan prioritas, maksimal 4',
    }),
});

export const ListInternshipSubmissionsQuerySchema = z.object({
  divisionId: z
    .string()
    .optional()
    .openapi({
      param: { in: 'query', description: 'Filter by division id' },
    }),
  locked: z
    .enum(['true', 'false'])
    .optional()
    .openapi({
      param: { in: 'query', description: 'Filter by lock status' },
    }),
  offset: z.coerce.number().int().nonnegative().optional(),
});

export const ListInternshipSubmissionsSchema = z.object({
  submissions: z.array(InternshipSubmissionSchema),
});
