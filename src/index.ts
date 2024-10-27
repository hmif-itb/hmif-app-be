/* eslint-disable import/first */
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { performance } from 'perf_hooks';
import './instrument';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Jakarta');

import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';

import * as Sentry from '@sentry/node';
import fs from 'fs';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { requestId, RequestIdVariables } from 'hono/request-id';
import { getPath, getQueryStrings } from 'hono/utils/url';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './configs/env.config';
import { apiRouter } from './controllers/api.controller';
import { setupCron } from './cron/setup';
import { logger } from './logger';
import setupWebsocket from './websocket/setup';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  fs.readFileSync(path.join(dirname, '../package.json'), 'utf-8'),
);
const app = new OpenAPIHono<{
  Variables: RequestIdVariables;
}>({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ errors: result.error.flatten() }, 400);
    }
  },
});
app.use('*', requestId());

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    // Get the custom response
    return err.getResponse();
  }

  Sentry.captureException(err);
  return c.json({ error: 'Something went wrong' }, 500);
});

app.use(async (c, next) => {
  const { method } = c.req;
  const path = getPath(c.req.raw);
  const params = getQueryStrings(c.req.url);

  const start = performance.now();
  await next();
  const end = performance.now();
  logger.info({
    requestId: c.var.requestId,
    path,
    params,
    method,
    type: 'request',
    duration: end - start,
    userId: c.get('user' as any)?.id,
  });
});

app.use(
  '/api/*',
  cors({
    credentials: true,
    origin: env.ALLOWED_ORIGINS,
  }),
);
app.get('/', (c) => c.json({ message: 'Server runs successfully' }));
app.route('/api', apiRouter);
app.doc('/doc', {
  openapi: '3.1.0',
  info: {
    version: packageJson.version,
    title: packageJson.displayName,
  },
  tags: [
    { name: 'push', description: 'Push event API' },
    { name: 'auth', description: 'Auth API' },
    { name: 'media', description: 'Media API' },
    { name: 'info', description: 'Info API' },
    { name: 'course', description: 'Course API' },
    { name: 'comment', description: 'Comment API' },
    { name: 'reaction', description: 'Comment API' },
    { name: 'open-graph', description: 'Scrape Open Graph API' },
    { name: 'category', description: 'Category API' },
    { name: 'unsubscribe', description: 'Unsubscribe API' },
    { name: 'calendar', description: 'Calendar API' },
    { name: 'testimoni', description: 'Testimoni API' },
    { name: 'user-profile', description: 'User Profile API' },
    { name: 'user-finder', description: 'User Finder API' },
    { name: 'competitions', description: 'Competitions API' },
    { name: 'markdown', description: 'Markdown API' },
    { name: 'curhat', description: 'Curhat API' },
  ],
});
app.get('/swagger', swaggerUI({ url: '/doc' }));

console.log(`Server is running on port ${env.PORT}`);

setupCron();

const httpServer = serve({
  fetch: app.fetch,
  port: env.PORT,
});

setupWebsocket(httpServer);
