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

export type Peminjaman = z.infer<typeof PeminjamanSchema>;
