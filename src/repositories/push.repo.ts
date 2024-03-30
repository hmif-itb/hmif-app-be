import { InferInsertModel, eq, inArray } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { firstSure } from '~/db/helper';
import { pushSubscriptions } from '~/db/schema';
import { sendNotificationToAll } from '~/lib/push-manager';

/**
 * Create a push subscription. If subscription endpoint exist, update the existing subscription.
 */
export async function createOrUpdatePushSubscription(
  db: Database,
  data: Omit<InferInsertModel<typeof pushSubscriptions>, 'createdAt'>,
) {
  return await db
    .insert(pushSubscriptions)
    .values(data)
    .onConflictDoUpdate({
      set: data,
      target: [pushSubscriptions.endpoint],
    })
    .returning()
    .then(firstSure);
}

export async function getPushSubscriptionsByUser(db: Database, userId: string) {
  return await db.query.pushSubscriptions.findMany({
    where: eq(pushSubscriptions.userId, userId),
  });
}

/**
 * Remove push subscriptions that failed to send notification with response status code of 410.
 * @param db
 * @param results results from sendNotificationToAll
 * @returns
 */
export async function removeFailedPushSubscriptions(
  db: Database,
  results: Awaited<ReturnType<typeof sendNotificationToAll>>,
) {
  const failedSubscriptions: string[] = [];
  for (const result of results) {
    if (!result.success && result.error.statusCode === 410) {
      failedSubscriptions.push(result.endpoint);
    }
  }

  if (failedSubscriptions.length === 0) {
    return;
  }

  await db
    .delete(pushSubscriptions)
    .where(inArray(pushSubscriptions.endpoint, failedSubscriptions));
}

export async function getAllPushSubscriptions(db: Database) {
  return await db.query.pushSubscriptions.findMany();
}
