import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '~/db/schema';

export const UserSchema = createSelectSchema(users, {
  createdAt: z.union([z.string(), z.date()]),
});
