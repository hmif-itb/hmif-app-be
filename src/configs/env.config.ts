import { z } from '@hono/zod-openapi';
import 'dotenv/config';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url(),
  ALLOWED_ORIGINS: z
    .string()
    .default('["http://localhost:5173"]')
    .transform((value) => JSON.parse(value))
    .pipe(z.array(z.string().url())),
  VAPID_PUBLIC_KEY: z.string().default('not-specified'),
  VAPID_PRIVATE_KEY: z.string().default('not-specified'),
  VAPID_MAILTO: z.string().email().optional(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string().url(),
  JWT_SECRET: z.string(),
  R2_ENDPOINT: z.string().url().default('not-specified'),
  R2_ACCESS_KEY_ID: z.string().default('not-specified'),
  R2_SECRET_ACCESS_KEY: z.string().default('not-specified'),
  R2_PUBLIC_URL: z.string().url().default('not-specified'),
  R2_BUCKET_NAME: z.string().default('hmifapp'),
});

const result = EnvSchema.safeParse(process.env);
if (!result.success) {
  console.error('Invalid environment variables: ');
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
