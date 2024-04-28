import { ExtractTablesWithRelations, InferInsertModel } from 'drizzle-orm';
import { PgTransaction } from 'drizzle-orm/pg-core';
import { PostgresJsQueryResultHKT } from 'drizzle-orm/postgres-js';
import { firstSure } from '~/db/helper';
import { infoMedias, medias } from '~/db/schema';

// EXAMPLE URL -> https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/r176r3qcuqs3hg8o3dm93n35-asrielblunt.jpg
export const createMediaFromUrlTransaction = async (
  tx: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import('d:/code/hmif-app-be/src/db/schema'),
    ExtractTablesWithRelations<
      typeof import('d:/code/hmif-app-be/src/db/schema')
    >
  >,
  url: string,
  creatorId: string | null,
) => {
  const file = url.split('/').at(-1); // asrielblunt.jpg
  if (!file) {
    throw Error('Invalid URL');
  }
  const [name, type] = file.split('.');

  return await tx
    .insert(medias)
    .values({
      creatorId,
      name,
      type,
      url,
    })
    .returning()
    .then(firstSure);
};

export const createInfoMediaTransaction = async (
  tx: PgTransaction<
    PostgresJsQueryResultHKT,
    typeof import('d:/code/hmif-app-be/src/db/schema'),
    ExtractTablesWithRelations<
      typeof import('d:/code/hmif-app-be/src/db/schema')
    >
  >,
  data: Omit<InferInsertModel<typeof infoMedias>, 'createdAt'>,
) => {
  return await tx.insert(infoMedias).values(data).returning().then(firstSure);
};
