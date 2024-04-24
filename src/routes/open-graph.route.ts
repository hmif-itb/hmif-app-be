import { createRoute } from '@hono/zod-openapi';
import { OpenGraphScrapeRequestSchema } from '~/types/open-graph.types';

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
      description: 'Open Graph meta tags scraped',
    },
    400: {
      description: 'Invalid URL',
    },
  },
});
