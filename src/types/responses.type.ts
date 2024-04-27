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

export const AuthorizationErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi('AuthorizationError');

export const authorizaitonErrorResponse = {
  content: {
    'application/json': {
      schema: AuthorizationErrorSchema,
    },
  },
  description: 'Bad request: authorization (not logged in) error',
} as const satisfies ResponseItem;

export const ErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi('Error');

export const errorResponse = {
  content: {
    'application/json': {
      schema: ErrorSchema,
    },
  },
  description: 'Bad request',
} as const satisfies ResponseItem;
