import { Hook, OpenAPIHono, z } from '@hono/zod-openapi';
import { jwt } from 'hono/jwt';
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

  // JWT Hono Middleware
  // authRouter.use(
  //   jwt({
  //     secret: env.JWT_SECRET,
  //     cookie: 'hmif-app.access-cookie',
  //   }),
  // );

  // Set user middleware
  authRouter.use(async (c, next) => {
    // const payload = JWTPayloadSchema.parse(c.var.jwtPayload);
    // c.set('user', payload);
    await next();
  });

  return authRouter;
}
