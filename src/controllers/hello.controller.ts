import { OpenAPIHono } from '@hono/zod-openapi';
import { getUsersRoute } from '../routes/hello.route';

export const helloRouter = new OpenAPIHono();

helloRouter.openapi(getUsersRoute, (c) => {
  const { id } = c.req.valid('param');
  return c.json({
    id,
    age: 20,
    name: 'Ultra-man',
  });
});
