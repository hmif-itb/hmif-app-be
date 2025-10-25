import { z } from 'zod';
import { PropertiSchema } from '~/types/properti.types';
import { PeminjamanSchema } from '~/types/peminjaman.types';

export const GetWargaPropertiParamsSchema = z.object({
  search: z.string().optional(),
  category: z.enum(['sekre', 'properti']).optional(),
  condition: z.enum(['good', 'broken', 'cant_be_used', 'lost']).optional(),
  sortBy: z.enum(['name_asc', 'name_desc']).optional().default('name_asc'),
}).openapi('GetWargaPropertiParamsSchema');

export const WargaPropertiSchema = PropertiSchema;

export const CreatePengajuanBodySchema = z.object({
  propertyId: z.string(),
  title: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  alasan: z.string().optional(),
  jenisPeminjaman: z.enum(['eksklusif', 'non-eksklusif']),
}).openapi('CreatePengajuanBodySchema');

export const PengajuanResponseSchema = PeminjamanSchema;