import { getOpenGraph } from '~/routes/open-graph.route';
import { createRouter } from './router-factory';
import og, { ErrorResult } from 'open-graph-scraper';

export const openGraphScrapeRoute = createRouter();

openGraphScrapeRoute.openapi(getOpenGraph, async (c) => {
  const { url } = c.req.valid('query');

  const result = await og({ url })
    .then((data) => data.result)
    .catch((err: ErrorResult) => err.result);

  return c.json(result, 200);
});
