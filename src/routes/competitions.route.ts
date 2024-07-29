import { createRoute } from '@hono/zod-openapi';
import {
    CompetitionListQuerySchema,
    CompetitionsIdParamSchema,
    CompetitionsSchema,
    ListCompetitionsSchema
} from '~/types/competitions.types';
import {
  ErrorSchema,
  validationErrorResponse
} from '~/types/responses.type';

export const getCompetitionListRoute = createRoute({
    operationId: 'getCompetitionList',
    tags: ['competitions'],
    method: 'get',
    path: '/competition',
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
    path: '/competition/{competitionId}',
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