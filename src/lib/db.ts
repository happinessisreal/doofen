import { sql } from '@vercel/postgres';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort: number;
}

export interface Work {
  id: number;
  category_id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  link: string | null;
  sort: number;
}

export interface CategoryWithWorks extends Category {
  works: Work[];
}

export interface WorkInput {
  category_id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  video_url: string | null;
  link: string | null;
}

let schemaReady = false;

/** Create tables if they don't exist. Idempotent; cached per process. */
export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  await sql`CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    sort INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  await sql`CREATE TABLE IF NOT EXISTS works (
    id SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    video_url TEXT,
    link TEXT,
    sort INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  schemaReady = true;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'category'
  );
}

// ── Reads ──

export async function getCategoriesWithWorks(): Promise<CategoryWithWorks[]> {
  await ensureSchema();
  const cats = await sql<Category>`
    SELECT id, name, slug, description, sort FROM categories
    ORDER BY sort ASC, name ASC`;
  const works = await sql<Work>`
    SELECT id, category_id, title, description, image_url, video_url, link, sort
    FROM works ORDER BY sort ASC, id ASC`;

  const byCat = new Map<number, Work[]>();
  for (const w of works.rows) {
    const list = byCat.get(w.category_id) ?? [];
    list.push(w);
    byCat.set(w.category_id, list);
  }
  return cats.rows.map((c) => ({ ...c, works: byCat.get(c.id) ?? [] }));
}

export async function getCategoryBySlug(slug: string): Promise<CategoryWithWorks | null> {
  await ensureSchema();
  const cat = await sql<Category>`
    SELECT id, name, slug, description, sort FROM categories WHERE slug = ${slug}`;
  if (cat.rowCount === 0) return null;
  const c = cat.rows[0];
  const works = await sql<Work>`
    SELECT id, category_id, title, description, image_url, video_url, link, sort
    FROM works WHERE category_id = ${c.id} ORDER BY sort ASC, id ASC`;
  return { ...c, works: works.rows };
}

export async function getWork(id: number): Promise<Work | null> {
  await ensureSchema();
  const res = await sql<Work>`
    SELECT id, category_id, title, description, image_url, video_url, link, sort
    FROM works WHERE id = ${id}`;
  return res.rows[0] ?? null;
}

// ── Category CRUD ──

export async function createCategory(name: string, description: string | null): Promise<void> {
  await ensureSchema();
  const base = slugify(name);
  let slug = base;
  for (let i = 2; ; i++) {
    const exists = await sql`SELECT 1 FROM categories WHERE slug = ${slug}`;
    if (exists.rowCount === 0) break;
    slug = `${base}-${i}`;
  }
  await sql`INSERT INTO categories (name, slug, description)
    VALUES (${name}, ${slug}, ${description})`;
}

export async function updateCategory(
  id: number,
  name: string,
  description: string | null
): Promise<void> {
  await ensureSchema();
  await sql`UPDATE categories SET name = ${name}, description = ${description} WHERE id = ${id}`;
}

export async function deleteCategory(id: number): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM categories WHERE id = ${id}`; // works cascade
}

/** Stored image URLs for a category's works — used to clean up files on delete. */
export async function listCategoryImageUrls(categoryId: number): Promise<string[]> {
  await ensureSchema();
  const res = await sql<{ image_url: string | null }>`
    SELECT image_url FROM works WHERE category_id = ${categoryId} AND image_url IS NOT NULL`;
  return res.rows.map((r) => r.image_url).filter((u): u is string => !!u);
}

// ── Work CRUD ──

export async function createWork(w: WorkInput): Promise<void> {
  await ensureSchema();
  await sql`INSERT INTO works (category_id, title, description, image_url, video_url, link)
    VALUES (${w.category_id}, ${w.title}, ${w.description}, ${w.image_url}, ${w.video_url}, ${w.link})`;
}

export async function updateWork(id: number, w: WorkInput): Promise<void> {
  await ensureSchema();
  await sql`UPDATE works SET
    category_id = ${w.category_id},
    title = ${w.title},
    description = ${w.description},
    image_url = ${w.image_url},
    video_url = ${w.video_url},
    link = ${w.link}
    WHERE id = ${id}`;
}

export async function deleteWork(id: number): Promise<void> {
  await ensureSchema();
  await sql`DELETE FROM works WHERE id = ${id}`;
}
