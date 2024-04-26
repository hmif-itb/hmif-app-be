import { loginRoute, authCallbackRoute } from '../routes/login.route';
import { createRouter } from './router-factory';
import 'dotenv/config';
import { env } from '~/configs/env.config';
import { FindUserByEmail } from '~/repositories/login.repo';
import { db } from '~/db/drizzle';
import jwt from 'jsonwebtoken';

export const loginRouter = createRouter();

// All of this function will be moved, right now its just to ensure it works (or not)
function generateJWT(payload: object, secret: string, expiresIn: string) {
  return jwt.sign(payload, secret, { expiresIn });
}

loginRouter.openapi(loginRoute, async (c) => {
  const authorizationUrl = new URL(
    'https://accounts.google.com/o/oauth2/v2/auth',
  );

  // Make sure you define all of the google env in your .env file
  authorizationUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID || '');
  authorizationUrl.searchParams.set(
    'redirect_uri',
    env.GOOGLE_CALLBACK_URL || '',
  );
  authorizationUrl.searchParams.set('prompt', 'consent');
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set('scope', 'openid email profile');
  authorizationUrl.searchParams.set('access_type', 'offline');

  // Redirect the user to Google Login
  return c.json({}, 302, {
    Location: authorizationUrl.toString(),
  });
});

loginRouter.openapi(authCallbackRoute, async (c) => {
  const code = new URL(c.req.raw.url).searchParams.get('code');
  if (!code) {
    return c.json({
      error: 'error while parsing search params',
    });
  }
  try {
    const tokenEndpoint = new URL('https://accounts.google.com/o/oauth2/token');
    tokenEndpoint.searchParams.set('code', code);
    tokenEndpoint.searchParams.set('grant_type', 'authorization_code');

    // Make sure you define all of the google env in your .env file
    tokenEndpoint.searchParams.set('client_id', env.GOOGLE_CLIENT_ID || '');
    tokenEndpoint.searchParams.set(
      'client_secret',
      env.GOOGLE_CLIENT_SECRET || '',
    );
    tokenEndpoint.searchParams.set(
      'redirect_uri',
      env.GOOGLE_CALLBACK_URL || '',
    );

    // Fetch Token Data from Token endpoint url
    const tokenResponse = await fetch(
      tokenEndpoint.origin + tokenEndpoint.pathname,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenEndpoint.searchParams.toString(),
      },
    );
    const tokenData = await tokenResponse.json();

    // Get the access_token from the Token fetch response
    const accessToken = tokenData.access_token;
    const userInfoResponse = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    // Get user info via that fetched access_token
    const userInfo = await userInfoResponse.json();
    const { email, name, picture } = userInfo;

    // Find user in db, if not found return forbidden
    const user = await FindUserByEmail(db, email);
    if (!user) {
      return c.json(
        {
          message: 'Forbidden',
        },
        403,
      );
    }

    // Create cookie
    const tokenPayload = { email, name, picture };
    const cookie = generateJWT(tokenPayload, env.JWT_SECRET, '1h');
    return c.json({}, 200, {
      Location: 'http://localhost:5173', // Todo change url continuation after logging in,
      'Set-Cookie': `hmif-app.access-cookie=${cookie}; Path=/; HttpOnly`,
    });
  } catch (error) {
    return c.json(
      {
        message: error,
      },
      500,
    );
  }
});
