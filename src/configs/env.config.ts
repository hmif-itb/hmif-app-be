import { z } from '@hono/zod-openapi';
import 'dotenv/config';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('production'),
  ENABLE_TEST_LOGIN: z
    .enum(['true', 'false'])
    .default('false')
    .transform((value) => value === 'true'),
  DEV_LOGIN_EMAIL: z.string().email().optional(),
  DEV_LOGIN_PASSWORD_HASH: z.string().optional(),
  PORT: z.coerce.number().default(5000),
  // Interface to listen on. Unset listens on all interfaces (containers need that); the shared staging host sets 127.0.0.1.
  LISTEN_HOST: z.string().min(1).optional(),
  DATABASE_URL: z.string().url(),
  ALLOWED_ORIGINS: z
    .string()
    .default('["http://localhost:5173"]')
    .transform((value) => JSON.parse(value))
    .pipe(z.array(z.string().url())),
  VAPID_PUBLIC_KEY: z.string().default('not-specified'),
  VAPID_PRIVATE_KEY: z.string().default('not-specified'),
  VAPID_MAILTO: z.string().email().optional(),
  SMTP_HOST: z.string(),
  SMTP_USER: z.string().email().optional(),
  SMTP_PORT: z.coerce.number(),
  SMTP_SECURE: z.coerce.boolean().default(true),
  SMTP_PASS: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url(),
  JWT_SECRET: z.string(),
  TOKEN_EXPIRATION: z.string(),
  R2_ENDPOINT: z.string().url().default('not-specified'),
  R2_ACCESS_KEY_ID: z.string().default('not-specified'),
  R2_SECRET_ACCESS_KEY: z.string().default('not-specified'),
  R2_PUBLIC_URL: z.string().url().default('not-specified'),
  R2_BUCKET_NAME: z.string().default('hmifapp'),
  LOGIN_BYPASS_KEY: z.string().default('default-bypass-key'),
  GOOGLE_CALENDAR_SECRET_PATH: z.string().default('google_credentials.json'),
  GOOGLE_CALENDAR_ID: z.string().default('primary'),
  SENTRY_DSN: z.string().url().optional(),
  AXIOM_DATASET: z.string().optional(),
  AXIOM_TOKEN: z.string().optional(),
  RENOTIFY_DIFF_HOURS: z.coerce.number().optional(),
});

const result = EnvSchema.safeParse(process.env);
if (!result.success) {
  console.error('Invalid environment variables: ');
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
