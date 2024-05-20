import { db } from '~/db/drizzle';
import { sendNotificationToAll } from '~/lib/push-manager';
import {
  createOrUpdatePushSubscription,
  getAllPushSubscriptions,
  putLogoutPushSubscriptions,
  removeFailedPushSubscriptions,
} from '~/repositories/push.repo';
import {
  pushBroadcastRoute,
  pushLogoutRoute,
  registerPushRoute,
} from '~/routes/push.route';
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
  void sendNotificationToAll(subscriptions, c.req.valid('json')).then(
    async (results) => {
      await removeFailedPushSubscriptions(db, results);
    },
  );

  return c.json({}, 200);
});

pushRouter.openapi(pushLogoutRoute, async (c) => {
  await putLogoutPushSubscriptions(db, {
    ...c.req.valid('json'),
  });

  return c.json({}, 200);
});
