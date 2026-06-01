import type { APIRoute } from 'astro';
import { getCategoriesWithWorks } from '../../lib/db';
import { parseYouTubeId, thumbnailUrl, embedUrl } from '../../lib/youtube';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const cats = await getCategoriesWithWorks();
    const categories = cats.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      works: c.works.map((w) => {
        const ytId = parseYouTubeId(w.video_url);
        return {
          id: w.id,
          title: w.title,
          description: w.description,
          link: w.link,
          image_url: w.image_url,
          video: ytId ? { id: ytId, embed: embedUrl(ytId) } : null,
          thumbnail: w.image_url ?? (ytId ? thumbnailUrl(ytId) : null),
          type: ytId ? 'video' : w.image_url ? 'image' : 'none',
        };
      }),
    }));
    return Response.json({ categories });
  } catch (err) {
    // Degrade gracefully (e.g. DB not configured yet) — public pages show empty state.
    console.error('[api/categories] failed:', err);
    return Response.json({ categories: [] });
  }
};
