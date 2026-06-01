/** Helpers for turning a pasted YouTube URL into an id, thumbnail, and embed URL. */

/**
 * Extract the 11-char video id from the common YouTube URL forms:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/embed/ID
 *   https://www.youtube.com/shorts/ID
 * Returns null if no id can be found.
 */
export function parseYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Already a bare id.
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;

  const patterns = [
    /[?&]v=([\w-]{11})/,
    /youtu\.be\/([\w-]{11})/,
    /\/embed\/([\w-]{11})/,
    /\/shorts\/([\w-]{11})/,
    /\/live\/([\w-]{11})/,
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  return null;
}

export function thumbnailUrl(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function embedUrl(id: string, autoplay = true): string {
  const params = autoplay ? '?autoplay=1&rel=0' : '?rel=0';
  return `https://www.youtube.com/embed/${id}${params}`;
}
