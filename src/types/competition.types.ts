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
