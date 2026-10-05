import type { BuildingSpec, NpcSpec, Stair, Tier } from "./types";

/**
 * The shared geometry of the story world: three stacked terraces joined by two flights of stairs.
 *
 *   upper terrace  D  y = 2.4   the harbour gate (back wall)
 *        ▲ stairs S2
 *   terrace        B  y = 1.2   the harbour master, the archive
 *        ▲ stairs S1
 *   quay           A  y = 0     the pump, the kiosk (start)
 *
 * Camera looks from the south-east (+x, +z). Everything TALL stands on the far edges (west and north), and
 * only low things (planters, benches, parapets) on the near edges, so no terrace is hidden behind anything.
 * `npm run packs:check` verifies connectivity; the `?debug` visibility probe verifies what the camera can see.
 */
export interface TerraceColors {
  a: [top: string, side: string];
  b: [top: string, side: string];
  d: [top: string, side: string];
  stairs: string;
}

export function terraces(c: TerraceColors): { tiers: Tier[]; stairs: Stair[] } {
  return {
    tiers: [
      { id: "quay", x: [-13.8, 9.5], z: [-5.5, 8.3], y: 0, color: c.a[0], side: c.a[1] },
      { id: "terrace", x: [-13.8, 7], z: [-12.2, -5.5], y: 1.2, color: c.b[0], side: c.b[1] },
      { id: "upper", x: [-6.5, 6.5], z: [-16.8, -12.2], y: 2.4, color: c.d[0], side: c.d[1] },
    ],
    stairs: [
      { axis: "z", x: [-1.8, 1.8], z: [-5.5, -3.5], y0: 1.2, y1: 0, color: c.stairs },
      { axis: "z", x: [-1.8, 1.8], z: [-12.2, -10], y0: 2.4, y1: 1.2, color: c.stairs },
    ],
  };
}

/** Where the story happens (metres). Shared so the map, the nav grid and the scenery agree. */
export const SPOTS = {
  fountain: { position: [0, 0, 2] as [number, number, number], approach: [0, 4.6] as [number, number] },
  vendor: { position: [-7.6, 0, -0.4] as [number, number, number], approach: [-5.6, 1.4] as [number, number] },
  guard: { position: [0, 1.2, -8.2] as [number, number, number], approach: [0, -6.4] as [number, number] },
  gate: { position: [0, 2.4, -14.4] as [number, number, number], approach: [0, -13.3] as [number, number] },
  archive: { position: [-9, 1.2, -7.4] as [number, number, number], approach: [-7.4, -7.4] as [number, number] },
};

export const NPC_SPOTS: Record<"child" | "vendor" | "guard" | "traveller" | "archivist", Pick<NpcSpec, "position" | "facing" | "scale">> = {
  child: { position: [1.4, 0, 3.1], facing: -0.6, scale: 0.7 },
  vendor: { position: [-7.2, 0, 1.0], facing: 0.4 },
  guard: { position: [0, 1.2, -8.2], facing: 0.4, scale: 1.1 },
  traveller: { position: [-1.9, 1.2, -7.0], facing: 0.9 },
  archivist: { position: [-8.1, 1.2, -7.4], facing: Math.PI / 2 },
};

/** Houses along the west edge of the quay and the terrace (the archive is the second house on the terrace). */
export function westHouses(colors: string[], roofs: string[], extra: Partial<BuildingSpec> = {}): BuildingSpec[] {
  const heights = [6.4, 7.0, 6.2, 6.8];
  const quay = [-3.9, -0.7, 2.5, 5.7].map((z, i): BuildingSpec => ({
    position: [-11.6, 0, z],
    size: [4.4, heights[i], 3.2],
    color: colors[i % colors.length],
    roof: roofs[i % roofs.length],
    faces: ["e"],
    kind: "house",
    ...extra,
  }));
  const terrace = [-10.6].map((z): BuildingSpec => ({
    position: [-11.6, 1.2, z],
    size: [4.4, 6.0, 3.2],
    color: colors[4 % colors.length],
    roof: roofs[1 % roofs.length],
    faces: ["e"],
    kind: "house",
    ...extra,
  }));
  return [...quay, ...terrace];
}
export const archiveHouse = (color: string, roof: string, extra: Partial<BuildingSpec> = {}): BuildingSpec => ({
  position: [-11.6, 1.2, -7.4],
  size: [4.4, 6.6, 3.2],
  color,
  roof,
  faces: ["e"],
  kind: "house",
  ...extra,
});
export const gateWall = (color: string, roof: string): BuildingSpec => ({
  position: [0, 2.4, -16.1],
  size: [13, 5.2, 1.4],
  color,
  roof,
  faces: ["s"],
  kind: "wall",
});
