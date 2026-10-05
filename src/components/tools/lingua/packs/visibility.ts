import { towardCamera } from "../maruCamera";
import { FIXTURES, packTerrain } from "./navgrid";
import type { LanguagePack } from "./types";

interface Box {
  min: [number, number, number];
  max: [number, number, number];
}

/** Extra height of a roof above the walls (gables are the tallest). */
const ROOF = 1.9;
/** Height of the kiosk scenery (counter plus awning). */
export const KIOSK_HEIGHT = 1.9;

/**
 * Things lower than this are furniture (a cart, a bench): they hide a strip of floor behind them but not a standing person,
 * so they do not count as occluders. Anything taller must not hide walkable ground.
 */
export const LOW_FURNITURE = 2.2;

function boxes(pack: LanguagePack): Box[] {
  const out: Box[] = pack.world.buildings.map((b) => ({
    min: [b.position[0] - b.size[0] / 2, b.position[1], b.position[2] - b.size[2] / 2],
    max: [b.position[0] + b.size[0] / 2, b.position[1] + b.size[1] + (b.kind === "wall" ? 0.9 : ROOF), b.position[2] + b.size[2] / 2],
  }));
  const k = FIXTURES.kiosk;
  // The kiosk is checked too, but only counts if someone makes it taller than furniture.
  out.push({ min: [k.x - 1.3, 0, k.z - 0.7], max: [k.x + 1.3, KIOSK_HEIGHT, k.z + 0.7] });
  return out.filter((b) => b.max[1] - b.min[1] >= LOW_FURNITURE);
}

/** Does a ray from `o` toward the camera pass through the box? */
function blocked(o: [number, number, number], d: [number, number, number], b: Box): boolean {
  let t0 = 0.05;
  let t1 = Infinity;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) {
      if (o[i] < b.min[i] || o[i] > b.max[i]) return false;
    } else {
      const a = (b.min[i] - o[i]) / d[i];
      const c = (b.max[i] - o[i]) / d[i];
      t0 = Math.max(t0, Math.min(a, c));
      t1 = Math.min(t1, Math.max(a, c));
      if (t0 > t1) return false;
    }
  }
  return true;
}

export interface Visibility {
  total: number;
  hidden: [number, number][];
}

/**
 * Walkable ground (on a grid, `step` metres apart) that a building or the kiosk hides from the camera.
 * Thin things (poles, flags, people) are ignored: they hide slivers, not surfaces.
 */
export function hiddenGround(pack: LanguagePack, step = 0.5): Visibility {
  const terrain = packTerrain(pack);
  const d = towardCamera();
  const solids = boxes(pack);
  const b = terrain.bounds;
  let total = 0;
  const hidden: [number, number][] = [];
  for (let x = b.minX; x <= b.maxX; x += step)
    for (let z = b.minZ; z <= b.maxZ; z += step) {
      if (!terrain.walkable(x, z, 0.4)) continue;
      const inside = solids.some(
        (s) => x >= s.min[0] - 0.45 && x <= s.max[0] + 0.45 && z >= s.min[2] - 0.45 && z <= s.max[2] + 0.45 && (terrain.groundY(x, z) ?? 0) < s.max[1]
      );
      if (inside) continue; // not walkable anyway
      total += 1;
      const o: [number, number, number] = [x, (terrain.groundY(x, z) ?? 0) + 0.05, z];
      if (solids.some((s) => blocked(o, d, s))) hidden.push([x, z]);
    }
  return { total, hidden };
}
