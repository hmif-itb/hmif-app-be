import { z } from '@hono/zod-openapi';

export const CourseIdParamsSchema = z.object({
  courseId: z.string().openapi({
    param: {
      in: 'path',
      description: 'Id of info',
      example: 'uuid',
    },
  }),
});

export const TestimoniSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  courseId: z.string(),
  userName: z.string().nullable(),
  overview: z.string(),
  assignments: z.string(),
  lecturer: z.string(),
  createdAt: z.string(),
});

export const ListTestimoniSchema = z.array(TestimoniSchema);
