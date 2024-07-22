import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { comments } from '~/db/schema';
import { JWTPayloadSchema } from './login.types';
import { ReactionResponseSchema } from './reaction.types';

export const CommentSchema = createSelectSchema(comments, {
  createdAt: z.union([z.string(), z.date()]),
})
  .extend({ creator: JWTPayloadSchema })
  .openapi('Comment');

export const CommentListSchema = z.object({
  comment: z.array(
    CommentSchema.extend({ reactions: ReactionResponseSchema }).openapi(
      'CommentWithReactions',
    ),
  ),
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
    .enum(['oldest', 'newest'])
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

export const CommentIdParamSchema = z.object({
  commentId: z.string().openapi({
    param: {
      in: 'path',
      description: 'Id of fetched comment',
      example: '1',
    },
  }),
});

export const CommentUpdateBodySchema = createInsertSchema(comments)
  .pick({
    content: true,
  })
  .default({
    content: 'Keren nih info',
  });

export const CommentPostBodySchema = createInsertSchema(comments)
  .omit({
    id: true,
    createdAt: true,
    creatorId: true,
  })
  .default({
    content: 'Halo! Saya ingin komen, kerja bagus!',
    repliedInfoId: 'b5kg9vo1xzyutser1zhbi8le',
  });

// export const CommentUpdateBodySchema = z.object({
//   content: z.string().openapi({
//     example: 'Keren nih info',
//   }),
// });

// export const CommentPostBodySchema = z.object({
//   infoId: z.string().openapi({
//     example: 'uuid',
//   }),
//   content: z.string().openapi({
//     example: 'my comment!',
//   }),
// });
