import { eq, InferInsertModel } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { chatroomMessages, chatrooms } from '~/db/schema';

export async function getUserChatrooms(db: Database, userId: string) {
  const crms = await db.query.chatrooms.findMany({
    where: eq(chatrooms.userId, userId),
    with: {
      messages: true,
    },
  });
  return crms.map((chatroom) => {
    const messageMap = new Map(chatroom.messages.map((msg) => [msg.id, msg]));

    return {
      ...chatroom,
      messages: chatroom.messages
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
    };
  });
}

export async function getWelfareChatrooms(db: Database) {
  const crms = await db.query.chatrooms.findMany({
    with: {
      messages: true,
    },
  });
  return crms.map((chatroom) => ({
    ...chatroom,
    messages: chatroom.messages.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    ),
  }));
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
