// The isometric camera, defined once: the 3D scene, the visibility check in the validator and the tests all use it.

/** Looking from the south-east, 32° above the horizon. */
export const CAMERA = { azimuth: Math.PI / 4, elevation: (32 * Math.PI) / 180 };

/** Unit vector pointing from the scene toward the camera. */
export function towardCamera(): [number, number, number] {
  const { azimuth: a, elevation: e } = CAMERA;
  return [Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)];
}
