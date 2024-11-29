import { and, eq, InferInsertModel } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import {
  chatroomMessages,
  chatrooms,
  userPinnedChatrooms,
  Chatroom,
  ChatroomMessage,
  UserPinnedChatrooms,
} from '~/db/schema';

type ChatroomWithMessages = Chatroom & {
  messages: ChatroomMessage[];
};
function processChatrooms(
  crms: ChatroomWithMessages[],
  pinned: UserPinnedChatrooms[],
) {
  return crms.map((chatroom) => {
    const messages = chatroom.messages ?? [];
    const messageMap = new Map(messages.map((msg) => [msg.id, msg]));

    return {
      ...chatroom,
      messages: messages
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .map((message) => {
          const reply = message.replyId
            ? messageMap.get(message.replyId) ?? null
            : null;
          if (reply) {
            const { userId, ...replyWithoutUserId } = reply;
            return {
              ...message,
              reply: replyWithoutUserId,
            };
          }
          return {
            ...message,
            reply: null,
          };
        }),
      isPinned: pinned.some((p) => p.chatroomId === chatroom.id),
    };
  });
}

export async function getUserChatrooms(db: Database, userId: string) {
  const crms = await db.query.chatrooms.findMany({
    where: eq(chatrooms.userId, userId),
    with: {
      messages: true,
    },
  });
  return processChatrooms(crms, []);
}

export async function getWelfareChatrooms(db: Database, userId: string) {
  const [crms, pinned] = await Promise.all([
    db.query.chatrooms.findMany({
      with: {
        messages: true,
      },
    }),
    db.query.userPinnedChatrooms.findMany({
      where: eq(userPinnedChatrooms.userId, userId),
    }),
  ]);

  return processChatrooms(crms, pinned);
}

export async function createChatroom(
  db: Database,
  data: InferInsertModel<typeof chatrooms>,
) {
  return await db.transaction(async (tx) => {
    return await tx.insert(chatrooms).values(data).returning();
  });
}

export async function saveMessage(
  db: Database,
  userId: string,
  chatroomId: string,
  message: string,
  replyId: string,
) {
  return await db.transaction(async (tx) => {
    return await tx
      .insert(chatroomMessages)
      .values({
        chatroomId,
        userId,
        content: message,
        replyId,
      })
      .returning();
  });
}

export async function getChatroomById(db: Database, chatroomId: string) {
  return await db.query.chatrooms.findFirst({
    where: eq(chatrooms.id, chatroomId),
    with: {
      messages: true,
    },
  });
}

export async function deleteChatroom(db: Database, chatroomId: string) {
  return await db.transaction(async (tx) => {
    return await tx.delete(chatrooms).where(eq(chatrooms.id, chatroomId));
  });
}

export async function pinChatroom(
  db: Database,
  chatroomId: string,
  userId: string,
  isPinned: boolean,
) {
  await db.transaction(async (tx) => {
    if (isPinned) {
      return await tx
        .insert(userPinnedChatrooms)
        .values({ userId, chatroomId });
    } else {
      return await tx
        .delete(userPinnedChatrooms)
        .where(
          and(
            eq(userPinnedChatrooms.chatroomId, chatroomId),
            eq(userPinnedChatrooms.userId, userId),
          ),
        );
    }
  });
}
