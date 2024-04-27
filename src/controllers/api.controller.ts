import { OpenAPIHono } from '@hono/zod-openapi';
import { helloRouter } from './hello.controller';
import { pushRouter } from './push.controller';
import { loginProtectedRouter, loginRouter } from './auth.controller';
import { mediaRouter } from './media.controller';
import { openGraphScrapeRoute } from './open-graph.controller';

const unprotectedApiRouter = new OpenAPIHono();
unprotectedApiRouter.route('/', loginRouter);
unprotectedApiRouter.route('/', openGraphScrapeRoute);

const protectedApiRouter = new OpenAPIHono();
protectedApiRouter.route('/', helloRouter);
protectedApiRouter.route('/', pushRouter);
protectedApiRouter.route('/', mediaRouter);
protectedApiRouter.route('/', loginProtectedRouter);

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', unprotectedApiRouter);
apiRouter.route('/', protectedApiRouter);
