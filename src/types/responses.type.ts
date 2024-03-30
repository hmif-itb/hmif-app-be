import { createRoute, z } from '@hono/zod-openapi';

export type ResponseItem = Parameters<
  typeof createRoute
>[0]['responses'][string];

export const ValidationErrorSchema = z
  .object({
    formErrors: z.string().array(),
    fieldErrors: z.record(z.string().array()),
  })
  .openapi('ValidationError');

export const validationErrorResponse = {
  content: {
    'application/json': {
      schema: ValidationErrorSchema,
    },
  },
  description: 'Bad request: validation error',
} as const satisfies ResponseItem;
