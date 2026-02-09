import { z } from 'zod';
import { PeminjamanSchema } from './peminjaman.types';
import { PropertiSchema } from './properti.types';

export const PeminjamanRequestSchema = PeminjamanSchema.extend({
  alasan: z.string().nullable(),
  jenisPeminjaman: z.enum(['eksklusif', 'non-eksklusif']),
  properti: PropertiSchema,
  createdAt: z.coerce.date(),
  buktiFotoUrl: z.string().nullable(),
});

export const LaporanSchema = z.object({
  id: z.string(),
  propertiId: z.string(),
  pelaporId: z.string(),
  deskripsi: z.string(),
  fotoUrl: z.string().nullable(),
  status: z.enum(['pending', 'accepted', 'rejected']),
  createdAt: z.coerce.date(),
  properti: PropertiSchema,
  pelapor: z.object({
    id: z.string(),
    fullName: z.string(),
    nim: z.string(),
  }),
});

export const GetRequestParamsSchema = z
  .object({
    category: z.enum(['sekre', 'properti']).optional(),
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
          description: 'Search by borrower name or title',
          example: 'John',
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
  .openapi('GetRequestParamsSchema');

export const GetLaporanParamsSchema = z
  .object({
    category: z.enum(['sekre', 'properti']).optional(),
    status: z
      .enum(['pending', 'accepted', 'rejected'])
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
          description: 'Search by description',
          example: 'rusak',
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
  .openapi('GetLaporanParamsSchema');

export const PeminjamanScheduleItemSchema = z.object({
  startDate: z.union([z.string().datetime(), z.date()]),
  endDate: z.union([z.string().datetime(), z.date()]),
  jenisPeminjaman: z.enum(['eksklusif', 'non-eksklusif']),
});

export const PeminjamanScheduleResponseSchema = z.object({
  propertyId: z.string(),
  schedules: z.array(PeminjamanScheduleItemSchema),
});

export const PeminjamanIdParamSchema = z.object({
  peminjamanId: z.string(),
});

export const LaporanIdParamSchema = z.object({
  laporanId: z.string(),
});

export const UpdatePeminjamanStatusSchema = z
  .object({
    status: z.enum(['accepted', 'rejected', 'completed']),
  })
  .openapi('UpdatePeminjamanStatusSchema');

export const UpdateLaporanStatusSchema = z
  .object({
    status: z.enum(['accepted', 'rejected']),
  })
  .openapi('UpdateLaporanStatusSchema');

export const PaginatedPeminjamanRequestSchema = z.object({
  requests: z.array(PeminjamanRequestSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

export const PaginatedLaporanSchema = z.object({
  laporan: z.array(LaporanSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
