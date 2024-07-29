import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { competitions } from '~/db/schema';
import { addHours } from './calendar.types';

export const CompetitionSchema = createSelectSchema(competitions, {
  registrationStart: z.union([z.string(), z.date()]),
  registrationDeadline: z.union([z.string(), z.date()]),
  createdAt: z.union([z.string(), z.date()]),
});

export const CreateCompetitionSchema = createInsertSchema(competitions, {
  registrationStart: z.coerce
    .date()
    .openapi({ example: new Date().toISOString() }),
  registrationDeadline: z.coerce.date().openapi({
    example: addHours(new Date(), 2).toISOString(),
  }),
}).omit({
  id: true,
  createdAt: true,
});

export const UpdateCompetitionBodySchema = createInsertSchema(competitions, {
  registrationStart: z.coerce.date().openapi({
    example: new Date().toISOString(),
  }),
  registrationDeadline: z.coerce.date().openapi({
    example: addHours(new Date(), 2).toISOString(),
  }),
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  organizer: z
    .string()
    .min(3, { message: 'Organizer must be at least 3 characters' }),
  sourceUrl: z.string().url({ message: 'Invalid URL' }).openapi({
    example: 'https://example.com',
  }),
  registrationUrl: z.string().url({ message: 'Invalid URL' }).openapi({
    example: 'https://example.com',
  }),
  price: z.string().min(3, { message: 'Price must be at least 3 characters' }),
})
  .partial()
  .omit({
    id: true,
    createdAt: true,
  });

export const UpdateCompetitionParamsSchema = createInsertSchema(
  competitions,
).pick({
  id: true,
});
