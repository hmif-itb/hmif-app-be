import { OpenAPIHono } from '@hono/zod-openapi';
import { helloRouter } from './hello.controller';
import { pushRouter } from './push.controller';
import { loginRouter } from './auth.controller';
import { mediaRouter } from './media.controller';
import { openGraphScrapeRoute } from './open-graph.controller';
import { infoRouter } from './info.controller';

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', helloRouter);
apiRouter.route('/', pushRouter);
apiRouter.route('/', loginRouter);
apiRouter.route('/', mediaRouter);
apiRouter.route('/', openGraphScrapeRoute);
apiRouter.route('/', infoRouter);
