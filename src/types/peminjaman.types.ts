import { z } from 'zod';

export const PeminjamanSchema = z
  .object({
    id: z.string(),
    borrowerName: z.string(),
    propertyName: z.string(),
    startDate: z.union([z.string().datetime(), z.date()]),
    endDate: z.union([z.string().datetime(), z.date()]),
    status: z.enum([
      'pending',
      'rejected',
      'accepted',
      'pending_return',
      'completed',
    ]),
    title: z.string(),
    category: z.enum(['sekre', 'properti']),
  })
  .openapi('PeminjamanSchema');

export const GetPeminjamanParamsSchema = z
  .object({
    startDate: z.coerce.date().openapi({
      description: 'Start date in ISO format (YYYY-MM-DD)',
      example: '2025-10-01',
    }),
    endDate: z.coerce.date().openapi({
      description: 'End date in ISO format (YYYY-MM-DD)',
      example: '2025-10-31',
    }),
  })
  .openapi('GetPeminjamanParamsSchema');

export const GetPeminjamanNearingEndParamsSchema = z
  .object({
    days: z.string().optional().default('7').openapi({
      description: 'Number of days to check for nearing end loans',
      example: '7',
    }),
  })
  .openapi('GetPeminjamanNearingEndParamsSchema');

export const GetUserPeminjamanParamsSchema = z
  .object({
    category: z
      .enum(['sekre', 'properti'])
      .optional()
      .openapi({
        param: {
          in: 'query',
          description: 'Filter by category',
          example: 'properti',
        },
      }),
    status: z
      .enum(['pending', 'rejected', 'accepted', 'pending_return', 'completed'])
      .optional()
      .openapi({
        param: {
          in: 'query',
          description: 'Filter by status',
          example: 'pending',
        },
      }),
    search: z
      .string()
      .optional()
      .openapi({
        param: {
          in: 'query',
          description: 'Search by property name or title',
          example: 'laptop',
        },
      }),
    page: z.coerce
      .number()
      .int()
      .positive()
      .default(1)
      .openapi({
        param: {
          in: 'query',
          description: 'Page number',
          example: 1,
        },
      }),
    limit: z.coerce
      .number()
      .int()
      .positive()
      .default(10)
      .openapi({
        param: {
          in: 'query',
          description: 'Number of items per page',
          example: 10,
        },
      }),
  })
  .openapi('GetUserPeminjamanParamsSchema');

export const UserPeminjamanSchema = PeminjamanSchema.extend({
  alasan: z.string().nullable(),
  jenisPeminjaman: z.enum(['eksklusif', 'non-eksklusif']),
  createdAt: z.coerce.date(),
  buktiFotoUrl: z.string().nullable(),
});

export const PaginatedUserPeminjamanSchema = z.object({
  peminjaman: z.array(UserPeminjamanSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export type Peminjaman = z.infer<typeof PeminjamanSchema>;
export type UserPeminjaman = z.infer<typeof UserPeminjamanSchema>;
