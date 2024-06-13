import { OpenAPIHono } from '@hono/zod-openapi';
import { loginProtectedRouter, loginRouter } from './auth.controller';
import { categoryRouter } from './category.controller';
import { commentRouter } from './comment.controller';
import { courseRouter } from './course.controller';
import { infoRouter } from './info.controller';
import { mediaRouter } from './media.controller';
import { openGraphScrapeRoute } from './open-graph.controller';
import { pushPubRouter, pushRouter } from './push.controller';
import { reactionRouter } from './reaction.controller';
import { userUnsubscribeRouter } from './user-unsubscribe.controller';
import { calendarRouter } from './calendar.controller';

const unprotectedApiRouter = new OpenAPIHono();
unprotectedApiRouter.route('/', loginRouter);
unprotectedApiRouter.route('/', openGraphScrapeRoute);
unprotectedApiRouter.route('/', pushPubRouter);

const protectedApiRouter = new OpenAPIHono();
protectedApiRouter.route('/', pushRouter);
protectedApiRouter.route('/', mediaRouter);
protectedApiRouter.route('/', loginProtectedRouter);
protectedApiRouter.route('/', commentRouter);
protectedApiRouter.route('/', courseRouter);
protectedApiRouter.route('/', reactionRouter);
protectedApiRouter.route('/', userUnsubscribeRouter);
protectedApiRouter.route('/', categoryRouter);
protectedApiRouter.route('/', infoRouter);
protectedApiRouter.route('/', calendarRouter);

export const apiRouter = new OpenAPIHono();
apiRouter.route('/', unprotectedApiRouter);
apiRouter.route('/', protectedApiRouter);
