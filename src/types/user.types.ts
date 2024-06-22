import { createSelectSchema } from 'drizzle-zod';
import { users } from '~/db/schema';

export const UserSchema = createSelectSchema(users);
