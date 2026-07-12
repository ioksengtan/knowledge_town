export interface GridPos {
  col: number;
  row: number;
}

export const TILE_WIDTH = 210;
export const TILE_HEIGHT = 170;

export function isoToScreen(pos: GridPos, tileWidth = TILE_WIDTH, tileHeight = TILE_HEIGHT) {
  return {
    x: (pos.col - pos.row) * (tileWidth / 2),
    y: (pos.col + pos.row) * (tileHeight / 2),
  };
}

/**
 * Deterministic ring layout expanding outward from the origin, skipping the
 * origin itself (reserved for the Town Hall). n is 1-indexed: ringPosition(1)
 * is the first of the 8 tiles immediately surrounding the origin, then it
 * continues outward ring by ring.
 *
 * This only decides *where a slot renders on screen* — it has nothing to do
 * with *which* slot a new building gets (that's still strict sequential
 * fill by slotIndex, per docs/implementation-decisions.md). Earlier spec
 * history rejected a procedural spiral for *that* decision (which zone a
 * building's content belongs to); this is a separate, purely visual,
 * concern — how to arrange an open, unzoned plot of land so it doesn't all
 * pile up in a single row.
 */
export function ringPosition(n: number): GridPos {
  let x = 0;
  let y = 0;
  let dx = 1;
  let dy = 0;
  let steps = 1;
  let stepCount = 0;
  let turns = 0;
  for (let i = 0; i < n; i++) {
    x += dx;
    y += dy;
    stepCount++;
    if (stepCount === steps) {
      stepCount = 0;
      const nextDx = -dy;
      const nextDy = dx;
      dx = nextDx;
      dy = nextDy;
      turns++;
      if (turns % 2 === 0) steps++;
    }
  }
  return { col: x, row: y };
}

// Simple row-major grid that grows roughly square as items are added --
// matches the spec's "chessboard auto-expand" rule for the world map layer
// (a systematic overview layout, not a hand-placed build layout).
export function gridPosition(index: number, total: number): GridPos {
  const width = Math.max(1, Math.ceil(Math.sqrt(total)));
  return { col: index % width, row: Math.floor(index / width) };
}

export function isoBounds(positions: GridPos[], tileWidth = TILE_WIDTH, tileHeight = TILE_HEIGHT) {
  let maxX = tileWidth;
  let maxY = tileHeight;
  for (const pos of positions) {
    const { x, y } = isoToScreen(pos, tileWidth, tileHeight);
    maxX = Math.max(maxX, Math.abs(x) + tileWidth);
    maxY = Math.max(maxY, Math.abs(y) + tileHeight * 2);
  }
  return { width: maxX * 2, height: maxY * 2 };
}

export interface ExclusionRect {
  x: number; // px, canvas-center-relative anchor point (same as tile positions)
  y: number;
  halfWidth: number;
  top: number; // how far the box extends above the anchor
  bottom: number; // how far it extends below the anchor
}

function pointInRect(x: number, y: number, r: ExclusionRect, pad: number): boolean {
  return x > r.x - r.halfWidth - pad && x < r.x + r.halfWidth + pad && y > r.y - r.top - pad && y < r.y + r.bottom + pad;
}

/**
 * Rejection-samples villager spots inside the canvas that don't fall inside
 * any given exclusion rect (a building sprite + its label, or the Town
 * Hall). `pad` should cover both the walk-animation's horizontal travel and
 * a visual safety margin, so a villager never drifts into a label even
 * mid-animation. Spots that can't find a clear point after enough attempts
 * are simply dropped — fewer villagers is fine, an overlapping one isn't.
 */
export function generateVillagerSpots(
  count: number,
  bounds: { width: number; height: number },
  exclusions: ExclusionRect[],
  pad = 24
): { x: number; y: number }[] {
  const halfW = bounds.width / 2 - 16;
  const halfH = bounds.height / 2 - 16;
  const spots: { x: number; y: number }[] = [];
  let attempts = 0;
  const maxAttempts = count * 60;
  while (spots.length < count && attempts < maxAttempts) {
    attempts++;
    const x = (Math.random() * 2 - 1) * halfW;
    const y = (Math.random() * 2 - 1) * halfH;
    if (exclusions.some((r) => pointInRect(x, y, r, pad))) continue;
    if (spots.some((s) => Math.abs(s.x - x) < 30 && Math.abs(s.y - y) < 20)) continue;
    spots.push({ x, y });
  }
  return spots;
}
