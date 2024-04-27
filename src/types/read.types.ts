import { z } from '@hono/zod-openapi';

export const CreateReadRequestBodySchema = z.object({
  infoId: z.string(),
});
