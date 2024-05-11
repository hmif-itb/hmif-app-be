import { OpenAPIHono } from '@hono/zod-openapi';
import { loginProtectedRouter, loginRouter } from './auth.controller';
import { infoRouter } from './info.controller';
import { mediaRouter } from './media.controller';
import { openGraphScrapeRoute } from './open-graph.controller';
import { pushRouter } from './push.controller';
import { commentRouter } from './comment.controller';

const unprotectedApiRouter = new OpenAPIHono();
unprotectedApiRouter.route('/', loginRouter);
unprotectedApiRouter.route('/', openGraphScrapeRoute);
unprotectedApiRouter.route('/', infoRouter);

const protectedApiRouter = new OpenAPIHono();
protectedApiRouter.route('/', pushRouter);
protectedApiRouter.route('/', mediaRouter);
protectedApiRouter.route('/', loginProtectedRouter);
protectedApiRouter.route('/', commentRouter);

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', unprotectedApiRouter);
apiRouter.route('/', protectedApiRouter);
