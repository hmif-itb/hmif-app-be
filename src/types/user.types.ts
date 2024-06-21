import { createSelectSchema } from 'drizzle-zod';
import { users } from '~/db/schema';
import { z } from 'zod';

export const UserSchema = createSelectSchema(users);
