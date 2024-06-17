import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { testimonies } from '~/db/schema';
import { PostTestimoniBodySchema } from '~/types/testimoni.types';

export async function createTestimoni(
  db: Database,
  data: z.infer<typeof PostTestimoniBodySchema>,
  userId: string,
) {
  return await db
    .insert(testimonies)
    .values({
      ...data,
      userId,
    })
    .returning()
    .then(firstSure);
}

export async function getTestimoniByCourseId(db: Database, courseId: string) {
  return await db.query.testimonies.findMany({
    where: eq(testimonies.courseId, courseId),
  });
}
