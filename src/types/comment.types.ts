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

export const CommentIdQuerySchema = z.object({
  commentId: z.string().openapi({
    param: {
      in: 'path',
      description: 'Id of fetched comment',
      example: '1',
    },
  }),
});

export const CommentContentSchema = z.object({
  content: z.string().openapi({
    example: 'Keren nih info',
  }),
});

export const postCommentBody = z.object({
  infoId: z.string().openapi({
    example: 'uuid',
  }),
  content: z.string().openapi({
    example: 'my comment!',
  }),
});

export const deleteCommentParam = z.object({
  commentId: z.string().openapi({
    example: 'uuid',
  }),
});
