import { z } from 'zod';
import { UserSchema } from './user.types';

export const ListUserSchema = z.array(UserSchema);

export const NimFinderQuerySchema = z.object({
  search: z.string().min(3),
});
