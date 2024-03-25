import { serve } from '@hono/node-server';
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import packageJson from '../package.json';
import { env } from './configs/env.config';
import { apiRouter } from './controllers/api.controller';

const app = new OpenAPIHono();

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
  tags: [{ name: 'hello', description: 'Hello API' }],
});
app.get('/swagger', swaggerUI({ url: '/doc' }));

console.log(`Server is running on port ${env.PORT}`);

serve({
  fetch: app.fetch,
  port: env.PORT,
});
