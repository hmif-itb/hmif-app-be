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
    'text/plain': {
      schema: {
        example: 'Unauthorized',
      },
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
  description: 'Error',
} as const satisfies ResponseItem;

export const ServerErrorSchema = z
  .object({
    error: z.string(),
  })
  .openapi('Internal Server Error');

export const serverErrorResponse = {
  content: {
    'application/json': {
      schema: ServerErrorSchema,
    },
  },
  description: 'Something went wrong!',
} as const satisfies ResponseItem;
