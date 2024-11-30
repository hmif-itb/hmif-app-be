import { eq, InferInsertModel, not, sql, inArray } from 'drizzle-orm';
import { Database } from '~/db/drizzle';
import { chatroomMessageReads, chatroomMessages, chatrooms } from '~/db/schema';

export async function getUserChatrooms(db: Database, userId: string) {
  const crms = await db.query.chatrooms.findMany({
    where: eq(chatrooms.userId, userId),
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
) {
  return await db.transaction(async (tx) => {
    return await tx
      .insert(chatroomMessages)
      .values({
        chatroomId,
        userId,
        content: message,
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

export async function getUnreadCountChatroomMessages(
  db: Database,
  userId: string,
) {
  const readMessageIdsSubquery = db
    .select({ chatroomMessageId: chatroomMessageReads.chatroomMessageId })
    .from(chatroomMessageReads)
    .where(eq(chatroomMessageReads.userId, userId));

  return await db
    .select({
      chatroomId: chatroomMessages.chatroomId,
      unreadCount: sql<number>`COUNT(${chatroomMessages.id})`,
    })
    .from(chatroomMessages)
    .where(not(inArray(chatroomMessages.id, readMessageIdsSubquery)))
    .groupBy(chatroomMessages.chatroomId);
}
