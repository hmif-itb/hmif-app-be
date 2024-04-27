import { InferInsertModel } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { userReadInfos } from '~/db/schema';
import { firstSure } from '~/db/helper';

export async function createReadInfo(
  db: Database,
  data: Omit<InferInsertModel<typeof userReadInfos>, 'createdAt'>,
) {
  return await db
    .insert(userReadInfos)
    .values(data)
    .returning()
    .then(firstSure);
}
