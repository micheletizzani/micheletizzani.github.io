import { buildGrid, type NavGrid } from "../maruNav";
import { makeTerrain, type Terrain } from "../maruTerrain";
import type { LanguagePack } from "./types";

/** Fixed pieces of every scenery, at fixed positions (the pump/fountain on the quay and the kiosk/stall). */
export const FIXTURES = {
  centrePiece: { x: 0, z: 2, r: 2.4 },
  kiosk: { x: -7.6, z: -0.4, hx: 1.7, hz: 1.1 },
};

export const EDGE_MARGIN = 0.4;

export function packTerrain(pack: LanguagePack): Terrain {
  return makeTerrain(pack.world.tiers, pack.world.stairs);
}

/** Where nobody can stand: the sea, the terrace edges, buildings, fixtures (and optionally people). */
export function packSolid(pack: LanguagePack, terrain: Terrain, withPeople = false) {
  return (x: number, z: number) => {
    if (!terrain.walkable(x, z, EDGE_MARGIN)) return true;
    for (const b of pack.world.buildings)
      if (Math.abs(x - b.position[0]) < b.size[0] / 2 + 0.45 && Math.abs(z - b.position[2]) < b.size[2] / 2 + 0.45) return true;
    const c = FIXTURES.centrePiece;
    if (Math.hypot(x - c.x, z - c.z) < c.r) return true;
    const k = FIXTURES.kiosk;
    if (Math.abs(x - k.x) < k.hx && Math.abs(z - k.z) < k.hz) return true;
    if (withPeople) for (const n of pack.world.npcs) if (Math.hypot(x - n.position[0], z - n.position[2]) < 0.6) return true;
    return false;
  };
}

export function packGrid(pack: LanguagePack, withPeople = false): { grid: NavGrid; terrain: Terrain } {
  const terrain = packTerrain(pack);
  const b = terrain.bounds;
  const grid = buildGrid(b.minX - 0.5, b.maxX + 0.5, b.minZ - 0.5, b.maxZ + 0.5, 0.5, packSolid(pack, terrain, withPeople), (x, z) =>
    terrain.groundY(x, z)
  );
  return { grid, terrain };
}
