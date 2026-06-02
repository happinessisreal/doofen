import React, { useState } from 'react';
import { MonolithCanvas } from './MonolithCanvas';
import { ServiceDrawer, type ActiveItem } from './ServiceDrawer';
import { Preloader } from './Preloader';

export const MonolithExperience: React.FC = () => {
  const [activeItem, setActiveItem] = useState<ActiveItem | null>(null);

  const handleSelectItem = (item: ActiveItem) => {
    setActiveItem(item);
  };

  const handleCloseDrawer = () => {
    setActiveItem(null);
  };

  return (
    <>
      {/* Branded boot-sequence overlay while the model streams in */}
      <Preloader />

      {/* 3D WebGL Spatial Viewport */}
      <div className="canvas-wrapper">
        <MonolithCanvas onSelectItem={handleSelectItem} />
      </div>

      {/* 2D Brutalist Detail Drawer */}
      <ServiceDrawer activeItem={activeItem} onClose={handleCloseDrawer} />
    </>
  );
};
