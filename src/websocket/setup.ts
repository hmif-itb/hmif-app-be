import { ServerType } from '@hono/node-server';
import { Server } from 'socket.io';
import { env } from '~/configs/env.config';
import { db } from '~/db/drizzle';
import { sendNotificationToAll } from '~/lib/push-manager';
import {
  getChatroomById,
  getChatroomParticipantIds,
  saveMessage,
} from '~/repositories/chatroom.repo';
import { getPushSubscriptionsByUserIds } from '~/repositories/push.repo';

interface Message {
  chatroomId: string;
  message: string;
  userId: string;
  replyId: string;
}

export default function setupWebsocket(httpServer: ServerType) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.ALLOWED_ORIGINS,
    },
  });

  io.on('connection', async (socket) => {
    await socket.join(socket.handshake.auth.chatroomId as string);

    socket.on('message', async (msg: Message) => {
      const [savedMessage] = await saveMessage(
        db,
        msg.userId,
        msg.chatroomId,
        msg.message,
        msg.replyId,
      );

      sendNotification(msg).then(
        () => {},
        () => {},
      );

      socket.to(msg.chatroomId).emit('reply', {
        ...savedMessage,
        userId: undefined,
        isSender: false,
      });
    });
  });
}

/**
 * Send notification to all participants in a chatroom except the sender.
 */
async function sendNotification(msg: Message) {
  const participantIds = (
    await getChatroomParticipantIds(db, msg.chatroomId)
  ).filter((ids) => ids !== msg.userId);

  const pushSubscriptions = await getPushSubscriptionsByUserIds(
    db,
    participantIds,
  );

  await sendNotificationToAll(pushSubscriptions, {
    title: 'New Curhat Message',
    options: {
      body: msg.message,
      data: {
        url: '/home/curhat',
      },
    },
  });
}
