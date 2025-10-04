import { z } from '@hono/zod-openapi';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { prestasi } from '~/db/schema';

const UserPrestasiSchema = z.object({
  id: z.string(),
  nim: z.string(),
  fullName: z.string(),
  picture: z.string().nullable(),
});

const UserPrestasiDetailSchema = z.object({
  id: z.string(),
  nim: z.string(),
  fullName: z.string(),
  email: z.string(),
  angkatan: z.number(),
  major: z.enum(['IF', 'STI']),
  picture: z.string().nullable(),
  region: z.enum(['Ganesha', 'Jatinangor']),
  gender: z.enum(['F', 'M']),
  membershipStatus: z.string(),
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

export const PrestasiDetailSchema = createSelectSchema(prestasi, {
  createdAt: z.union([z.string(), z.date()]),
})
  .extend({
    user: UserPrestasiDetailSchema.optional(),
  })
  .openapi('PrestasiDetail');

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

export const PrestasiIdParamsSchema = z.object({
  idPrestasi: z.string().openapi({
    param: {
      in: 'path',
      description: 'Id of prestasi',
      example: 'gtychnqg',
    },
  }),
});

export const CreatePrestasiSchema = createInsertSchema(prestasi, {
  bulan: z.number().int().min(1).max(12),
  tahun: z.number().int().min(2000).max(2100),
  deskripsi: z.string().min(1).optional(),
  competitionType: z.enum(['CP', 'CTF', 'BCC', 'DS', 'AI', 'Hackathon']).optional(),
})
  .extend({
    // Accept userId from request body for admin purposes
    userId: z.string().optional(),
    // Accept media URLs for form submission (similar to competitions and info)
    mediaUrls: z
      .array(z.string().url())
      .optional()
      .openapi({
        example: [
          'https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/certificate.jpg',
          'https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/awarding.jpg',
          'https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/personal.jpg',
        ],
      }),
  })
  .omit({
    id: true,
    createdAt: true,
    mediaSertifikat: true,
    mediaFotoAwarding: true,
    mediaFotoPribadi: true,
  });

export const CreatePrestasiResponseSchema = createSelectSchema(prestasi, {
  createdAt: z.union([z.string(), z.date()]),
})
  .omit({
    mediaSertifikat: true,
    mediaFotoAwarding: true,
    mediaFotoPribadi: true,
  })
  .openapi('CreatePrestasiResponse');

export const ExportPrestasiQuerySchema = z.object({
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
});

export const UpdatePrestasiBodySchema = z.object({
  jenisPrestasi: z.enum(['organisasi', 'kepanitiaan', 'kompetisi']).optional(),
  penyelenggara: z.string().min(1).optional(),
  deskripsi: z.string().optional(),
  bulan: z.number().int().min(1).max(12).optional(),
  tahun: z.number().int().min(2000).max(2100).optional(),
  competitionType: z.enum(['CP', 'CTF', 'BCC', 'DS', 'AI', 'Hackathon']).optional(),
  mediaUrls: z
    .array(z.string().url())
    .optional()
    .openapi({
      example: [
        'https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/certificate.jpg',
        'https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/awarding.jpg',
        'https://pub-45e54d5755814b02b87e024df83efb57.r2.dev/personal.jpg',
      ],
    }),
});