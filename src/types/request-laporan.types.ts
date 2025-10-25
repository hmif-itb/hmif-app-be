import { z } from 'zod';
import { PeminjamanSchema } from './peminjaman.types';
import { PropertiSchema } from './properti.types';
import { properti, users } from '~/db/schema';

export const PeminjamanRequestSchema = PeminjamanSchema.extend({
  alasan: z.string().nullable(),
  jenisPeminjaman: z.enum(['eksklusif', 'non-eksklusif']),
  properti: PropertiSchema,
  createdAt: z.coerce.date()
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

export const GetRequestParamsSchema = z.object({
  category: z.enum(['sekre', 'properti']).optional(),
}).openapi('GetRequestParamsSchema');

export const GetLaporanParamsSchema = z.object({
  category: z.enum(['sekre', 'properti']).optional(),
}).openapi('GetLaporanParamsSchema');

export const PeminjamanIdParamSchema = z.object({
  peminjamanId: z.string(),
});

export const LaporanIdParamSchema = z.object({
  laporanId: z.string(),
});

export const UpdatePeminjamanStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
}).openapi('UpdatePeminjamanStatusSchema');

export const UpdateLaporanStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
}).openapi('UpdateLaporanStatusSchema');