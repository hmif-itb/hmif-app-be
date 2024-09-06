import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '~/db/schema';

export const UserSchema = createSelectSchema(users, {
  createdAt: z.union([z.string(), z.date()]),
});

export const UserGroupSchema = z
  .object({
    role: z.string(),
    group: z.string(),
  })
  .openapi('UserGroup');

export const UserGroupsSchema = z.array(UserGroupSchema).openapi('UserGroups');
