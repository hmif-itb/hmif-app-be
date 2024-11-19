import { z } from '@hono/zod-openapi';
import { addHours } from './calendar.types';

export const VoucherRecommendationSchema = z.object({
  title: z.string().openapi({ example: 'Voucher Recommendation Title' }),
  imageURL: z.string().openapi({ example: 'https://example.com/image.png' }),
  link: z.string().nullable().openapi({ example: 'https://example.com' }),
  startPeriod: z
    .string()
    .nullable()
    .openapi({ example: new Date().toISOString() }),
  endPeriod: z
    .string()
    .openapi({ example: addHours(new Date(), 24).toISOString() })
    .nullable(),
  description: z
    .string()
    .nullable()
    .openapi({ example: 'Voucher Recommendation Description' }),
});

export const VoucherRecommendationResponseSchema =
  VoucherRecommendationSchema.extend({
    id: z.string().openapi({ example: 'string' }),
  });

export const CoWorkingSpaceRecommendationSchema = z.object({
  title: z
    .string()
    .openapi({ example: 'Co Working Space Recommendation Title' }),
  imageURL: z.string().openapi({ example: 'https://example.com/image.png' }),
  location: z.enum(['Ganesha', 'Jatinangor']).openapi({ example: 'Ganesha' }),
  address: z.string().openapi({ example: 'Jl. Ganesha No. 1' }),
  mapsURL: z.string().openapi({ example: 'https://maps.google.com' }),
  description: z
    .string()
    .nullable()
    .openapi({ example: 'Co Working Space Recommendation Description' }),
});

export const CoWorkingSpaceRecommendationResponseSchema =
  CoWorkingSpaceRecommendationSchema.extend({
    id: z.string().openapi({ example: 'string' }),
  });
