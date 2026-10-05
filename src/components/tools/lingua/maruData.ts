// World constants shared by the 3D scene, the nav grid and the pack validator.
// Units are metres on the ground plane (x east, z south).

export const WORLD = { minX: -15, maxX: 15, minZ: -17, maxZ: 12, quayZ: 8.3 };

export const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
