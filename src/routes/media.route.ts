import { createRoute } from '@hono/zod-openapi';
import { BodyParamsSchema, PresignedUrlSchema } from '~/types/media.types';
import { validationErrorResponse } from '~/types/responses.type';

export const createPresignedUrl = createRoute({
  operationId: 'createPresignedUrl',
  tags: ['media'],
  method: 'post',
  path: '/media/upload',
  description: 'Creates presigned URL for file upload to S3',
  request: {
    body: {
      content: {
        'application/json': {
          schema: BodyParamsSchema,
        },
      },
      required: true,
    },
  },
  responses: {
    200: {
      description: 'Returns created presigned URL',
      content: {
        'application/json': {
          schema: PresignedUrlSchema,
        },
      },
    },
    400: validationErrorResponse,
  },
});
