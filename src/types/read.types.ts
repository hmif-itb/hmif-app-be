import { z } from '@hono/zod-openapi';

export const ReadSchema = z
  .object({
    userId: z.string().nullable(),
    infoId: z.string().nullable(),
  })
  .openapi('Read');
