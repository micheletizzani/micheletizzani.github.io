// The layered ground of the world: flat terraces joined by stairs. Pure functions, no rendering.

import type { Stair, Tier } from "./packs/types";

const inside = (v: number, [a, b]: [number, number], eps = 1e-6) => v >= Math.min(a, b) - eps && v <= Math.max(a, b) + eps;

export interface Terrain {
  /** Height of the ground at a point, or null over the sea. */
  groundY: (x: number, z: number) => number | null;
  /** On the ground and at least `margin` metres from the edge. */
  walkable: (x: number, z: number, margin?: number) => boolean;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number; maxY: number; minY: number };
}

export function makeTerrain(tiers: readonly Tier[], stairs: readonly Stair[]): Terrain {
  const groundY = (x: number, z: number): number | null => {
    for (const s of stairs) {
      if (!inside(x, s.x) || !inside(z, s.z)) continue;
      const [lo, hi] = s.axis === "z" ? [Math.min(...s.z), Math.max(...s.z)] : [Math.min(...s.x), Math.max(...s.x)];
      const t = ((s.axis === "z" ? z : x) - lo) / (hi - lo);
      return s.y0 + (s.y1 - s.y0) * Math.min(1, Math.max(0, t));
    }
    let best: number | null = null;
    for (const t of tiers) if (inside(x, t.x) && inside(z, t.z) && (best === null || t.y > best)) best = t.y;
    return best;
  };
  const walkable = (x: number, z: number, margin = 0) => {
    if (groundY(x, z) === null) return false;
    if (margin <= 0) return true;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]]) if (groundY(x + dx * margin, z + dz * margin) === null) return false;
    return true;
  };
  const xs = [...tiers.flatMap((t) => t.x), ...stairs.flatMap((s) => s.x)];
  const zs = [...tiers.flatMap((t) => t.z), ...stairs.flatMap((s) => s.z)];
  const ys = [...tiers.map((t) => t.y), ...stairs.flatMap((s) => [s.y0, s.y1])];
  return { groundY, walkable, bounds: { minX: Math.min(...xs), maxX: Math.max(...xs), minZ: Math.min(...zs), maxZ: Math.max(...zs), maxY: Math.max(...ys), minY: Math.min(...ys) } };
}
