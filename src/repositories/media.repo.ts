import { InferInsertModel } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { infoMedias, medias } from '~/db/schema';

// EXAMPLE URL -> https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/r176r3qcuqs3hg8o3dm93n35-asrielblunt.jpg
export const createMediasFromUrl = async (
  db: Database,
  urls: string[],
  creatorId: string | null,
) => {
  return await db
    .insert(medias)
    .values(
      urls.map((url) => {
        const file = url.split('/').at(-1); // asrielblunt.jpg
        if (!file) {
          throw Error('Invalid URL');
        }
        const [name, type] = file.split('.');
        return {
          creatorId,
          name,
          type,
          url,
        };
      }),
    )
    .returning();
};

export const createInfoMedia = async (
  db: Database,
  data: Array<Omit<InferInsertModel<typeof infoMedias>, 'createdAt'>>,
) => {
  return await db.insert(infoMedias).values(data).returning().then(firstSure);
};
