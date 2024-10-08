import { eq, inArray, InferInsertModel, isNotNull } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { first, firstSure } from '~/db/helper';
import { PushSubscription, pushSubscriptions } from '~/db/schema';
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

export async function getPushSubscriptionsByUserIds(
  db: Database,
  userIds: string[],
) {
  if (userIds.length === 0) {
    return [];
  }

  return await db.query.pushSubscriptions.findMany({
    where: inArray(pushSubscriptions.userId, userIds),
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
    if (
      result.status === 'fulfilled' &&
      !result.value.success &&
      result.value.error.statusCode === 410
    ) {
      failedSubscriptions.push(result.value.endpoint);
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
  return await db.query.pushSubscriptions.findMany({
    where: isNotNull(pushSubscriptions.userId),
  });
}

export function toPushSubscriptionsHash(subscriptions: PushSubscription[]) {
  const result: Record<string, PushSubscription[]> = {};

  subscriptions.forEach((subscription) => {
    if (subscription.userId) {
      const array = result[subscription.userId] ?? [];

      array.push(subscription);

      result[subscription.userId] = array;
    }
  });

  return result;
}

export async function putLogoutPushSubscriptions(
  db: Database,
  data: { endpoint: string },
) {
  return await db
    .update(pushSubscriptions)
    .set({
      userId: null,
    })
    .where(eq(pushSubscriptions.endpoint, data.endpoint))
    .returning()
    .then(first);
}
