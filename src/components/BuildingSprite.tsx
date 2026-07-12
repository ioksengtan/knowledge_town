import { useState } from 'react';
import type { BuildingCategory } from '../game/types';
import { appearanceStage } from '../game/logic';
import { bodyColor, CATEGORY_ICON, TOWNHALL_ICON, trimOpacity } from '../game/palette';

interface Props {
  category: BuildingCategory | 'townhall';
  level: number;
  size?: number;
  label?: string;
}

// First-pass art (see docs/implementation-decisions.md "美術素材第一版整合"):
// rough crops from a single reference sheet the art team provided, not yet
// the real per-file exports. Town Hall has no art yet, so it always uses
// the CSS placeholder.
const HAS_ART: Record<string, boolean> = { production: true, training: true, rnd: true };

export default function BuildingSprite({ category, level, size = 88, label }: Props) {
  const stage = appearanceStage(level);
  const [artFailed, setArtFailed] = useState(false);
  const useArt = category !== 'townhall' && HAS_ART[category] && !artFailed;

  return (
    <div className="building-sprite" style={{ width: size }} title={label}>
      {useArt ? (
        <img
          className="building-sprite__art"
          src={`/buildings/${category}_stage${stage}.png`}
          alt={label ?? category}
          style={{ width: size, height: 'auto' }}
          onError={() => setArtFailed(true)}
        />
      ) : (
        <PlaceholderSprite category={category} stage={stage} size={size} />
      )}
      <div className="building-sprite__stage">
        {'★'.repeat(stage)}
        <span className="building-sprite__stage-empty">{'☆'.repeat(5 - stage)}</span>
      </div>
    </div>
  );
}

function PlaceholderSprite({ category, stage, size }: { category: BuildingCategory | 'townhall'; stage: number; size: number }) {
  const color = bodyColor(category, stage);
  const trim = trimOpacity(stage);
  const roofHeight = size * 0.28 + stage * 4;

  return (
    <div style={{ width: size, height: size }}>
      <div
        className="building-sprite__roof"
        style={{
          width: size * 0.86,
          height: roofHeight,
          background: color,
          boxShadow: `0 0 0 2px rgba(240,199,102,${trim}) inset`,
        }}
      />
      <div
        className="building-sprite__body"
        style={{
          width: size,
          height: size * 0.5,
          background: `linear-gradient(180deg, ${color}, #14160f)`,
          border: `1px solid rgba(240,199,102,${trim})`,
        }}
      >
        <span className="building-sprite__icon">{category === 'townhall' ? TOWNHALL_ICON : CATEGORY_ICON[category]}</span>
      </div>
    </div>
  );
}
