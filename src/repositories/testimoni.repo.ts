import { eq } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { testimonies } from '~/db/schema';

export async function getTestiByCourseId(db: Database, courseId: string) {
  return await db.query.testimonies.findMany({
    where: eq(testimonies.courseId, courseId),
  });
}
