import type { APIRoute } from 'astro';
import { createWork, updateWork, deleteWork, getWork, type WorkInput } from '../../../lib/db';
import { saveImage, deleteImage } from '../../../lib/storage';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('_action') ?? '');

  try {
    if (action === 'delete') {
      const id = Number(form.get('id'));
      if (id) {
        const existing = await getWork(id);
        await deleteWork(id);
        if (existing) await deleteImage(existing.image_url);
      }
      return redirect('/admin', 303);
    }

    const category_id = Number(form.get('category_id'));
    const title = String(form.get('title') ?? '').trim();
    const description = String(form.get('description') ?? '').trim() || null;
    const link = String(form.get('link') ?? '').trim() || null;
    const video_url = String(form.get('video_url') ?? '').trim() || null;
    const file = form.get('image');
    const hasFile = file instanceof File && file.size > 0;

    if (action === 'create') {
      if (!category_id || !title) return redirect('/admin?error=1', 303);
      const image_url = hasFile ? await saveImage(file as File) : null;
      const input: WorkInput = { category_id, title, description, image_url, video_url, link };
      await createWork(input);
    } else if (action === 'update') {
      const id = Number(form.get('id'));
      const existing = id ? await getWork(id) : null;
      if (!id || !existing) return redirect('/admin?error=1', 303);

      let image_url = existing.image_url;
      if (hasFile) {
        const newUrl = await saveImage(file as File);
        await deleteImage(existing.image_url);
        image_url = newUrl;
      }
      const input: WorkInput = {
        category_id: category_id || existing.category_id,
        title: title || existing.title,
        description,
        image_url,
        video_url,
        link,
      };
      await updateWork(id, input);
    }
  } catch (err) {
    console.error('[admin/works]', err);
    return redirect('/admin?error=1', 303);
  }
  return redirect('/admin', 303);
};
