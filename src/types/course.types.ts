import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { courses, userCourses } from '~/db/schema';

// Course Schemas

export const CourseSchema = createSelectSchema(courses).openapi('Course');

export const CreateCourseSchema = createInsertSchema(courses).omit({
  id: true,
  semesterCode: true,
});

export const UpdateCourseSchema = CreateCourseSchema.partial();

export const SingleCourseSchema = z.object({
  course: CourseSchema,
});

export const ListCourseSchema = z.object({
  courses: z.array(CourseSchema),
});

export const ListCourseParamsSchema = z.object({
  curriculumYear: z.coerce.number().int().optional().openapi({
    example: 2019,
  }),
  major: z.enum(['IF', 'STI', 'OTHER']).optional().openapi({
    example: 'STI',
  }),
  semester: z.coerce.number().int().optional().openapi({
    description: 'Put 0 for courses that can be taken on any semester',
    example: 6,
  }),
  type: z.enum(['Mandatory', 'Elective']).optional().openapi({
    example: 'Elective',
  }),
  credits: z.coerce.number().int().optional().openapi({
    example: 3,
  }),
  search: z.string().optional().openapi({
    example: 'statistik',
  }),
});

export const CourseIdRequestBodySchema = z.object({
  courseId: z.string(),
});

// User Course Schemas

export const UserCourseSchema = createSelectSchema(userCourses)
  .extend({
    course: CourseSchema.optional(),
  })
  .openapi('UserCourse');

export const ListUserCourseSchema = z.array(UserCourseSchema);

export const CreateUserCourseSchema = createInsertSchema(userCourses).omit({
  semesterCodeTaken: true,
  semesterYearTaken: true,
  userId: true,
});

export const DeleteUserCourseSchema = z.object({
  courseIds: z.union([z.array(z.string()), z.string()]),
});

export const BatchCreateOrUpdateUserCourseSchema = z.array(
  CreateUserCourseSchema,
);

export const BatchCreateOrUpdateUserCourseResponseSchema =
  z.array(UserCourseSchema);
