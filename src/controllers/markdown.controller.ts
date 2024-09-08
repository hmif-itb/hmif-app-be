import { db } from '~/db/drizzle';
import {
  CREDITS_MARKDOWN_ID,
  getMarkdownById,
} from '~/repositories/markdown.repo.';
import { creditsMarkdownRoute } from '~/routes/markdown.route';
import { createAuthRouter } from './router-factory';

export const markdownRouter = createAuthRouter();

markdownRouter.openapi(creditsMarkdownRoute, async (c) => {
  const markdown = await getMarkdownById(db, CREDITS_MARKDOWN_ID);
  if (!markdown) {
    return c.json({ error: 'Markdown not found' }, 404);
  }
  return c.json(markdown, 200);
});
