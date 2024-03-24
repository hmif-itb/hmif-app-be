import { createRoute } from '@hono/zod-openapi';
import { ParamsSchema, UserSchema } from '../types/hello.types';

export const getUsersRoute = createRoute({
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
  tags: ['hello'],
});
