import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { courses } from '~/db/schema';

export const CourseSchema = createSelectSchema(courses);
export const ListCourseSchema = z.object({
  courses: z.array(CourseSchema),
});

export const ListCourseParamsSchema = z.object({
  search: z.string().optional().openapi({
    example: 'content',
  }),
  curriculumYear: z.string().optional().openapi({
    example: '2019',
  }),
  major: z.enum(['IF', 'STI']).optional().openapi({
    example: 'STI',
  }),
  semester: z.string().optional().openapi({
    example: '6',
  }),
});

export const CourseIdRequestBodySchema = z.object({
  courseId: z.string(),
});
