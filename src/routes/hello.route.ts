import { createRoute } from '@hono/zod-openapi';
import { ParamsSchema, UserSchema } from '../types/hello.types';

export const getUserRoute = createRoute({
  operationId: 'getUser',
  tags: ['hello'],
  method: 'get',
  path: '/users/{id}',
  request: {
    params: ParamsSchema,
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: UserSchema,
        },
      },
      description: 'Retrieve the user',
    },
  },
});
