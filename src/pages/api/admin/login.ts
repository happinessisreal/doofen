import type { APIRoute } from 'astro';
import { checkLogin, createSessionToken, SESSION_COOKIE } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const form = await request.formData();
  const password = String(form.get('password') ?? '');

  if (!checkLogin(password)) {
    return redirect('/admin?error=auth', 303);
  }

  const token = await createSessionToken();
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: import.meta.env.PROD,
    maxAge: 60 * 60 * 12,
  });
  return redirect('/admin', 303);
};
