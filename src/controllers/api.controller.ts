import { OpenAPIHono } from '@hono/zod-openapi';
import { helloRouter } from './hello.controller';
import { pushRouter } from './push.controller';
import { mediaRouter } from './media.controller';

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', helloRouter);
apiRouter.route('/', pushRouter);
apiRouter.route('/', mediaRouter);
