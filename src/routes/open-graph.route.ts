import { createRoute, z } from '@hono/zod-openapi';
import {
  OpenGraphErrorSchema,
  OpenGraphScrapeRequestSchema,
  OgObjectSchema,
} from '~/types/open-graph.types';
import { ValidationErrorSchema } from '~/types/responses.type';

export const getOpenGraph = createRoute({
  operationId: 'openGraphScrape',
  tags: ['open-graph'],
  method: 'get',
  path: '/open-graph',
  description: 'Scrape Open Graph meta tags from a URL',
  request: {
    query: OpenGraphScrapeRequestSchema,
  },
  responses: {
    200: {
      description: 'Scrape successful',
      content: {
        'application/json': {
          schema: OgObjectSchema,
        },
      },
    },
    400: {
      description: 'Invalid URL',
      content: {
        'application/json': {
          schema: z.union([OpenGraphErrorSchema, ValidationErrorSchema]),
        },
      },
    },
  },
});
