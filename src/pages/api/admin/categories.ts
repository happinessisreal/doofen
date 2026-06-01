import type { APIRoute } from 'astro';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategoryImageUrls,
} from '../../../lib/db';
import { deleteImage } from '../../../lib/storage';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('_action') ?? '');

  try {
    if (action === 'create') {
      const name = String(form.get('name') ?? '').trim();
      const description = String(form.get('description') ?? '').trim() || null;
      if (name) await createCategory(name, description);
    } else if (action === 'update') {
      const id = Number(form.get('id'));
      const name = String(form.get('name') ?? '').trim();
      const description = String(form.get('description') ?? '').trim() || null;
      if (id && name) await updateCategory(id, name, description);
    } else if (action === 'delete') {
      const id = Number(form.get('id'));
      if (id) {
        const images = await listCategoryImageUrls(id);
        await deleteCategory(id);
        for (const url of images) await deleteImage(url);
      }
    }
  } catch (err) {
    console.error('[admin/categories]', err);
    return redirect('/admin?error=1', 303);
  }
  return redirect('/admin', 303);
};
