import React from 'react';

export interface ActiveItem {
  name: string;
  type: 'service' | 'product';
  description: string;
  detail?: string;
}

interface ServiceDrawerProps {
  activeItem: ActiveItem | null;
  onClose: () => void;
}

export const ServiceDrawer: React.FC<ServiceDrawerProps> = ({ activeItem, onClose }) => {
  const isOpen = activeItem !== null;

  return (
    <div 
      className={`drawer-container border-t-violet glow-box ${isOpen ? 'open' : ''}`}
      id="detail-drawer"
      aria-hidden={!isOpen}
    >
      <div className="drawer-header border-b-violet">
        <h2 style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '1.2rem', fontWeight: 'bold' }}>
          {activeItem ? `${activeItem.type}: ${activeItem.name}` : 'No Selection'}
        </h2>
        <button 
          onClick={onClose} 
          className="drawer-close"
          aria-label="Close details"
        >
          [ Close ]
        </button>
      </div>
      <div className="drawer-content">
        {activeItem ? (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <p style={{ fontSize: '1.4rem', color: '#FFF', marginBottom: '1rem', lineHeight: '1.4' }}>
              {activeItem.description}
            </p>
            {activeItem.detail && (
              <p style={{ color: 'var(--color-violet-dim)', fontSize: '0.95rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Operational Scope: {activeItem.detail}
              </p>
            )}
            <div style={{ marginTop: 'auto', display: 'flex', gap: '1.5rem', borderTop: '1px solid var(--color-violet-dim)', paddingTop: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-violet)' }}>
                COORDINATES: SYSTEM_ORBITAL_LATITUDE_VIOLET
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-violet)' }}>
                STATUS: ENERGETICALLY STABLE
              </span>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--color-violet-dim)' }}>Select a floating satellite or product artifact to analyze specs.</p>
        )}
      </div>
    </div>
  );
};
