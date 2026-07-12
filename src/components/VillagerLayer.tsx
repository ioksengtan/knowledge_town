const EMOJIS = ['🧑‍🌾', '👷', '🧑‍🔬', '🧑‍💻', '🧑‍🏭'];

export interface VillagerSpot {
  x: number; // px, relative to the canvas center — same coordinate space as iso tile positions
  y: number;
  duration: number;
  delay: number;
}

// Purely decorative — spots are precomputed by the caller via
// generateVillagerSpots() (src/game/iso.ts), which rejects any point that
// falls inside a building/label's bounding box. This component just
// renders them; it does no positioning math of its own, so it can't
// reintroduce overlap.
export default function VillagerLayer({ spots }: { spots: VillagerSpot[] }) {
  return (
    <div className="villager-layer" aria-hidden="true">
      {spots.map((v, i) => (
        <span
          key={i}
          className="villager"
          style={{
            left: `calc(50% + ${v.x}px)`,
            top: `calc(50% + ${v.y}px)`,
            animationDuration: `${v.duration}s`,
            animationDelay: `${v.delay}s`,
          }}
        >
          {EMOJIS[i % EMOJIS.length]}
        </span>
      ))}
    </div>
  );
}
