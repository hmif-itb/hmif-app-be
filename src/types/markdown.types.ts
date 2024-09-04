import { createSelectSchema } from 'drizzle-zod';
import { markdowns } from '~/db/schema';

export const MarkdownSchema = createSelectSchema(markdowns).openapi('Markdown');
