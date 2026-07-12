import { useMemo } from 'react';

interface Props {
  count: number;
}

const EMOJIS = ['🧑‍🌾', '👷', '🧑‍🔬', '🧑‍💻', '🧑‍🏭'];

export default function VillagerLayer({ count }: Props) {
  // Purely decorative — position/timing are randomized once per count change,
  // not stored anywhere (spec 5.11: no data model impact).
  const villagers = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        emoji: EMOJIS[i % EMOJIS.length],
        top: 8 + Math.random() * 78,
        left: 4 + Math.random() * 88,
        duration: 5 + Math.random() * 5,
        delay: Math.random() * 4,
      })),
    [count]
  );

  return (
    <div className="villager-layer" aria-hidden="true">
      {villagers.map((v) => (
        <span
          key={v.id}
          className="villager"
          style={{
            top: `${v.top}%`,
            left: `${v.left}%`,
            animationDuration: `${v.duration}s`,
            animationDelay: `${v.delay}s`,
          }}
        >
          {v.emoji}
        </span>
      ))}
    </div>
  );
}
