import { createId } from '@paralleldrive/cuid2';
import { InferSelectModel, relations } from 'drizzle-orm';
import {
  index,
  integer,
  json,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';
import webpush from 'web-push';

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    nim: text('nim').unique().notNull(),
    email: text('email').unique().notNull(),
    fullName: text('full_name'),
    major: text('jurusan', { enum: ['IF', 'STI'] }).notNull(),
    region: text('asal_kampus', {
      enum: ['Ganesha', 'Jatinangor'],
    }).notNull(),
    angkatan: integer('angkatan'),
    gender: text('jenis_kelamin', { enum: ['F', 'M'] }),
    membershipStatus: text('status_keanggotaan'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    nimIdx: index().on(t.nim),
    emailIdx: index().on(t.email),
  }),
);

export type User = InferSelectModel<typeof users>;

export const usersRelation = relations(users, ({ many }) => ({
  pushSubscriptions: many(pushSubscriptions),
  infos: many(infos),
  medias: many(medias),
  userReadInfos: many(userReadInfos),
  comments: many(comments),
  reactions: many(reactions),
}));

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    endpoint: text('endpoint').primaryKey(),
    userId: text('user_id').references(() => users.id),
    keys: json('keys').$type<webpush.PushSubscription['keys']>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdIdx: index().on(t.userId),
  }),
);

export type PushSubscription = InferSelectModel<typeof pushSubscriptions>;

export const pushSubscriptionsRelation = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  }),
);

export const googleSubscriptions = pgTable('google_subscriptions', {
  userId: text('user_id')
    .references(() => users.id)
    .primaryKey(),
  idToken: text('id_token').notNull(),
  refreshToken: text('refresh_token').notNull(),
  scope: text('scope').notNull(),
  expiresIn: integer('expires_in').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type GoogleSubscription = InferSelectModel<typeof googleSubscriptions>;

export const googleSubscriptionsRelation = relations(
  googleSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [googleSubscriptions.userId],
      references: [users.id],
    }),
  }),
);

export const infos = pgTable('infos', {
  id: text('id').primaryKey().$defaultFn(createId),
  creatorId: text('creator_id')
    .references(() => users.id)
    .notNull(),
  content: text('content').notNull(),
  category: text('category'),
  forAngkatan: integer('for_angkatan'),
  forMatakuliah: text('for_matakuliah').references(() => courses.code),
  forClass: text('for_class'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Info = InferSelectModel<typeof infos>;

export const infosRelation = relations(infos, ({ one, many }) => ({
  creator: one(users, {
    fields: [infos.creatorId],
    references: [users.id],
  }),
  userReadInfos: many(userReadInfos),
  infoMedias: many(infoMedias),
  comments: many(comments),
  reactions: many(reactions),
  course: one(courses, {
    fields: [infos.forMatakuliah],
    references: [courses.code],
  }),
}));

export const medias = pgTable('medias', {
  id: text('id').primaryKey().$defaultFn(createId),
  creatorId: text('creator_id')
    .references(() => users.id)
    .notNull(),
  name: text('name').unique().notNull(),
  type: text('type').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Media = InferSelectModel<typeof medias>;

export const mediasRelation = relations(medias, ({ one, many }) => ({
  creator: one(users, {
    fields: [medias.creatorId],
    references: [users.id],
  }),
  infoMedias: many(infoMedias),
}));

export const userReadInfos = pgTable(
  'user_read_infos',
  {
    userId: text('user_id').references(() => users.id),
    infoId: text('info_id').references(() => infos.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.infoId] }),
  }),
);

export const userReadInfosRelation = relations(userReadInfos, ({ one }) => ({
  user: one(users, {
    fields: [userReadInfos.userId],
    references: [users.id],
  }),
  info: one(infos, {
    fields: [userReadInfos.infoId],
    references: [infos.id],
  }),
}));

export const infoMedias = pgTable(
  'info_medias',
  {
    infoId: text('info_id').references(() => infos.id),
    mediaId: text('media_id').references(() => medias.id),
  },
  (t) => ({ pk: primaryKey({ columns: [t.infoId, t.mediaId] }) }),
);

export const infoMediasRelation = relations(infoMedias, ({ one }) => ({
  info: one(infos, {
    fields: [infoMedias.infoId],
    references: [infos.id],
  }),
  media: one(medias, {
    fields: [infoMedias.mediaId],
    references: [medias.id],
  }),
}));

export const comments = pgTable(
  'comments',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    repliedInfoId: text('replied_info_id')
      .references(() => infos.id)
      .notNull(),
    creatorId: text('creator_id')
      .references(() => users.id)
      .notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    repliedInfoIdIdx: index().on(t.repliedInfoId),
    creatorIdIdx: index().on(t.creatorId),
  }),
);

export type Comment = InferSelectModel<typeof comments>;

export const commentsRelation = relations(comments, ({ one, many }) => ({
  creator: one(users, {
    fields: [comments.creatorId],
    references: [users.id],
  }),
  repliedInfo: one(infos, {
    fields: [comments.repliedInfoId],
    references: [infos.id],
  }),
  reactions: many(reactions),
}));

export const reactions = pgTable(
  'reactions',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    creatorId: text('creator_id')
      .references(() => users.id)
      .notNull(),
    infoId: text('info_id').references(() => infos.id),
    commentId: text('comment_id').references(() => comments.id),
    reaction: text('reaction').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    infoIdIdx: index().on(t.infoId),
    commentIdIdx: index().on(t.commentId),
    uniqueIdentifier: unique()
      .on(t.creatorId, t.infoId, t.commentId)
      .nullsNotDistinct(),
  }),
);

export type Reaction = InferSelectModel<typeof reactions>;

export const reactionsRelation = relations(reactions, ({ one }) => ({
  creator: one(users, {
    fields: [reactions.creatorId],
    references: [users.id],
  }),
  info: one(infos, {
    fields: [reactions.infoId],
    references: [infos.id],
  }),
  comment: one(comments, {
    fields: [reactions.commentId],
    references: [comments.id],
  }),
}));

export const courses = pgTable(
  'courses',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    curriculumYear: integer('curriculum_year').notNull(),
    major: text('jurusan', { enum: ['IF', 'STI'] }).notNull(),
    semester: integer('semester').notNull(),
    semesterCode: text('semester_code', {
      enum: ['Ganjil', 'Genap'],
    }).notNull(),
    code: text('code').unique().notNull(),
    name: text('name').notNull(),
    credits: integer('sks').notNull(),
  },
  (t) => ({
    codeIdx: index().on(t.code),
  }),
);

export type Course = InferSelectModel<typeof courses>;

export const coursesRelation = relations(courses, ({ many }) => ({
  infos: many(infos),
}));
