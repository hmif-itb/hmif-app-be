import { OpenAPIHono } from '@hono/zod-openapi';
import { helloRouter } from './hello.controller';
import { pushRouter } from './push.controller';
import { openGraphScrapeRoute } from './open-graph.controller';
import { createInfoRouter } from './info.controller';

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', helloRouter);
apiRouter.route('/', pushRouter);
apiRouter.route('/', openGraphScrapeRoute);
apiRouter.route('/', createInfoRouter);
