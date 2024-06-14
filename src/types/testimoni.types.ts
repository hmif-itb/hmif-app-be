import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { testimonies } from '~/db/schema';

export const CourseIdParamsSchema = z.object({
  courseId: z.string().openapi({
    param: {
      in: 'path',
      description: 'Id of info',
      example: 'uuid',
    },
  }),
});

export const TestimoniSchema = createSelectSchema(testimonies, {
  createdAt: z.union([z.string(), z.date()]),
}).openapi('Testimoni');

export const ListTestimoniSchema = z.array(TestimoniSchema);

export const PostTestimoniBodySchema = createInsertSchema(testimonies).omit({
  id: true,
  userId: true,
  createdAt: true,
});
