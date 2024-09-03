import { db } from '~/db/drizzle';
import { sendNotificationToAll } from '~/lib/push-manager';
import { roleMiddleware } from '~/middlewares/role.middleware';
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
import { createAuthRouter, createRouter } from './router-factory';

export const pushPubRouter = createRouter();
export const pushRouter = createAuthRouter();

pushRouter.openapi(registerPushRoute, async (c) => {
  await createOrUpdatePushSubscription(db, {
    ...c.req.valid('json'),
    userId: c.var.user.id,
  });

  return c.json({}, 201);
});

pushRouter.post(pushBroadcastRoute.getRoutingPath(), roleMiddleware(['ring1']));
pushRouter.openapi(pushBroadcastRoute, async (c) => {
  const subscriptions = await getAllPushSubscriptions(db);
  void sendNotificationToAll(subscriptions, c.req.valid('json')).then(
    async (results) => {
      await removeFailedPushSubscriptions(db, results);
    },
  );

  return c.json({}, 200);
});

pushPubRouter.openapi(pushLogoutRoute, async (c) => {
  await putLogoutPushSubscriptions(db, {
    ...c.req.valid('json'),
  });

  return c.json({}, 200);
});
