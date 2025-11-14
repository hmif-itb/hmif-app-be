import { z } from 'zod';
import { PeminjamanSchema } from '~/types/peminjaman.types';
import { PropertiSchema } from '~/types/properti.types';

export const PeminjamanAktifSchema = PeminjamanSchema.extend({
  properti: PropertiSchema.optional(),
}).openapi('PeminjamanAktifSchema');

export const PeminjamanIdParamSchema = z
  .object({
    peminjamanId: z.string(),
  })
  .openapi('PeminjamanIdParamSchema');

export const SubmitPengembalianBodySchema = z
  .object({
    buktiFotoUrl: z.string().url().openapi({
      example: 'https://cdn.example.com/bukti/foto.jpg',
      description: 'URL ke foto bukti pengembalian yang sudah di-upload.',
    }),
  })
  .openapi('SubmitPengembalianBodySchema');
