import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { markdowns } from '~/db/schema';

export const CREDITS_MARKDOWN_ID = 'credits';

export function getMarkdownById(db: Database, id: string) {
  return db.query.markdowns.findFirst({
    where: eq(markdowns.id, id),
  });
}
