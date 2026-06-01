import { ensureSchema } from '../lib/db';

await ensureSchema();
console.log('[db] Schema ready (categories, works).');
process.exit(0);
