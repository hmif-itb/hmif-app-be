import { createRoute } from '@hono/zod-openapi';
import { ListInfoParamsSchema, ListInfoSchema } from '~/types/info.types';

export const listInfoRoute = createRoute({
  operationId: 'loginRoute',
  tags: ['login'],
  method: 'get',
  path: '/get-infos',
  request: {
    params: ListInfoParamsSchema,
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
  },
});
