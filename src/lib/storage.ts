import { randomBytes } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

// Use Vercel Blob whenever a token is present (set BLOB_READ_WRITE_TOKEN in .env
// to use Blob locally too); otherwise fall back to local public/uploads.
const useBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

function extFor(file: File): string {
  const fromName = file.name?.split('.').pop();
  if (fromName && /^[a-z0-9]+$/i.test(fromName)) return fromName.toLowerCase();
  return EXT_BY_MIME[file.type] ?? 'bin';
}

/** Persist an uploaded image and return its public URL. Throws on invalid files. */
export async function saveImage(file: File): Promise<string> {
  if (!file || file.size === 0) throw new Error('No file provided');
  if (!file.type.startsWith('image/')) throw new Error('Only image files are allowed');
  if (file.size > MAX_BYTES) throw new Error('Image too large (max 8 MB)');

  const name = `${Date.now()}-${randomBytes(6).toString('hex')}.${extFor(file)}`;

  if (useBlob()) {
    const { put } = await import('@vercel/blob');
    const blob = await put(`works/${name}`, file, { access: 'public' });
    return blob.url;
  }

  const dir = path.join(process.cwd(), 'public', 'uploads');
  await fs.mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/${name}`;
}

/** Best-effort delete of a previously stored image; never throws. */
export async function deleteImage(url: string | null | undefined): Promise<void> {
  if (!url) return;
  try {
    if (url.startsWith('http')) {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const { del } = await import('@vercel/blob');
        await del(url);
      }
    } else if (url.startsWith('/uploads/')) {
      const fp = path.join(process.cwd(), 'public', url.replace(/^\//, ''));
      await fs.rm(fp, { force: true });
    }
  } catch {
    /* cleanup is best-effort */
  }
}
