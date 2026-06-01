import { defineMiddleware } from 'astro:middleware';
import { SESSION_COOKIE, verifySessionToken } from './lib/auth';

const CSP = [
  "default-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: https://*.public.blob.vercel-storage.com https://img.youtube.com https://i.ytimg.com",
  "connect-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "frame-ancestors 'self'",
].join('; ');

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, url } = context;

  // Guard the admin write API (the /admin page does its own auth-aware render).
  if (url.pathname.startsWith('/api/admin/') && !url.pathname.endsWith('/login')) {
    const ok = await verifySessionToken(cookies.get(SESSION_COOKIE)?.value);
    if (!ok) {
      return new Response('Unauthorized', { status: 401 });
    }
  }

  const response = await next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Content-Security-Policy', CSP);
  return response;
});
