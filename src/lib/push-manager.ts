import webpush from 'web-push';
import { env } from '~/configs/env.config';

webpush.setVapidDetails(
  'mailto:' + env.VAPID_MAILTO,
  env.VAPID_PUBLIC_KEY,
  env.VAPID_PRIVATE_KEY,
);

export interface PushData {
  title: string;
  options?: {
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
    badge?: string;
    data?: any;
    icon?: string;
    image?: string;
    tag?: string;
    timestamp?: number;
  };
}

/**
 *
 * send notification to a single subscriber.
 * If success, return the send result, otherwise return the error and the given endpoint
 */
export async function sendNotification(
  pushSubscription: webpush.PushSubscription,
  data: PushData,
  options?: {
    urgency?: webpush.Urgency;
  },
): Promise<
  | { success: true; result: webpush.SendResult }
  | { success: false; error: webpush.WebPushError; endpoint: string }
> {
  try {
    return {
      success: true,
      result: await webpush.sendNotification(
        pushSubscription,
        JSON.stringify(data),
        options,
      ),
    };
  } catch (err) {
    if (err instanceof webpush.WebPushError) {
      return {
        success: false,
        error: err,
        endpoint: pushSubscription.endpoint,
      };
    }
    throw err;
  }
}

/**
 *
 * send notification to all subscriptions using sendNotification function.
 */
export async function sendNotificationToAll(
  pushSubscriptions: webpush.PushSubscription[],
  data: PushData,
  options?: {
    urgency?: webpush.Urgency;
  },
) {
  return await Promise.all(
    pushSubscriptions.map(
      async (pushSubscription) =>
        await sendNotification(pushSubscription, data, options),
    ),
  );
}
