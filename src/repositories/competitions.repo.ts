import { eq, and, sql, inArray, SQL} from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { first } from '~/db/helper';
import { competitions } from '~/db/schema';
import { CompetitionListQuerySchema } from '~/types/competitions.types';
import { z } from 'zod';

const COMPETITIONS_PER_PAGE = 10;

export async function getCompetitionsList(
  db: Database,
  q: z.infer<typeof CompetitionListQuerySchema>,
) {
    let categoryQ: SQL<unknown> | undefined;

    if(q.category){
        const getCompeitionsByCategory = db
        .select({ competitionsId: competitions.id })
        .from(competitions)
        .where(eq(competitions.type, q.category));
        categoryQ = inArray(competitions.id, getCompeitionsByCategory);
    }
  
  const activeQ = sql`${competitions.registrationDeadline} > now()`;

  const where = and(categoryQ, activeQ);
  let listCompetitions = await db.query.competitions.findMany({
    where,
    limit: COMPETITIONS_PER_PAGE,
    offset: q.offset,
  });

  listCompetitions = listCompetitions.sort((a, b) => {
    if (q.sort === 'deadline') {
      if (!a.registrationDeadline || !b.registrationDeadline) {
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else {
        return a.registrationDeadline.getTime() - b.registrationDeadline.getTime();
      }
    } else {
      return a.createdAt.getTime() - b.createdAt.getTime();
    }
  });

  return listCompetitions;
}


export async function deleteCompetition(db: Database, competitionId: string) {
    return await db
      .delete(competitions)
      .where(eq(competitions.id, competitionId))
      .returning()
      .then(first);
  }