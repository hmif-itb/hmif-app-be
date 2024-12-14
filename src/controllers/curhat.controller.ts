import {
  createChatroomRoute,
  deleteChatroomRoute,
  getUserChatroomsRoute,
  unreadCountChatroomMessages,
  pinChatroomRoute,
} from '~/routes/curhat.route';
import { createAuthRouter } from './router-factory';
import {
  createChatroom,
  deleteChatroom,
  getChatroomById,
  getUnreadCountChatroomMessages,
  getUserChatrooms,
  getWelfareChatrooms,
  pinChatroom,
} from '~/repositories/chatroom.repo';
import { db } from '~/db/drizzle';
import { animals, colors, uniqueNamesGenerator } from 'unique-names-generator';
import { getUserRoles } from '~/repositories/user-role.repo';
import { PostgresError } from 'postgres';
import { TChatroom } from '~/types/curhat.types';

export const curhatRouter = createAuthRouter();

curhatRouter.openapi(createChatroomRoute, async (c) => {
  const { id: userId } = c.var.user;
  const chatroomMap = await getUserChatrooms(db, userId);
  if (chatroomMap.keys.length >= 3) {
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

  let chatroomMap: Map<string, TChatroom>;
  if (roles.includes('curhatadmin')) {
    chatroomMap = await getWelfareChatrooms(db, userId);
  } else {
    chatroomMap = await getUserChatrooms(db, userId);
  }

  const mappedChatrooms: Record<string, any> = {};
  chatroomMap.forEach((val, key) => {
    mappedChatrooms[key] = {
      ...val,
      canDelete: val.userId === userId,
      messages: val.messages?.map((m) => ({
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

curhatRouter.openapi(unreadCountChatroomMessages, async (c) => {
  const { id: userId } = c.var.user;

  if (!userId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  try {
    const unreadMessages = await getUnreadCountChatroomMessages(db, userId);

    return c.json(unreadMessages, 200);
  } catch (error) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

curhatRouter.openapi(pinChatroomRoute, async (c) => {
  const { id: userId } = c.var.user;
  const { chatroomId } = c.req.valid('param');
  const { isPinned } = c.req.valid('json');

  const roles = await getUserRoles(db, userId);

  if (!roles.includes('curhatadmin')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    await pinChatroom(db, chatroomId, userId, isPinned);
    if (isPinned) {
      return c.json({ message: 'Chatroom pinned' }, 200);
    } else {
      return c.json({ message: 'Chatroom unpinned' }, 200);
    }
  } catch (e) {
    if (e instanceof PostgresError) {
      return c.json({ error: 'Failed to pin chatroom' }, 400);
    } else {
      return c.json({ error: 'Something went wrong' }, 500);
    }
  }
});
