import { z } from '@hono/zod-openapi';
import { createSelectSchema } from 'drizzle-zod';
import { prestasi } from '~/db/schema';

const UserPrestasiSchema = z.object({
  id: z.string(),
  nim: z.string(),
  fullName: z.string(),
  picture: z.string().nullable(),
});

export const PrestasiSchema = createSelectSchema(prestasi, {
  createdAt: z.union([z.string(), z.date()]),
})
  .omit({
    mediaSertifikat: true,
    mediaFotoAwarding: true,
    mediaFotoPribadi: true,
  })
  .extend({
    user: UserPrestasiSchema.optional(),
  })
  .openapi('Prestasi');

export const ListPrestasiSchema = z.object({
  prestasi: z.array(PrestasiSchema),
  total: z.number(),
});

export const ListPrestasiQuerySchema = z.object({
  category: z
    .enum(['competition', 'organization', 'committee'])
    .optional()
    .openapi({
      param: {
        in: 'query',
        description: 'Filter by category',
        example: 'competition',
      },
    }),
  start_date: z
    .string()
    .optional()
    .openapi({
      param: {
        in: 'query',
        description: 'Start date filter (YYYY-MM format)',
        example: '2025-01',
      },
    }),
  end_date: z
    .string()
    .optional()
    .openapi({
      param: {
        in: 'query',
        description: 'End date filter (YYYY-MM format)',
        example: '2025-12',
      },
    }),
  page: z.coerce.number().int().positive().default(1).openapi({
    param: {
      in: 'query',
      description: 'Page number',
      example: 1,
    },
  }),
  limit: z.coerce.number().int().positive().default(10).openapi({
    param: {
      in: 'query',
      description: 'Number of items per page',
      example: 10,
    },
  }),
});
