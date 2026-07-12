import type { BuildingCategory } from '../game/types';
import { appearanceStage } from '../game/logic';
import { bodyColor, CATEGORY_ICON, TOWNHALL_ICON, trimOpacity } from '../game/palette';

interface Props {
  category: BuildingCategory | 'townhall';
  level: number;
  size?: number;
  label?: string;
}

export default function BuildingSprite({ category, level, size = 88, label }: Props) {
  const stage = appearanceStage(level);
  const color = bodyColor(category, stage);
  const trim = trimOpacity(stage);
  const roofHeight = size * 0.28 + stage * 4;

  return (
    <div
      className="building-sprite"
      style={{ width: size, height: size }}
      title={label}
    >
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
      <div className="building-sprite__stage">
        {'★'.repeat(stage)}
        <span className="building-sprite__stage-empty">{'☆'.repeat(5 - stage)}</span>
      </div>
    </div>
  );
}
