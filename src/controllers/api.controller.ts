import { OpenAPIHono } from '@hono/zod-openapi';
import { loginProtectedRouter, loginRouter } from './auth.controller';
import { infoRouter } from './info.controller';
import { mediaRouter } from './media.controller';
import { openGraphScrapeRoute } from './open-graph.controller';
import { pushRouter } from './push.controller';

const unprotectedApiRouter = new OpenAPIHono();
unprotectedApiRouter.route('/', loginRouter);
unprotectedApiRouter.route('/', openGraphScrapeRoute);

const protectedApiRouter = new OpenAPIHono();
protectedApiRouter.route('/', pushRouter);
protectedApiRouter.route('/', infoRouter);
protectedApiRouter.route('/', mediaRouter);
protectedApiRouter.route('/', loginProtectedRouter);

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', unprotectedApiRouter);
apiRouter.route('/', protectedApiRouter);
