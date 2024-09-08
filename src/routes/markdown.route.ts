import { createRoute } from '@hono/zod-openapi';
import { MarkdownSchema } from '~/types/markdown.types';
import { errorResponse } from '~/types/responses.type';

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
    404: errorResponse,
  },
});
