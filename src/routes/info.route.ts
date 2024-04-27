import { createRoute } from '@hono/zod-openapi';
import { ListInfoParamsSchema } from '~/types/info.types';

export const listInfoRoute = createRoute({
  operationId: 'loginRoute',
  tags: ['login'],
  method: 'get',
  path: '/get-infos/{search}/{category}',
  request: {
    params: ListInfoParamsSchema
  } ,
  responses: {
    200: {
      content: {
        'application/json': {
          schema: {},
        },
      },
      description: 'Get list of infos based on filter',
    },
  },
});
