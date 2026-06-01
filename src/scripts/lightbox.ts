/**
 * Shared shadowbox/lightbox. Call initLightbox() on any page that has cards
 * marked `data-lightbox`. Each such card supplies:
 *   data-media-type = "video" | "image"
 *   data-embed      = YouTube embed URL (for video)
 *   data-image      = full image URL (for image)
 *   data-title      = caption
 * The overlay element is created on demand, so pages don't need markup for it.
 */
export function initLightbox(): void {
  let lb = document.getElementById('lightbox');
  if (!lb) {
    lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.className = 'lightbox';
    lb.hidden = true;
    lb.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="Close">×</button><div class="lightbox-stage"></div>';
    document.body.appendChild(lb);
  }
  const overlay = lb;
  const stage = overlay.querySelector('.lightbox-stage') as HTMLElement;

  const close = () => {
    overlay.hidden = true;
    stage.innerHTML = ''; // unloads any iframe, stopping playback
    document.body.style.overflow = '';
  };
  overlay.querySelector('.lightbox-close')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) close(); });

  const open = (card: HTMLElement) => {
    const type = card.dataset.mediaType;
    stage.innerHTML = '';
    if (type === 'video' && card.dataset.embed) {
      const frame = document.createElement('div');
      frame.className = 'lightbox-frame';
      const iframe = document.createElement('iframe');
      iframe.src = card.dataset.embed;
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.setAttribute('allowfullscreen', '');
      frame.appendChild(iframe);
      stage.appendChild(frame);
    } else if (type === 'image' && card.dataset.image) {
      const img = document.createElement('img');
      img.src = card.dataset.image;
      img.alt = card.dataset.title ?? '';
      img.className = 'lightbox-img';
      stage.appendChild(img);
    } else {
      return;
    }
    const cap = document.createElement('p');
    cap.className = 'lightbox-cap';
    cap.textContent = card.dataset.title ?? '';
    stage.appendChild(cap);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  };

  document.querySelectorAll<HTMLElement>('[data-lightbox]').forEach((card) => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('a')) return; // let inner links work
      open(card);
    });
  });
}
