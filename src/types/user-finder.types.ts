import { z } from 'zod';
import { JWTPayloadSchema } from './login.types';

export const ListUserSchema = z.array(JWTPayloadSchema);

export const NimFinderQuerySchema = z.object({
  search: z.string().min(3),
});
