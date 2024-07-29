import { createRoute, z } from '@hono/zod-openapi';
import {
  CompetitionSchema,
  CreateCompetitionSchema,
} from '~/types/competition.types';
import { ErrorSchema, ValidationErrorSchema } from '~/types/responses.type';

export const createCompetitionRoute = createRoute({
  operationId: 'createCompetition',
  tags: ['competition'],
  method: 'post',
  path: '/competition',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateCompetitionSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Created competition',
      content: {
        'application/json': {
          schema: CompetitionSchema,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: z.union([ValidationErrorSchema, ErrorSchema]),
        },
      },
    },
  },
});
