import { createRoute } from '@hono/zod-openapi';
import { ListInfoParamsSchema, ListInfoSchema } from '~/types/info.types';
import { errorResponse, validationErrorResponse } from '~/types/responses.type';

export const listInfoRoute = createRoute({
  operationId: 'loginRoute',
  tags: ['login'],
  method: 'get',
  path: '/get-infos',
  request: {
    query: ListInfoParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ListInfoSchema,
        },
      },
      description: 'Get list of infos based on filter',
    },
    400: errorResponse,
  },
});
