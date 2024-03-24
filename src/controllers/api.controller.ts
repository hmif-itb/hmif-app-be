import { OpenAPIHono } from '@hono/zod-openapi';
import { helloRouter } from './hello.controller';

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', helloRouter);
