import { z } from '@hono/zod-openapi';

export const OpenGraphScrapeRequestSchema = z.object({
  url: z
    .string()
    .url()
    .openapi({
      param: {
        name: 'url',
        in: 'query',
      },
      example: 'https://www.npmjs.com/package/open-graph-scraper*',
    }),
});
