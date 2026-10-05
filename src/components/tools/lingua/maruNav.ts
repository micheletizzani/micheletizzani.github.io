// Grid pathfinding for point-and-click walking. Pure functions: pass in what is solid.

export interface NavGrid {
  minX: number;
  minZ: number;
  cell: number;
  cols: number;
  rows: number;
  blocked: Uint8Array;
}

export type Solid = (x: number, z: number) => boolean;

export function buildGrid(minX: number, maxX: number, minZ: number, maxZ: number, cell: number, solid: Solid): NavGrid {
  const cols = Math.ceil((maxX - minX) / cell);
  const rows = Math.ceil((maxZ - minZ) / cell);
  const blocked = new Uint8Array(cols * rows);
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) blocked[r * cols + c] = solid(minX + (c + 0.5) * cell, minZ + (r + 0.5) * cell) ? 1 : 0;
  return { minX, minZ, cell, cols, rows, blocked };
}

const toCell = (g: NavGrid, x: number, z: number): [number, number] => [
  Math.min(g.cols - 1, Math.max(0, Math.floor((x - g.minX) / g.cell))),
  Math.min(g.rows - 1, Math.max(0, Math.floor((z - g.minZ) / g.cell))),
];
const center = (g: NavGrid, c: number, r: number): [number, number] => [g.minX + (c + 0.5) * g.cell, g.minZ + (r + 0.5) * g.cell];
const isBlocked = (g: NavGrid, c: number, r: number) => c < 0 || r < 0 || c >= g.cols || r >= g.rows || g.blocked[r * g.cols + c] === 1;

/** Nearest free cell to a point (breadth-first), so clicking a wall or the water walks you to the closest open spot. */
export function nearestFree(g: NavGrid, x: number, z: number): [number, number] | null {
  const [c0, r0] = toCell(g, x, z);
  if (!isBlocked(g, c0, r0)) return [c0, r0];
  const seen = new Set<number>([r0 * g.cols + c0]);
  const queue: [number, number][] = [[c0, r0]];
  for (let q = 0; q < queue.length; q++) {
    const [c, r] = queue[q];
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const nc = c + dc;
      const nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= g.cols || nr >= g.rows || seen.has(nr * g.cols + nc)) continue;
      if (!isBlocked(g, nc, nr)) return [nc, nr];
      seen.add(nr * g.cols + nc);
      queue.push([nc, nr]);
    }
  }
  return null;
}

/** Straight-line walkability, sampled finer than the cell size. */
export function clearLine(g: NavGrid, a: [number, number], b: [number, number]) {
  const steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (g.cell * 0.4));
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const [c, r] = toCell(g, a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
    if (isBlocked(g, c, r)) return false;
  }
  return true;
}

/** A* over 8-connected cells, then string-pulled into a few waypoints. Returns [] if there is no route. */
export function findPath(g: NavGrid, from: [number, number], to: [number, number]): [number, number][] {
  const start = nearestFree(g, from[0], from[1]);
  const goal = nearestFree(g, to[0], to[1]);
  if (!start || !goal) return [];
  const id = (c: number, r: number) => r * g.cols + c;
  const open = new Map<number, { c: number; r: number; g: number; f: number }>();
  const best = new Map<number, number>();
  const parent = new Map<number, number>();
  const h = (c: number, r: number) => {
    const dx = Math.abs(c - goal[0]);
    const dz = Math.abs(r - goal[1]);
    return dx + dz + (Math.SQRT2 - 2) * Math.min(dx, dz);
  };
  open.set(id(...start), { c: start[0], r: start[1], g: 0, f: h(...start) });
  best.set(id(...start), 0);
  let found = false;
  while (open.size) {
    let cur: { c: number; r: number; g: number; f: number } | undefined;
    for (const node of open.values()) if (!cur || node.f < cur.f) cur = node;
    if (!cur) break;
    open.delete(id(cur.c, cur.r));
    if (cur.c === goal[0] && cur.r === goal[1]) {
      found = true;
      break;
    }
    for (let dc = -1; dc <= 1; dc++)
      for (let dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue;
        const nc = cur.c + dc;
        const nr = cur.r + dr;
        if (isBlocked(g, nc, nr)) continue;
        // no cutting corners between two blocked cells
        if (dc && dr && (isBlocked(g, cur.c + dc, cur.r) || isBlocked(g, cur.c, cur.r + dr))) continue;
        const cost = cur.g + (dc && dr ? Math.SQRT2 : 1);
        const key = id(nc, nr);
        if (cost >= (best.get(key) ?? Infinity)) continue;
        best.set(key, cost);
        parent.set(key, id(cur.c, cur.r));
        open.set(key, { c: nc, r: nr, g: cost, f: cost + h(nc, nr) });
      }
  }
  if (!found) return [];
  const cells: [number, number][] = [];
  for (let k: number | undefined = id(...goal); k !== undefined; k = parent.get(k)) cells.push(center(g, k % g.cols, Math.floor(k / g.cols)));
  cells.reverse();
  // string pulling
  const out: [number, number][] = [];
  let anchor: [number, number] = [from[0], from[1]];
  let i = 0;
  while (i < cells.length) {
    let j = cells.length - 1;
    while (j > i && !clearLine(g, anchor, cells[j])) j--;
    out.push(cells[j]);
    anchor = cells[j];
    i = j + 1;
  }
  return out;
}
