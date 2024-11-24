import { z } from '@hono/zod-openapi';
import { addHours } from './calendar.types';
import { createSelectSchema } from 'drizzle-zod';
import { coWorkingSpaceReviews, voucherReviews } from '~/db/schema';

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

export const VoucherReviewSchema = z.object({
  userId: z.string().openapi({
    example: 'user-id',
    description: 'ID of the user who reviewed the voucher',
  }),
  voucherId: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the voucher recommendation',
  }),
  rating: z.number().int().min(1).max(5).openapi({
    example: 4,
    description: 'Rating for the voucher (1-5)',
  }),
  review: z.string().openapi({
    example: 'Good value for money!',
    description: 'Detailed review about the voucher',
  }),
});

export const PostVoucherReviewParamsSchema = z.object({
  voucherId: z.string().uuid().openapi({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'UUID of the voucher recommendation',
  }),
});

export const PostVoucherReviewBodySchema = z.object({
  rating: z.number().int().min(1).max(5).openapi({
    example: 4,
    description: 'Rating for the voucher (1-5)',
  }),
  review: z.string().openapi({
    example: 'Good value for money!',
    description: 'Detailed review about the voucher',
  }),
});

export const PostVoucherReviewResponseSchema = createSelectSchema(
  voucherReviews,
  {
    voucherId: z.string().openapi({ example: 'recommendation-id' }),
    userId: z.string().openapi({ example: 'user-id' }),
    rating: z.number().int().min(1).max(5).openapi({ example: 4 }),
    review: z.string().openapi({ example: 'Good value for money!' }),
  },
);

export const PostCoWorkingSpaceReviewParamsSchema = z.object({
  coWorkingSpaceId: z.string().openapi({
    example: 'coWorkingSpace-id',
    description: 'ID of the co-working space recommendation',
  }),
});

export const PostCoWorkingSpaceReviewResponseSchema = createSelectSchema(
  coWorkingSpaceReviews,
  {
    coWorkingSpaceId: z.string().openapi({ example: 'recommendation-id' }),
    userId: z.string().openapi({ example: 'user-id' }),
    rating: z.number().int().min(1).max(5).openapi({ example: 5 }),
    review: z
      .string()
      .openapi({ example: 'Great place with excellent Wi-Fi!' }),
  },
);

export const DeleteVoucherReviewParamsSchema = z.object({
  voucherId: z.string().openapi({
    example: 'voucher-id',
    description: 'ID of the voucher being reviewed',
  }),
  userId: z.string().openapi({
    example: 'user-id',
    description: 'ID of the review to delete',
  }),
});

export const DeleteVoucherReviewResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true,
    description: 'Indicates whether the review was deleted successfully',
  }),
});

export const DeleteCoWorkingSpaceReviewParamsSchema = z.object({
  coWorkingSpaceId: z.string().openapi({
    example: 'coWorkingSpace-id',
    description: 'ID of the co-working space recommendation',
  }),
  userId: z.string().openapi({
    example: 'user-id',
    description: 'ID of the review to delete',
  }),
});

export const DeleteCoWorkingSpaceReviewResponseSchema = z.object({
  success: z.boolean().openapi({
    example: true,
    description: 'Indicates whether the review was deleted successfully',
  }),
});
