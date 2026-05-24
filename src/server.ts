import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';

const app = new Hono();

// Enforce strict security headers (Clickjacking mitigation, CSP, and XSS shields)
app.use('*', async (c, next) => {
  // Prevent Content Type Sniffing
  c.header('X-Content-Type-Options', 'nosniff');
  // Clickjacking Shield
  c.header('X-Frame-Options', 'SAMEORIGIN');
  // Content Security Policy
  c.header(
    'Content-Security-Policy', 
    "default-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "img-src 'self' data:; " +
    "connect-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "frame-ancestors 'self';"
  );
  await next();
});

// Organization status API endpoint
app.get('/api/organization', (c) => {
  return c.json({
    organization: "Doofenshmirtz Evil Incorporated",
    director: "Dr. Heinz Doofenshmirtz",
    region: "Tri-State Area",
    status: "Dominating",
    inators: 8944
  });
});

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: "active", uptime: process.uptime() });
});

// Serve Astro static build assets
app.use('/*', serveStatic({ root: './dist' }));

const port = 3000;
const hostname = '127.0.0.1'; // TODO(security): Listen on localhost/127.0.0.1 strictly for local testing

console.log(`[DOOFENSHMIRTZ DIGITAL MONOLITH ACTIVE]`);
console.log(`Target: http://${hostname}:${port}`);

export default {
  port,
  hostname,
  fetch: app.fetch,
};
