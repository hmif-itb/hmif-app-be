import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import {
  Chatroom,
  chatroomLabels,
  chatroomLabelsManyToMany,
  ChatroomMessage,
  chatroomMessages,
  chatrooms,
} from '~/db/schema';
import { z } from 'zod';

export const ChatroomMessageSchema = createSelectSchema(chatroomMessages)
  .omit({
    userId: true,
  })
  .extend({
    isSender: z.boolean().optional(),
    reply: createSelectSchema(chatroomMessages)
      .omit({
        userId: true,
      })
      .optional(),
  })
  .openapi('ChatroomMessage');

export const ChatroomLabelSchema =
  createSelectSchema(chatroomLabels).openapi('ChatroomLabel');

export const ChatroomLabelsManyToManySchema = createSelectSchema(
  chatroomLabelsManyToMany,
)
  .extend({
    label: ChatroomLabelSchema,
  })
  .openapi('ChatroomLabelManyToMany');

export const ChatroomSchema = createSelectSchema(chatrooms)
  .omit({
    userId: true,
  })
  .extend({
    messages: z.array(ChatroomMessageSchema).optional(),
    labels: z.array(ChatroomLabelsManyToManySchema).optional(),
    isPinned: z.boolean().optional(),
    canDelete: z.boolean().optional(),
  })
  .openapi('Chatroom');

export const ListChatroomSchema = z
  .record(z.string(), ChatroomSchema)
  .openapi('ListChatroom');

export const ChatroomIdParamsSchema = z.object({
  chatroomId: z.string().openapi({
    param: {
      in: 'path',
      description: 'Id of chatroom',
      example: 'uuid',
    },
  }),
});

export const PutLabelChatroomSchema = z.object({
  labelIds: z.string().array(),
});

export const CreateLabelChatroomBodySchema = createInsertSchema(
  chatroomLabels,
).omit({
  id: true,
});

export const PinChatroomBodySchema = z.object({
  isPinned: z.boolean(),
});

export type TChatroom = Chatroom & {
  messages: ChatroomMessage[];
};
