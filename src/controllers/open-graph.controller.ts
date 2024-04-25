import og, { ErrorResult } from 'open-graph-scraper';
import { getOpenGraph } from '~/routes/open-graph.route';
import {
  OpenGraphErrorResultSchema,
  OpenGraphSuccessResultSchema,
} from '~/types/open-graph.types';
import { createRouter } from './router-factory';

export const openGraphScrapeRoute = createRouter();

openGraphScrapeRoute.openapi(getOpenGraph, async (c) => {
  const { url } = c.req.valid('query');

  const data = await og({ url })
    .then((data) => data)
    .catch((err: ErrorResult) => err);
  // cache for one day
  c.header('Cache-Control', `public, max-age=${60 * 60 * 24}`);
  if (data.error) {
    return c.json(OpenGraphErrorResultSchema.parse(data.result), 400);
  } else {
    return c.json(OpenGraphSuccessResultSchema.parse(data.result), 200);
  }
});
