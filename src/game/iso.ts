export interface GridPos {
  col: number;
  row: number;
}

export const TILE_WIDTH = 170;
export const TILE_HEIGHT = 85;

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
