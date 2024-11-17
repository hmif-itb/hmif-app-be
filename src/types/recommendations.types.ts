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
