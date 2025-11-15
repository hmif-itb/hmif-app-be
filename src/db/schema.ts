import { init } from '@paralleldrive/cuid2';
import { type InferSelectModel, relations, sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  json,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import type webpush from 'web-push';
import { rolesEnums } from './roles-group';

export const createId = init({
  length: 8,
});

export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    nim: text('nim').unique().notNull(),
    email: text('email').unique().notNull(),
    fullName: text('full_name').notNull(),
    major: text('jurusan', { enum: ['IF', 'STI'] }).notNull(),
    picture: text('picture'),
    region: text('asal_kampus', {
      enum: ['Ganesha', 'Jatinangor'],
    }).notNull(),
    angkatan: integer('angkatan')
      .references(() => angkatan.year, { onDelete: 'cascade' })
      .notNull(),
    gender: text('jenis_kelamin', { enum: ['F', 'M'] }).notNull(),
    membershipStatus: text('status_keanggotaan').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  },
  (t) => ({
    nimIdx: index().on(t.nim),
    emailIdx: index().on(t.email),
  }),
);

export type User = InferSelectModel<typeof users>;

export const usersRelation = relations(users, ({ many, one }) => ({
  prestasi: many(prestasi),
  pushSubscriptions: many(pushSubscriptions),
  infos: many(infos),
  medias: many(medias),
  userReadInfos: many(userReadInfos),
  comments: many(comments),
  reactions: many(reactions),
  angkatan: one(angkatan, {
    fields: [users.angkatan],
    references: [angkatan.year],
  }),
  userCourses: many(userCourses),
  userUnsubscribeCategories: many(userUnsubscribeCategories),
  testimonies: many(testimonies),
  userRoles: many(userRoles),
  voucherRecommendations: many(voucherRecommendations),
  chatrooms: many(chatrooms),
  chatroomMessages: many(chatroomMessages),
  pinnedChatrooms: many(userPinnedChatrooms),
  chatroomMessageReads: many(chatroomMessageReads),
  coWorkingSpaceRecommendations: many(coWorkingSpaceRecommendations),
}));

export const pushSubscriptions = pgTable(
  'push_subscriptions',
  {
    endpoint: text('endpoint').primaryKey(),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
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
    .references(() => users.id, { onDelete: 'cascade' })
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

export const infos = pgTable(
  'infos',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    creatorId: text('creator_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    isForAngkatan: boolean('is_for_angkatan').notNull(), // redundancy for angkatan relation
    isForGroups: boolean('is_for_groups').notNull(), // redundancy for group relation
    lastNotifiedAt: timestamp('last_notified_at', {
      withTimezone: true,
      mode: 'date',
    })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    contentSearchIdx: index('content_search_idx').using(
      'gin',
      sql`(
        setweight(to_tsvector('indonesian', ${t.title}), 'A') ||
        setweight(to_tsvector('indonesian', ${t.content}), 'B')
      )`,
    ),
  }),
);

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
  infoCategories: many(infoCategories),
  infoCourses: many(infoCourses),
  infoAngkatan: many(infoAngkatan),
  infoGroups: many(infoGroups),
}));

export const infoGroups = pgTable(
  'info_groups',
  {
    infoId: text('info_id')
      .references(() => infos.id, { onDelete: 'cascade' })
      .notNull(),
    role: text('role').$type<UserRolesEnum>().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.infoId, t.role] }),
  }),
);

export const infoGroupsRelation = relations(infoGroups, ({ one }) => ({
  info: one(infos, {
    fields: [infoGroups.infoId],
    references: [infos.id],
  }),
}));

export const medias = pgTable('medias', {
  id: text('id').primaryKey().$defaultFn(createId),
  creatorId: text('creator_id')
    .references(() => users.id, { onDelete: 'cascade' })
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
  competitions: many(competitionMedias),
}));

export const userReadInfos = pgTable(
  'user_read_infos',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    infoId: text('info_id')
      .references(() => infos.id, { onDelete: 'cascade' })
      .notNull(),
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
    infoId: text('info_id')
      .references(() => infos.id, { onDelete: 'cascade' })
      .notNull(),
    mediaId: text('media_id')
      .references(() => medias.id, { onDelete: 'cascade' })
      .notNull(),
    order: integer('order').notNull(),
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
      .references(() => infos.id, { onDelete: 'cascade' })
      .notNull(),
    creatorId: text('creator_id')
      .references(() => users.id, { onDelete: 'cascade' })
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
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    infoId: text('info_id').references(() => infos.id, { onDelete: 'cascade' }),
    commentId: text('comment_id').references(() => comments.id, {
      onDelete: 'cascade',
    }),
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
    major: text('jurusan', { enum: ['IF', 'STI', 'OTHER'] }).notNull(),
    type: text('type', { enum: ['Mandatory', 'Elective'] })
      .default('Elective')
      .notNull(),
    semester: integer('semester'),
    semesterCode: text('semester_code', {
      enum: ['Ganjil', 'Genap'],
    }),
    code: text('code').unique().notNull(),
    name: text('name').notNull(),
    credits: integer('sks'),
    dingdongUrl: text('dingdong_url'),
    isActive: boolean('is_active').notNull().default(true),
  },
  (t) => ({
    codeIdx: index().on(t.code),
    searchIdx: index('search_idx').using(
      'gin',
      sql`(
        setweight(to_tsvector('indonesian', ${t.name}), 'A') ||
        setweight(to_tsvector('indonesian', ${t.code}), 'B')
      )`,
    ),
  }),
);

export type Course = InferSelectModel<typeof courses>;

export const coursesRelation = relations(courses, ({ many }) => ({
  infoCourses: many(infoCourses),
  userCourses: many(userCourses),
  testimonies: many(testimonies),
  calendarEvent: many(calendarEvent),
}));

export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(createId),
  name: text('name').unique().notNull(),
  rolesAllowed: json('roles_allowed').$type<UserRolesEnum[]>(),
  requiredPush: boolean('required_push').notNull(),
  isForInfo: boolean('is_for_info').notNull(),
});

export type Category = InferSelectModel<typeof categories>;

export const categoriesRelation = relations(categories, ({ many }) => ({
  infoCategories: many(infoCategories),
  userUnsubscribeCategories: many(userUnsubscribeCategories),
}));

export const angkatan = pgTable('angkatan', {
  id: text('id').primaryKey().$defaultFn(createId),
  year: integer('year').unique().notNull(),
  name: text('name').unique().notNull(),
});

export type Angkatan = InferSelectModel<typeof angkatan>;

export const angkatanRelation = relations(angkatan, ({ many }) => ({
  users: many(users),
  infoAngkatan: many(infoAngkatan),
}));

export const infoCourses = pgTable(
  'info_courses',
  {
    infoId: text('info_id')
      .references(() => infos.id, { onDelete: 'cascade' })
      .notNull(),
    courseId: text('course_id')
      .references(() => courses.id, { onDelete: 'cascade' })
      .notNull(),
    class: integer('class'),
  },
  (t) => ({ pk: primaryKey({ columns: [t.infoId, t.courseId] }) }),
);

export const infoCoursesRelation = relations(infoCourses, ({ one }) => ({
  info: one(infos, { fields: [infoCourses.infoId], references: [infos.id] }),
  course: one(courses, {
    fields: [infoCourses.courseId],
    references: [courses.id],
  }),
}));

export const infoAngkatan = pgTable(
  'info_angkatan',
  {
    infoId: text('info_id')
      .references(() => infos.id, { onDelete: 'cascade' })
      .notNull(),
    angkatanId: text('angkatan_id')
      .references(() => angkatan.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.infoId, t.angkatanId] }) }),
);

export const infoAngkatanRelation = relations(infoAngkatan, ({ one }) => ({
  info: one(infos, { fields: [infoAngkatan.infoId], references: [infos.id] }),
  angkatan: one(angkatan, {
    fields: [infoAngkatan.angkatanId],
    references: [angkatan.id],
  }),
}));

export const infoCategories = pgTable(
  'info_categories',
  {
    infoId: text('info_id')
      .references(() => infos.id, { onDelete: 'cascade' })
      .notNull(),
    categoryId: text('category_id')
      .references(() => categories.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.infoId, t.categoryId] }) }),
);

export const infoCategoriesRelation = relations(infoCategories, ({ one }) => ({
  info: one(infos, {
    fields: [infoCategories.infoId],
    references: [infos.id],
  }),
  category: one(categories, {
    fields: [infoCategories.categoryId],
    references: [categories.id],
  }),
}));

export const userCourses = pgTable(
  'user_courses',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    courseId: text('course_id')
      .references(() => courses.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    class: integer('class').notNull(),
    semesterCodeTaken: text('semester_code_taken', {
      enum: ['Ganjil', 'Genap'],
    }).notNull(),
    semesterYearTaken: integer('semester_year_taken').notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.courseId] }) }),
);

export const userCoursesRelation = relations(userCourses, ({ one }) => ({
  user: one(users, { fields: [userCourses.userId], references: [users.id] }),
  course: one(courses, {
    fields: [userCourses.courseId],
    references: [courses.id],
  }),
}));

export const userUnsubscribeCategories = pgTable(
  'user_unsubscribe_categories',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    categoryId: text('category_id')
      .references(() => categories.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.categoryId] }) }),
);

export const userUnsubscribeCategoriesRelation = relations(
  userUnsubscribeCategories,
  ({ one }) => ({
    user: one(users, {
      fields: [userUnsubscribeCategories.userId],
      references: [users.id],
    }),
    category: one(categories, {
      fields: [userUnsubscribeCategories.categoryId],
      references: [categories.id],
    }),
  }),
);

export const testimonies = pgTable(
  'testimonies',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    userId: text('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    courseId: text('course_id')
      .notNull()
      .references(() => courses.id, {
        onDelete: 'cascade',
      }),
    userName: text('user_name'),
    // STI Testimonies
    impressions: text('impressions'),
    challenges: text('challenges'),
    advice: text('advice'),

    // IF Testimonies
    overview: text('overview'),
    assignments: text('assignments'),
    lecturer_review: text('lecturer_review'),

    lecturer: text('lecturer'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    userIdIdx: index().on(t.userId),
    courseIdIdx: index().on(t.courseId),
  }),
);

export const testimoniesRelation = relations(testimonies, ({ one }) => ({
  user: one(users, { fields: [testimonies.userId], references: [users.id] }),
  course: one(courses, {
    fields: [testimonies.courseId],
    references: [courses.id],
  }),
}));

export const calendarGroup = pgTable('calendar_group', {
  id: text('id').primaryKey().$defaultFn(createId),
  name: text('name').notNull(),
  category: text('category', { enum: ['akademik', 'himpunan'] }).notNull(),
  code: text('code'),
  googleCalendarUrl: text('google_calendar_url'),
});

export type CalendarGroup = InferSelectModel<typeof calendarGroup>;

export const calendarGroupRelation = relations(calendarGroup, ({ many }) => ({
  calendarEvent: many(calendarEvent),
}));

export const calendarEvent = pgTable(
  'calendar_event',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    calendarGroupId: text('calendar_group_id')
      .notNull()
      .references(() => calendarGroup.id, { onDelete: 'cascade' }),
    courseId: text('courses_id').references(() => courses.id, {
      onDelete: 'cascade',
    }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull(),
    academicYear: integer('academic_year'),
    academicSemesterCode: text('academic_semester_code', {
      enum: ['Ganjil', 'Genap'],
    }),
    start: timestamp('start', { withTimezone: true }).notNull(),
    end: timestamp('end', { withTimezone: true }).notNull(),
    googleCalendarUrl: text('google_calendar_url').notNull(),
    googleCalendarId: text('google_calendar_id').notNull(),
  },
  (t) => ({
    titleSearchIdx: index('title_search_idx').using(
      'gin',
      sql`(
        setweight(to_tsvector('indonesian', ${t.title}), 'A') ||
        setweight(to_tsvector('indonesian', ${t.description}), 'B')
      )`,
    ),
  }),
);

export type CalendarEvent = InferSelectModel<typeof calendarEvent>;

export const calendarEventRelations = relations(calendarEvent, ({ one }) => ({
  calendarGroup: one(calendarGroup, {
    fields: [calendarEvent.calendarGroupId],
    references: [calendarGroup.id],
  }),
  course: one(courses, {
    fields: [calendarEvent.courseId],
    references: [courses.id],
  }),
}));

export const userRoles = pgTable(
  'user_roles',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    role: text('role', { enum: rolesEnums }).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.role] }) }),
);

export type UserRolesEnum = (typeof rolesEnums)[number];

export const userRolesRelation = relations(userRoles, ({ one }) => ({
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
}));

export const competitionCategories = [
  'Competitive Programming',
  'Capture The Flag',
  'Data Science / Data Analytics',
  'UI/UX',
  'Game Development',
  'Business IT Case',
  'Innovation',
  'Web Development',
] as const;

export type CompetitionCategory = (typeof competitionCategories)[number];

export const competitions = pgTable('competitions', {
  id: text('id').primaryKey().$defaultFn(createId),
  name: text('name').notNull(),
  organizer: text('organizer').notNull(),
  registrationStart: timestamp('registration_start_date', {
    withTimezone: true,
  }),
  registrationDeadline: timestamp('registration_deadline_date', {
    withTimezone: true,
  }),
  price: text('price'),
  sourceUrl: text('source_url').notNull(),
  registrationUrl: text('registration_url').notNull(),
  categories: json('categories')
    .$type<CompetitionCategory[]>()
    .default([])
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const competitionsRelation = relations(competitions, ({ many }) => ({
  medias: many(competitionMedias),
}));

export const competitionMedias = pgTable(
  'competition_medias',
  {
    competitionId: text('competition_id')
      .references(() => competitions.id, { onDelete: 'cascade' })
      .notNull(),
    mediaId: text('media_id')
      .references(() => medias.id, { onDelete: 'cascade' })
      .notNull(),
    order: integer('order').notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.competitionId, t.mediaId] }) }),
);

export const competitionMediasRelation = relations(
  competitionMedias,
  ({ one }) => ({
    competition: one(competitions, {
      fields: [competitionMedias.competitionId],
      references: [competitions.id],
    }),
    media: one(medias, {
      fields: [competitionMedias.mediaId],
      references: [medias.id],
    }),
  }),
);

export const markdowns = pgTable('markdowns', {
  id: text('id').primaryKey().$defaultFn(createId),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .$onUpdate(() => new Date()),
});

export const chatrooms = pgTable('chatrooms', {
  id: text('id').primaryKey().$defaultFn(createId),
  title: text('title'),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
});

export type Chatroom = InferSelectModel<typeof chatrooms>;

export const chatroomsRelation = relations(chatrooms, ({ many, one }) => ({
  user: one(users, {
    fields: [chatrooms.userId],
    references: [users.id],
  }),
  messages: many(chatroomMessages),
  pinnedBy: many(userPinnedChatrooms),
  labels: many(chatroomLabelsManyToMany),
}));

export const chatroomMessages = pgTable('chatroom_messages', {
  id: text('id').primaryKey().$defaultFn(createId),
  chatroomId: text('chatroom_id')
    .references(() => chatrooms.id, { onDelete: 'cascade' })
    .notNull(),
  userId: text('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  replyId: text('reply_id').references((): AnyPgColumn => chatroomMessages.id, {
    onDelete: 'cascade',
  }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' })
    .notNull()
    .defaultNow(),
});

export type ChatroomMessage = InferSelectModel<typeof chatroomMessages>;

export const chatroomMessagesRelation = relations(
  chatroomMessages,
  ({ one, many }) => ({
    reply: one(chatroomMessages, {
      fields: [chatroomMessages.replyId],
      references: [chatroomMessages.id],
    }),
    chatroom: one(chatrooms, {
      fields: [chatroomMessages.chatroomId],
      references: [chatrooms.id],
    }),
    sender: one(users, {
      fields: [chatroomMessages.userId],
      references: [users.id],
    }),
    chatroomMessageReads: many(chatroomMessageReads),
  }),
);

export const userPinnedChatrooms = pgTable(
  'user_pinned_chatrooms',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    chatroomId: text('chatroom_id')
      .references(() => chatrooms.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.chatroomId] }) }),
);

export type UserPinnedChatrooms = InferSelectModel<typeof userPinnedChatrooms>;

export const userPinnedChatroomsRelation = relations(
  userPinnedChatrooms,
  ({ one }) => ({
    user: one(users, {
      fields: [userPinnedChatrooms.userId],
      references: [users.id],
    }),
    chatroom: one(chatrooms, {
      fields: [userPinnedChatrooms.chatroomId],
      references: [chatrooms.id],
    }),
  }),
);

export const chatroomLabels = pgTable('chatroom_labels', {
  id: text('id').primaryKey().$defaultFn(createId),
  title: text('name').notNull(),
});

export const chatroomLabelsRelation = relations(chatroomLabels, ({ many }) => ({
  chatrooms: many(chatroomLabelsManyToMany),
}));

export const chatroomLabelsManyToMany = pgTable(
  'chatroom_labels_many_to_many',
  {
    chatroomId: text('chatroom_id')
      .references(() => chatrooms.id, { onDelete: 'cascade' })
      .notNull(),
    labelId: text('label_id')
      .references(() => chatroomLabels.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.chatroomId, t.labelId] }) }),
);

export const chatroomLabelsManyToManyRelation = relations(
  chatroomLabelsManyToMany,
  ({ one }) => ({
    chatroom: one(chatrooms, {
      fields: [chatroomLabelsManyToMany.chatroomId],
      references: [chatrooms.id],
    }),
    label: one(chatroomLabels, {
      fields: [chatroomLabelsManyToMany.labelId],
      references: [chatroomLabels.id],
    }),
  }),
);

export const chatroomMessageReads = pgTable(
  'chatroom_message_reads',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    chatroomMessageId: text('chatroom_message_id')
      .references(() => chatroomMessages.id, { onDelete: 'cascade' })
      .notNull(),
    readAt: timestamp('read_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.chatroomMessageId] }) }),
);

export const chatroomMessageReadsRelation = relations(
  chatroomMessageReads,
  ({ one }) => ({
    user: one(users, {
      fields: [chatroomMessageReads.userId],
      references: [users.id],
    }),
    message: one(chatroomMessages, {
      fields: [chatroomMessageReads.chatroomMessageId],
      references: [chatroomMessages.id],
    }),
  }),
);

export const voucherRecommendations = pgTable('voucher_recommendations', {
  id: text('id').primaryKey().$defaultFn(createId),
  title: text('title').notNull(),
  imageURL: text('image_url').notNull(),
  link: text('link'),
  startPeriod: timestamp('start_period', { withTimezone: true }),
  endPeriod: timestamp('end_period', { withTimezone: true }),
  description: text('description'),
  creatorId: text('creator_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
});

export const voucherRecommendationsRelation = relations(
  voucherRecommendations,
  ({ one }) => ({
    creator: one(users, {
      fields: [voucherRecommendations.creatorId],
      references: [users.id],
    }),
  }),
);

export const coWorkingSpaceRecommendations = pgTable(
  'co_working_space_recommendations',
  {
    id: text('id').primaryKey().$defaultFn(createId),
    title: text('title').notNull(),
    imageURL: text('image_url').notNull(),
    location: text('location', { enum: ['Ganesha', 'Jatinangor'] }).notNull(),
    address: text('address').notNull(),
    mapsURL: text('maps_url').notNull(),
    description: text('description'),
    creatorId: text('creator_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
  },
);

export const coWorkingSpaceRecommendationsRelation = relations(
  coWorkingSpaceRecommendations,
  ({ one }) => ({
    creator: one(users, {
      fields: [coWorkingSpaceRecommendations.creatorId],
      references: [users.id],
    }),
  }),
);

export const voucherReviews = pgTable(
  'voucher_reviews',
  {
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    voucherId: text('voucher_id')
      .references(() => voucherRecommendations.id, { onDelete: 'cascade' })
      .notNull(),
    rating: integer('rating').notNull(),
    review: text('review').notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.voucherId, t.userId] }) }),
);

export const coWorkingSpaceReviews = pgTable(
  'co_working_space_reviews',
  {
    coWorkingSpaceId: text('coWorkingSpace_id')
      .references(() => coWorkingSpaceRecommendations.id, {
        onDelete: 'cascade',
      })
      .notNull(),
    userId: text('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    rating: integer('rating').notNull(),
    review: text('review').notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.coWorkingSpaceId, t.userId] }) }),
);

export const voucherReviewsRelation = relations(voucherReviews, ({ one }) => ({
  recommendation: one(voucherRecommendations, {
    fields: [voucherReviews.voucherId],
    references: [voucherRecommendations.id],
  }),
  user: one(users, {
    fields: [voucherReviews.userId],
    references: [users.id],
  }),
}));

export const coWorkingSpaceReviewsRelation = relations(
  coWorkingSpaceReviews,
  ({ one }) => ({
    recommendation: one(coWorkingSpaceRecommendations, {
      fields: [coWorkingSpaceReviews.coWorkingSpaceId],
      references: [coWorkingSpaceRecommendations.id],
    }),
    user: one(users, {
      fields: [coWorkingSpaceReviews.userId],
      references: [users.id],
    }),
  }),
);

export const jenisPrestasiEnum = pgEnum('jenis_prestasi', [
  'organisasi',
  'kepanitiaan',
  'kompetisi',
]);

export const competitionTypeEnum = pgEnum('competition_type', [
  'CP',
  'CTF',
  'BCC',
  'DS',
  'AI',
  'Hackathon',
]);

export const prestasi = pgTable('prestasi', {
  id: text('id').primaryKey().$defaultFn(createId),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  jenisPrestasi: jenisPrestasiEnum('jenis_prestasi').notNull(),
  penyelenggara: text('penyelenggara').notNull(),
  deskripsi: text('deskripsi'),
  bulan: integer('bulan').notNull(), // 1-12
  tahun: integer('tahun').notNull(),
  mediaSertifikat: text('media_sertifikat').references(() => medias.id, {
    onDelete: 'set null',
  }),
  mediaFotoAwarding: text('media_foto_awarding').references(() => medias.id, {
    onDelete: 'set null',
  }),
  mediaFotoPribadi: text('media_foto_pribadi').references(() => medias.id, {
    onDelete: 'set null',
  }),
  competitionType: competitionTypeEnum('competition_type'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const prestasiRelations = relations(prestasi, ({ one }) => ({
  user: one(users, {
    fields: [prestasi.userId],
    references: [users.id],
  }),
  mediaSertifikat: one(medias, {
    fields: [prestasi.mediaSertifikat],
    references: [medias.id],
  }),
  mediaFotoAwarding: one(medias, {
    fields: [prestasi.mediaFotoAwarding],
    references: [medias.id],
  }),
  mediaFotoPribadi: one(medias, {
    fields: [prestasi.mediaFotoPribadi],
    references: [medias.id],
  }),
}));

export const propertyCategoryEnum = pgEnum('property_category', [
  'sekre',
  'properti',
]);

export const propertyStatusEnum = pgEnum('property_status', [
  'available',
  'in_use',
]);

export const propertyConditionEnum = pgEnum('property_condition', [
  'good',
  'cant_be_used',
  'lost',
  'broken',
]);

export const propertyLocationEnum = pgEnum('property_location', [
  'Sekretariat 1',
  'Sekretariat 2',
  'Jatinangor',
]);

export const properti = pgTable('properti', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: propertyCategoryEnum('category').notNull(),
  status: propertyStatusEnum('status').default('available'),
  condition: propertyConditionEnum('condition').default('good').notNull(),
  quantity: integer('quantity').default(1).notNull(),
  location: text('location').notNull().default('Sekretariat 1'),
  photo: varchar('photo', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const propertiRelations = relations(properti, ({ many }) => ({
  peminjaman: many(peminjaman),
  laporan: many(laporan),
}));

export const loanStatusEnum = pgEnum('loan_status', [
  'pending',
  'rejected',
  'accepted',
  'pending_return',
  'completed',
]);

export const peminjamanTypeEnum = pgEnum('jenis_peminjaman', [
  'eksklusif',
  'non-eksklusif',
]);

export const peminjaman = pgTable('peminjaman', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  title: varchar('title', { length: 255 }).notNull(),
  propertyId: text('property_id')
    .notNull()
    .references(() => properti.id, { onDelete: 'cascade' }),
  borrowerName: varchar('borrower_name', { length: 255 }).notNull(),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  status: loanStatusEnum('status').default('pending').notNull(),
  alasan: text('alasan'),
  jenisPeminjaman: peminjamanTypeEnum('jenis_peminjaman')
    .default('non-eksklusif')
    .notNull(),

  buktiFotoUrl: text('bukti_foto_url'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const peminjamanRelations = relations(peminjaman, ({ one }) => ({
  properti: one(properti, {
    fields: [peminjaman.propertyId],
    references: [properti.id],
  }),
}));

export const laporanStatusEnum = pgEnum('laporan_status', [
  'pending',
  'accepted',
  'rejected',
]);

export const laporan = pgTable('laporan', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => createId()),
  propertiId: text('properti_id')
    .notNull()
    .references(() => properti.id, { onDelete: 'cascade' }),
  pelaporId: text('pelapor_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  deskripsi: text('deskripsi').notNull(),
  fotoUrl: text('foto_url'),
  status: laporanStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const laporanRelations = relations(laporan, ({ one }) => ({
  properti: one(properti, {
    fields: [laporan.propertiId],
    references: [properti.id],
  }),
  pelapor: one(users, {
    fields: [laporan.pelaporId],
    references: [users.id],
  }),
}));
