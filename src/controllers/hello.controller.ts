import { getUserRoute } from '../routes/hello.route';
import { createRouter } from './router-factory';

export const helloRouter = createRouter();

helloRouter.openapi(getUserRoute, (c) => {
  const { id } = c.req.valid('param');
  return c.json({
    id,
    age: 20,
    name: 'Ultra-man',
  });
});
