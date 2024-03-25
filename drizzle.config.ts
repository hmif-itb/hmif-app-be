import 'dotenv/config';
import type { Config } from 'drizzle-kit';
export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
