import {
  createChatroomRoute,
  deleteChatroomRoute,
  getUserChatroomsRoute,
} from '~/routes/curhat.route';
import { createAuthRouter } from './router-factory';
import {
  createChatroom,
  deleteChatroom,
  getChatroomById,
  getUserChatrooms,
  getWelfareChatrooms,
} from '~/repositories/chatroom.repo';
import { db } from '~/db/drizzle';
import { animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { getUserRoles } from '~/repositories/user-role.repo';
import { Chatroom, ChatroomMessage } from '~/db/schema';

export const curhatRouter = createAuthRouter();

curhatRouter.openapi(createChatroomRoute, async (c) => {
  const { id: userId } = c.var.user;
  const chatrooms = await getUserChatrooms(db, userId);
  if (chatrooms.length >= 3) {
    return c.json(
      {
        error: 'You have reached the maximum chatrooms limit',
      },
      400,
    );
  }

  const [newChatroom] = await createChatroom(db, {
    title: uniqueNamesGenerator({
      dictionaries: [colors, animals],
      separator: ' ',
    }),
    userId,
  });
  return c.json(newChatroom, 201);
});

curhatRouter.openapi(getUserChatroomsRoute, async (c) => {
  const { id: userId } = c.var.user;
  const roles = await getUserRoles(db, userId);

  let chatrooms: Array<
    Chatroom & {
      messages: ChatroomMessage[];
    }
  >;
  if (roles.includes('curhatadmin')) {
    chatrooms = await getWelfareChatrooms(db);
  } else {
    chatrooms = await getUserChatrooms(db, userId);
  }
  const mappedChatrooms = chatrooms.map((c) => {
    return {
      ...c,
      userId: undefined,
      canDelete: c.userId === userId,
      messages: c.messages.map((m) => ({
        ...m,
        isSender: m.userId === userId,
        userId: undefined,
      })),
    };
  });

  return c.json(mappedChatrooms, 200);
});

curhatRouter.openapi(deleteChatroomRoute, async (c) => {
  const { id: userId } = c.var.user;
  const { chatroomId } = c.req.valid('param');
  const chatroom = await getChatroomById(db, chatroomId);
  if (!chatroom) {
    return c.json({ error: 'Chatroom not found' }, 404);
  }

  if (chatroom.userId !== userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  await deleteChatroom(db, chatroomId);
  return c.json({ message: 'Chatroom deleted' }, 200);
});
