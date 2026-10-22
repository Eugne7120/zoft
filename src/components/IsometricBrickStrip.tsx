import React from 'react';

interface IsometricBrickStripProps {
  /** Current value from 0 to 100 */
  valuePercent: number;
  /** Number of 3D isometric bricks in the strip */
  totalBricks?: number;
  /** Primary active top/front/side colors */
  activeScheme?: 'white' | 'emerald' | 'amber';
  /** Secondary remainder color scheme (e.g. for Shielded Change Note bricks) */
  showRemainderAsSecondary?: boolean;
  /** Optional click handler to set percentage directly by clicking a brick */
  onSelectPercent?: (percent: number) => void;
  ariaLabel?: string;
}

const COLOR_SCHEMES = {
  white: {
    top: '#ffffff',
    front: '#d4d4d8',
    side: '#71717a',
    glow: 'rgba(255,255,255,0.28)',
  },
  emerald: {
    top: '#34d399',
    front: '#10b981',
    side: '#047857',
    glow: 'rgba(16,185,129,0.28)',
  },
  amber: {
    top: '#fbbf24',
    front: '#f59e0b',
    side: '#b45309',
    glow: 'rgba(245,158,11,0.28)',
  },
  secondary: {
    top: '#52525b',
    front: '#3f3f46',
    side: '#27272a',
    glow: 'transparent',
  },
  inactive: {
    top: '#1f2028',
    front: '#16171d',
    side: '#101115',
    glow: 'transparent',
  },
};

export const IsometricBrickStrip: React.FC<IsometricBrickStripProps> = ({
  valuePercent,
  totalBricks = 18,
  activeScheme = 'white',
  showRemainderAsSecondary = false,
  onSelectPercent,
  ariaLabel = '3D Isometric Parameter Bricks',
}) => {
  const activeCount = Math.round((Math.max(0, Math.min(100, valuePercent)) / 100) * totalBricks);

  return (
    <div
      className="flex items-center gap-0.5 py-1.5 select-none overflow-x-auto"
      role="group"
      aria-label={ariaLabel}
    >
      {Array.from({ length: totalBricks }).map((_, idx) => {
        const isPrimary = idx < activeCount;
        const palette = isPrimary
          ? COLOR_SCHEMES[activeScheme]
          : showRemainderAsSecondary
            ? COLOR_SCHEMES.secondary
            : COLOR_SCHEMES.inactive;

        const targetPct = Math.round(((idx + 1) / totalBricks) * 100);

        return (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPercent?.(targetPct)}
            disabled={!onSelectPercent}
            aria-label={`Set to ${targetPct}%`}
            className={`group relative flex-1 min-w-[14px] h-9 flex items-center justify-center transition-transform duration-150 ${
              onSelectPercent ? 'cursor-pointer hover:-translate-y-0.5' : 'cursor-default'
            }`}
          >
            <svg
              viewBox="0 0 24 34"
              className="w-full h-full overflow-visible"
              style={{
                filter: isPrimary ? `drop-shadow(0 2px 5px ${palette.glow})` : 'none',
              }}
            >
              {/* Top Isometric Face */}
              <polygon
                points="4,8 16,2 22,8 10,14"
                fill={palette.top}
                className="transition-colors duration-150"
              />
              {/* Front Left Face */}
              <polygon
                points="4,8 10,14 10,32 4,26"
                fill={palette.front}
                className="transition-colors duration-150"
              />
              {/* Side Right Extrusion Face */}
              <polygon
                points="10,14 22,8 22,26 10,32"
                fill={palette.side}
                className="transition-colors duration-150"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
};
