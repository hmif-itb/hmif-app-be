import { z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { comments } from '~/db/schema';

export const CommentSchema = createSelectSchema(comments, {
  createdAt: z.union([z.string(), z.date()]),
}).openapi('Comment');

export const CommentListSchema = z.object({
  comment: z.array(CommentSchema),
});

export const CommentListQuerySchema = z.object({
  infoId: z.string().openapi({
    param: {
      in: 'query',
      description: 'Id info of fetched comments',
      example: '1',
    },
  }),
  sort: z
    .enum(['popular', 'oldest', 'newest'])
    .optional()
    .default('newest')
    .openapi({
      param: {
        in: 'query',
        description: 'Sort info comments',
        example: 'newest',
      },
    }),
});
