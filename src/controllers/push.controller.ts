import { db } from '~/db/drizzle';
import { sendNotificationToAll } from '~/lib/push-manager';
import webpush from 'web-push';
import {
  createOrUpdatePushSubscription,
  getAllPushSubscriptions,
  removeFailedPushSubscriptions,
} from '~/repositories/push.repo';
import { pushBroadcastRoute, registerPushRoute } from '~/routes/push.route';
import { createAuthRouter } from './router-factory';

export const pushRouter = createAuthRouter();

pushRouter.openapi(registerPushRoute, async (c) => {
  await createOrUpdatePushSubscription(db, {
    ...c.req.valid('json'),
    userId: c.var.user.id,
  });

  return c.json({}, 201);
});

pushRouter.openapi(pushBroadcastRoute, async (c) => {
  const subscriptions = await getAllPushSubscriptions(db);
  void sendNotificationToAll(
    subscriptions.filter((s) => s.keys !== null) as webpush.PushSubscription[],
    c.req.valid('json'),
  ).then(async (results) => {
    await removeFailedPushSubscriptions(db, results);
  });

  return c.json({}, 200);
});
