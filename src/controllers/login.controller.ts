import { loginRoute, authCallbackRoute } from '../routes/login.route';
import { createRouter } from './router-factory';
import 'dotenv/config';
import crypto from 'node:crypto'
import { env } from '~/configs/env.config';


export const loginRouter = createRouter();

// All of this function will be moved, right now its just to ensure it works (or not)
function generateJWT(payload: any, secret: any, expiresIn: any) {
    const header = { alg: 'HS256', typ: 'JWT' }
    const encodedHeader = base64UrlEncode(JSON.stringify(header))
    const encodedPayload = base64UrlEncode(payload)
    const signature = sign(`${encodedHeader}.${encodedPayload}`, secret)
    return `${encodedHeader}.${encodedPayload}.${signature}`
  }
  
  function base64UrlEncode(str: any) {
    const base64 = btoa(str)
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
  
  function sign(data: any, secret: any) {
    const key = parseKey(secret)
    const hmac = crypto.createHmac('sha256', key)
    hmac.update(data)
    const signature = hmac.digest('base64')
    return base64UrlEncode(signature)
  }
  
  function parseKey(key: any) {
    return crypto.createHash('sha256').update(key).digest()
  }
  
  function parseCookie(cookieHeader: any, cookieName: any) {
    if (!cookieHeader) return null
    const cookies = cookieHeader.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.split('=')
      if (name.trim() === cookieName) {
        return value.trim()
      }
    }
    return null
  }
  
  function decodeJWT(token: any) {
    const [encodedHeader, encodedPayload] = token.split('.')
    const header = JSON.parse(base64UrlDecode(encodedHeader))
    const payload = JSON.parse(base64UrlDecode(encodedPayload))
    return { header, payload }
  }
  
  function base64UrlDecode(str: string) {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const padding = base64.length % 4 === 0 ? 0 : 4 - (base64.length % 4)
    const paddedBase64 = base64 + '==='.slice(0, padding)
    return atob(paddedBase64)
  }


// This works though, will explain later
loginRouter.openapi(loginRoute, async (c) => {
    const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    // Get the Google Client ID from the env
    authorizationUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID || '')
    // Add callback URL
    authorizationUrl.searchParams.set('redirect_uri',  env.GOOGLE_CALLBACK_URL || '')
    authorizationUrl.searchParams.set('prompt', 'consent')
    authorizationUrl.searchParams.set('response_type', 'code')
    authorizationUrl.searchParams.set('scope', 'openid email profile')
    authorizationUrl.searchParams.set('access_type', 'offline')
    // Redirect the user to Google Login
    return new Response(null, {
      status: 302,
      headers: {
        Location: authorizationUrl.toString(),
      },
    })
});

loginRouter.openapi(authCallbackRoute, async (c) => {
    const code = new URL(c.req.raw.url).searchParams.get('code')
    if (!code) {
        return c.json({
            error: "error while parsing search params"
        })
    }
    try{
        const tokenEndpoint = new URL('https://accounts.google.com/o/oauth2/token')
        tokenEndpoint.searchParams.set('code', code)
        tokenEndpoint.searchParams.set('grant_type', 'authorization_code')
        // Make sure you define these in your .env file
        // Add Google Client ID from the env
        tokenEndpoint.searchParams.set('client_id', env.GOOGLE_CLIENT_ID || '')
        // Add Google Client Secret from the env
        tokenEndpoint.searchParams.set('client_secret',  env.GOOGLE_CLIENT_SECRET || '')
        // Add your own callback URL
        tokenEndpoint.searchParams.set('redirect_uri', process.env.GOOGLE_CALLBACK_URL || '')
        const tokenResponse = await fetch(tokenEndpoint.origin + tokenEndpoint.pathname, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: tokenEndpoint.searchParams.toString(),
        })
        const tokenData = await tokenResponse.json()
        // Get the access_token from the Token fetch response
        const accessToken = tokenData.access_token
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })
          // Get user info via that fetched access_token
        const userInfo = await userInfoResponse.json()
        // Destructure email, name, picture from the users' Google Account Info
        const { email, name, picture } = userInfo
        const tokenPayload = JSON.stringify({ email, name, picture })
        // Create a Cookie for the payload, i.e. user info as above
        // Set the expiration to say 1 hour
        console.log("halo")
        const cookie = generateJWT(tokenPayload, c.env.AUTH_SECRET, '1h')
    }catch(error){

    }

    return c.json({
        age: 20,
        name: 'Ultra-man',
    });
    
})

