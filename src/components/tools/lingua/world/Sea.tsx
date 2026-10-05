import React, { useMemo } from "react";
import * as THREE from "three";
import { mix, usePack } from "./toon";

export const SEA_Y = -4.4;

/** The sea the terraces float on: a flat plane that brightens toward the horizon (the far, north-west side). */
export function Sea() {
  const { palette } = usePack().world;
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 256, 0, 0); // canvas bottom = uv v 0 = near edge (south)
    g.addColorStop(0.3, mix(palette.water, "#000010", 0.35));
    g.addColorStop(0.5, palette.water);
    g.addColorStop(0.7, mix(palette.water, palette.sky[1], 0.6));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 4, 256);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.center.set(0.5, 0.5);
    t.rotation = -Math.PI / 4; // gradient along the screen's vertical, not along the world's z
    return t;
  }, [palette]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SEA_Y, 0]} raycast={() => null} userData={{ noOcclude: true }}>
      <planeGeometry args={[160, 160]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}
