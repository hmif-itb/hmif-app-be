import { getOpenGraph } from '~/routes/open-graph.route';
import { createRouter } from './router-factory';
import og, { ErrorResult } from 'open-graph-scraper';
import {
  OpenGraphErrorResultSchema,
  OpenGraphSuccessResultSchema,
} from '~/types/open-graph.types';

export const openGraphScrapeRoute = createRouter();

openGraphScrapeRoute.openapi(getOpenGraph, async (c) => {
  const { url } = c.req.valid('query');

  const data = await og({ url })
    .then((data) => data)
    .catch((err: ErrorResult) => err);

  if (data.error) {
    return c.json(OpenGraphErrorResultSchema.parse(data.result), 400);
  } else {
    return c.json(OpenGraphSuccessResultSchema.parse(data.result), 200);
  }
});
