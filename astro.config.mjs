import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';
import { loadEnv } from 'vite';

// Load .env into process.env for local dev/build so server libraries that read
// process.env directly (e.g. @vercel/postgres) and our admin auth work locally.
// On Vercel the platform injects real env vars, so existing values win.
const fileEnv = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
for (const [key, value] of Object.entries(fileEnv)) {
  if (process.env[key] === undefined) process.env[key] = value;
}

// https://astro.build/config
export default defineConfig({
  // Hybrid: pages are static by default; API routes + /admin opt into SSR
  // via `export const prerender = false`.
  output: 'hybrid',
  adapter: vercel(),
  integrations: [react()],
});
