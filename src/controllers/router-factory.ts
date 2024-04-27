import { Hook, OpenAPIHono, z } from '@hono/zod-openapi';
import { getCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
import { env } from '~/configs/env.config';
import { JWTPayloadSchema } from '~/types/login.types';

const defaultHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json({ errors: result.error.flatten() }, 400);
  }
};

/**
 *
 * @returns basic router with no middleware
 */
export function createRouter() {
  return new OpenAPIHono({ defaultHook });
}

/**
 * For router that use this function, it will have user object in `c.var.user`.
 * @returns router with auth middleware.
 */
export function createAuthRouter() {
  const authRouter = new OpenAPIHono<{
    Variables: {
      user: z.infer<typeof JWTPayloadSchema>;
    };
  }>({ defaultHook });

  // JWT Middleware
  authRouter.use(async (c, next) => {
    const cookies = getCookie(c, 'hmif-app.access-cookie');
    if (!cookies) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
      const jwtPayload = jwt.verify(cookies, env.JWT_SECRET);
      c.set('user', JWTPayloadSchema.parse(jwtPayload));
    } catch (error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    c.set('user', {
      id: 'djsah8dashko2hdksa',
      nim: '18221000',
      email: 'test@example.com',
      full_name: 'Test User',
      jurusan: 'Sistem dan Teknologi Informasi',
      asal_kampus: 'Ganesha',
      angkatan: 2021,
      jenis_kelamin: 'Laki-laki',
      status_keanggotaan: 'aktif',
      createdAt: new Date(),
    });
    await next();
  });

  return authRouter;
}
