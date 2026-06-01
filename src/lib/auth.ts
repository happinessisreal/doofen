/**
 * Stateless admin session: an HMAC-SHA256-signed cookie token (no server state,
 * so it survives serverless cold starts). Token format: `<expiryMs>.<base64urlSig>`.
 */

export const SESSION_COOKIE = 'admin_session';
const TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

const SECRET = process.env.ADMIN_SECRET || 'dev-insecure-secret-change-me';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

if (!process.env.ADMIN_SECRET || !process.env.ADMIN_PASSWORD) {
  console.warn(
    '[admin] ADMIN_SECRET / ADMIN_PASSWORD not set — using insecure dev defaults. ' +
      'Set them in .env before deploying.'
  );
}

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return Buffer.from(new Uint8Array(sig)).toString('base64url');
}

export function checkLogin(password: string): boolean {
  return typeof password === 'string' && password.length > 0 && password === PASSWORD;
}

export async function createSessionToken(): Promise<string> {
  const payload = String(Date.now() + TTL_MS);
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = await hmac(payload);
  if (sig !== expected) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp > Date.now();
}
