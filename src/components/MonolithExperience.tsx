import React, { useState } from 'react';
import { MonolithCanvas } from './MonolithCanvas';
import { ServiceDrawer, type ActiveItem } from './ServiceDrawer';
import { useIsMobile } from './useIsMobile';

/**
 * Desktop home experience: the full-screen, scroll-driven monolith with its
 * orbiting service/product satellites. On mobile we render nothing here — the
 * bento home owns the layout and uses the contained <MonolithTile/> instead, so
 * only one WebGL context is ever live.
 */
export const MonolithExperience: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);

  const handleSelectItem = (item: ActiveItem) => setActiveItem(item);
  const handleCloseDrawer = () => setActiveItem(null);

  if (isMobile) return null;

  return (
    <>
      {/* 3D WebGL Spatial Viewport */}
      <div className="canvas-wrapper">
        <MonolithCanvas onSelectItem={handleSelectItem} />
      </div>

      {/* 2D Brutalist Detail Drawer */}
      <ServiceDrawer activeItem={activeItem} onClose={handleCloseDrawer} />
    </>
  );
};
