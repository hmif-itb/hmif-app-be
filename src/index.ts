import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import fs from 'fs';
import { cors } from 'hono/cors';
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

app.use(logger());
app.use(
  '/api/*',
  cors({
    credentials: true,
    origin: env.ALLOWED_ORIGINS,
  }),
);
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
  ],
});
app.get('/swagger', swaggerUI({ url: '/doc' }));

console.log(`Server is running on port ${env.PORT}`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
