import { and, asc, desc, eq, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { properti } from '~/db/schema';
import { GetPropertiParamsSchema, UpdatePropertiBodySchema } from '~/types/properti.types';

// Define the location enum type
type LocationEnum = 'Sekretariat 1' | 'Sekretariat 2' | 'Jatinangor';

// Helper function to cast location to the proper enum type
function castPropertiLocation<T extends { location: string }>(data: T) {
  return {
    ...data,
    location: data.location as LocationEnum,
  };
}

export async function getPropertiList(
  db: Database,
  q: z.infer<typeof GetPropertiParamsSchema>,
) {
  const { search, category, condition, sortBy } = q;
  const [sortKey, sortOrder] = sortBy.split('_') as ['name', 'asc' | 'desc'];

  const results = await db
    .select()
    .from(properti)
    .where(
      and(
        search ? ilike(properti.name, `%${search}%`) : undefined,
        category ? eq(properti.category, category) : undefined,
        condition ? eq(properti.condition, condition) : undefined,
      ),
    )
    .orderBy(sortOrder === 'asc' ? asc(properti[sortKey]) : desc(properti[sortKey]));

  return results.map(castPropertiLocation);
}

export async function getPropertiById(db: Database, id: string) {
  const result = await db.query.properti.findFirst({
    where: eq(properti.id, id),
  });

  if (!result) return null;

  return {
    ...castPropertiLocation(result),
    status: result.status ?? 'available',
  };
}


export async function createProperti(
  db: Database,
  data: typeof properti.$inferInsert,
) {
  const result = await db.insert(properti).values(data).returning().then(firstSure);

  return castPropertiLocation({
    ...result,
    status: result.status ?? "available",
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  });
}

export async function updateProperti(
  db: Database,
  id: string,
  data: z.infer<typeof UpdatePropertiBodySchema>,
) {
  const result = await db
    .update(properti)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(properti.id, id))
    .returning()
    .then(firstSure);

  return castPropertiLocation({
    ...result,
    status: result.status ?? "available",
    createdAt: result.createdAt.toISOString(),
    updatedAt: result.updatedAt.toISOString(),
  });
}


export async function deleteProperti(db: Database, id: string) {
  const result = await db.delete(properti).where(eq(properti.id, id)).returning().then(first);
  return result ? castPropertiLocation(result) : result;
}