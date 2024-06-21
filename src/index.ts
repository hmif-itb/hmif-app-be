import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import * as Sentry from '@sentry/node';
import fs from 'fs';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { logger } from 'hono/logger';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './configs/env.config';
import { apiRouter } from './controllers/api.controller';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  fs.readFileSync(path.join(dirname, '../package.json'), 'utf-8'),
);
const app = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json({ errors: result.error.flatten() }, 400);
    }
  },
});

Sentry.init({
  dsn: env.SENTRY_DSN,
  environment: env.SENTRY_ENVIRONMENT,
});

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    // Get the custom response
    return err.getResponse();
  }

  Sentry.captureException(err);
  return c.json({ error: 'Something went wrong' }, 500);
});

app.use(logger());
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
    { name: 'hello', description: 'Hello API' },
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
    { name: 'user_profile', description: 'User Profile API' },
  ],
});
app.get('/swagger', swaggerUI({ url: '/doc' }));

console.log(`Server is running on port ${env.PORT}`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
