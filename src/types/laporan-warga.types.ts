import { z } from 'zod';
import { LaporanSchema } from '~/types/request-laporan.types';

export const CreateLaporanBodySchema = z
  .object({
    propertiId: z.string().openapi({
      description: 'ID properti yang dilaporkan',
      example: 'clx123abc',
    }),
    deskripsi: z.string().min(1, 'Deskripsi laporan tidak boleh kosong'),
    fotoUrl: z.string().url().optional().nullable().openapi({
      description: 'URL opsional ke foto bukti laporan',
      example: 'https://cdn.example.com/laporan/foto.jpg',
    }),
  })
  .openapi('CreateLaporanBodySchema');

export const LaporanWargaResponseSchema = LaporanSchema;
