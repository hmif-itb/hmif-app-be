import { createRoute, z } from '@hono/zod-openapi';
import {
  CompetitionCategoriesSchema,
  CompetitionListQuerySchema,
  CompetitionSchema,
  CompetitionsIdParamSchema,
  CompetitionsSchema,
  CreateCompetitionSchema,
  ListCompetitionsSchema,
  UpdateCompetitionBodySchema,
  UpdateCompetitionParamsSchema,
} from '~/types/competitions.types';
import {
  ErrorSchema,
  validationErrorResponse,
  ValidationErrorSchema,
} from '~/types/responses.type';

export const getCompetitionCategoriesRoute = createRoute({
  operationId: 'getCompetitionCategories',
  tags: ['competitions'],
  method: 'get',
  path: '/competitions/categories',
  responses: {
    200: {
      description: 'Fetched competition categories',
      content: {
        'application/json': {
          schema: CompetitionCategoriesSchema,
        },
      },
    },
  },
});

export const createCompetitionRoute = createRoute({
  operationId: 'createCompetition',
  tags: ['competitions'],
  method: 'post',
  path: '/competitions',
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

export const updateCompetitionRoute = createRoute({
  operationId: 'updateCompetition',
  tags: ['competitions'],
  method: 'put',
  path: '/competitions/{id}',
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateCompetitionBodySchema,
        },
      },
    },
    params: UpdateCompetitionParamsSchema,
  },
  responses: {
    200: {
      description: 'Updated competition',
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
    404: {
      description: 'Competition not found',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const getCompetitionListRoute = createRoute({
  operationId: 'getCompetitionList',
  tags: ['competitions'],
  method: 'get',
  path: '/competitions',
  request: {
    query: CompetitionListQuerySchema,
  },
  responses: {
    200: {
      description: 'Fetched list of competitions',
      content: {
        'application/json': {
          schema: ListCompetitionsSchema,
        },
      },
    },
    400: validationErrorResponse,
  },
});

export const deleteCompetitionRoute = createRoute({
  operationId: 'deleteCompetition',
  tags: ['competitions'],
  method: 'delete',
  path: '/competitions/{competitionId}',
  request: {
    params: CompetitionsIdParamSchema,
  },
  responses: {
    200: {
      description: 'Successfully deleted comment',
      content: {
        'application/json': {
          schema: CompetitionsSchema,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: 'Internal server error',
      content: {
        'application/json': {
          schema: ErrorSchema,
        },
      },
    },
  },
});
