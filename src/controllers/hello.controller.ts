import { OpenAPIHono } from '@hono/zod-openapi';
import { getUserRoute } from '../routes/hello.route';

export const helloRouter = new OpenAPIHono();

helloRouter.openapi(getUserRoute, (c) => {
  const { id } = c.req.valid('param');
  return c.json({
    id,
    age: 20,
    name: 'Ultra-man',
  });
});
