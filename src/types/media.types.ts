import { z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { medias } from '~/db/schema';

export const MediaSchema = createSelectSchema(medias, {
  createdAt: z.union([z.string(), z.date()]),
});

export const BodyParamsSchema = z.object({
  fileName: z.string().openapi({
    example: 'cat',
  }),
  fileType: z.string().openapi({
    example: 'png',
  }),
});

export const PresignedUrlSchema = z
  .object({
    presignedUrl: z.string().url().openapi({
      example:
        'https://hmifapp.bd9227a5d777d92702afe30b40d949de.r2.cloudflarestorage.com/vaq4xnvslx843js93ywc43ns-cat.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=317c582bbdd1724f0540cf9731695bd2%2F20240426%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20240426T103101Z&X-Amz-Expires=3600&X-Amz-Signature=97abae0cc436a744cded0784c9b71380f28400cbe04f72b567109a769cd00b0c&X-Amz-SignedHeaders=host&x-id=PutObject',
    }),
    mediaUrl: z.string().url().openapi({
      example:
        'https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/vaq4xnvslx843js93ywc43ns-cat.png',
    }),
    expiresIn: z.number().openapi({
      example: 3600,
    }),
  })
  .openapi('PresignedURL');
