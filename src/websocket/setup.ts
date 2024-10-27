import { ServerType } from '@hono/node-server';
import { Server } from 'socket.io';
import { env } from '~/configs/env.config';
import { db } from '~/db/drizzle';
import { saveMessage } from '~/repositories/chatroom.repo';

interface Message {
  chatroomId: string;
  message: string;
  userId: string;
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
      );
      socket.to(msg.chatroomId).emit('reply', {
        ...savedMessage,
        userId: undefined,
        isSender: false,
      });
    });
  });
}
