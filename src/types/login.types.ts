import { z } from '@hono/zod-openapi';
import { userRoles } from '~/db/schema';
import { UserSchema } from './user.types';

export const CallbackQueryParamsSchema = z.object({
  code: z.string().openapi({
    param: {
      in: 'query',
      example: '4/0AY0e-g7Qj6y2v7zR7iJ2b9b4V6K7zrZ9X0q4Q',
    },
  }),
});

export const GoogleTokenDataSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
  token_type: z.string(),
  id_token: z.string(),
});

export const GoogleUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  picture: z.string().optional(),
  email: z.string(),
  email_verified: z.string().optional(),
  locale: z.string().optional(),
  hd: z.string().optional(),
});

export const JWTPayloadSchema = UserSchema.omit({
  createdAt: true,
  lastLoginAt: true,
}).openapi('User');

export const UserResponseSchema = JWTPayloadSchema.extend({
  roles: z.array(z.enum(userRoles.role.enumValues)),
}).openapi('UserWithRoles');

export const LoginAccessTokenSchema = z.object({
  accessToken: z.string(),
});

export const LoginBypassQuerySchema = z.object({
  token: z.string(),
  nim: z.string(),
});
