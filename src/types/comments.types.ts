import { z } from '@hono/zod-openapi';

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
        example: "uuid"
    })
})