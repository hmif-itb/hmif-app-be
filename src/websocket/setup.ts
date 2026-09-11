import { ServerType } from '@hono/node-server';
import { verify } from 'hono/jwt';
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
import { getUserRoles } from '~/repositories/user-role.repo';

interface Message {
  chatroomId: string;
  message: string;
  userId: string;
  replyId: string;
}

export function formAdminRoom(formId: string) {
  return `form-admin:${formId}`;
}

let ioInstance: Server | undefined;

/**
 * Shared Socket.io instance, set up once in `setupWebsocket()`. Used by
 * controllers (e.g. form.controller.ts) to emit events from outside the
 * websocket connection handler, such as after a REST request is handled.
 */
export function getIo() {
  if (!ioInstance) {
    throw new Error('Websocket has not been set up yet');
  }
  return ioInstance;
}

export default function setupWebsocket(httpServer: ServerType) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.ALLOWED_ORIGINS,
      credentials: true,
    },
  });
  ioInstance = io;

  io.on('connection', async (socket) => {
    const chatroomId = socket.handshake.auth.chatroomId as string | undefined;
    if (chatroomId) {
      await socket.join(chatroomId);
    }

    const formAdminId = socket.handshake.auth.formAdminId as string | undefined;
    if (formAdminId) {
      // Live counting rooms expose NIM + name of everyone who has submitted
      // a form response — unlike chat rooms, membership here must be
      // verified against the 'admin' role before joining, not just trusted
      // based on client-supplied ids. The auth cookie is httpOnly, so the FE
      // can't read the JWT to send it explicitly — it rides along on the
      // handshake request instead (client connects with withCredentials).
      const token = extractTokenFromCookie(socket.handshake.headers.cookie);
      const isAdmin = await isSocketAdmin(token);
      if (isAdmin) {
        await socket.join(formAdminRoom(formAdminId));
      }
    }

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

function extractTokenFromCookie(
  cookieHeader: string | undefined,
): string | undefined {
  if (!cookieHeader) return undefined;
  const prefix = 'hmif-app.access-cookie=';
  const raw = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(prefix));
  if (!raw) return undefined;
  return decodeURIComponent(raw.slice(prefix.length));
}

async function isSocketAdmin(token: unknown): Promise<boolean> {
  if (typeof token !== 'string' || !token) return false;

  try {
    const payload = await verify(token, env.JWT_SECRET);
    const userId = payload.id as string | undefined;
    if (!userId) return false;

    const roles = await getUserRoles(db, userId);
    return roles.includes('admin');
  } catch {
    return false;
  }
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
