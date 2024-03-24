import { z } from '@hono/zod-openapi';
import 'dotenv/config';

const EnvSchema = z.object({
  PORT: z.coerce.number().default(5000),
});

const result = EnvSchema.safeParse(process.env);
if (!result.success) {
  console.error('Invalid environment variables: ');
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = result.data;
