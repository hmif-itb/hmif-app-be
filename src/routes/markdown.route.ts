import { createRoute } from '@hono/zod-openapi';
import { MarkdownSchema } from '~/types/markdown.types';

export const creditsMarkdownRoute = createRoute({
  operationId: 'getCredits',
  tags: ['markdown'],
  method: 'get',
  path: '/markdown/credits',
  responses: {
    200: {
      description: 'Credits markdown',
      content: {
        'application/json': {
          schema: MarkdownSchema,
        },
      },
    },
    404: {
      description: 'Not found',
    },
  },
});
