import { Database } from '~/db/drizzle';
import { medias } from '~/db/schema';

// EXAMPLE URL -> https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/r176r3qcuqs3hg8o3dm93n35-asrielblunt.jpg
export const createMediasFromUrl = async (
  db: Database,
  urls: string[],
  creatorId: string,
) => {
  const timestamp = Date.now(); // Get current timestamp as seed

  return await db
    .insert(medias)
    .values(
      urls.map((url, index) => {
        const file = url.split('/').at(-1); // asrielblunt.jpg
        if (!file) {
          throw Error('Invalid URL');
        }
        const [name, type] = file.split('.');
        // Add timestamp and index to make name unique: timestamp_index_name
        const uniqueName = `${timestamp}_${index}_${name}`;
        return {
          creatorId,
          name: uniqueName,
          type,
          url,
        };
      }),
    )
    .returning();
};
