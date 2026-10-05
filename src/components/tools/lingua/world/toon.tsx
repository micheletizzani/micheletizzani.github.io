import React, { createContext, useContext, useMemo } from "react";
import * as THREE from "three";
import type { LanguagePack } from "../packs/types";

/** The active pack: scenery, people, signs and colours all read from it. */
export const PackCtx = createContext<LanguagePack | null>(null);
export const usePack = () => {
  const pack = useContext(PackCtx);
  if (!pack) throw new Error("usePack must be used inside <PackCtx.Provider>");
  return pack;
};
export const useInk = () => usePack().world.palette.ink;

export type V3 = [number, number, number];

export const toonGradient = (() => {
  const data = new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]);
  const texture = new THREE.DataTexture(data, 4, 1, THREE.RGBAFormat);
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
  return texture;
})();

export function Toon({ color, emissive }: { color: string; emissive?: string }) {
  return <meshToonMaterial color={color} gradientMap={toonGradient} emissive={emissive} emissiveIntensity={emissive ? 0.9 : 0} />;
}

function Outline() {
  const ink = useInk();
  return <meshBasicMaterial color={ink} side={THREE.BackSide} />;
}

/** Box with an inverted-hull ink outline of constant thickness. */
export function Box({
  position,
  size,
  color,
  rotation,
  ink = 0.05,
  cast = true,
}: {
  position: V3;
  size: V3;
  color: string;
  rotation?: V3;
  ink?: number;
  cast?: boolean;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow={cast} receiveShadow>
        <boxGeometry args={size} />
        <Toon color={color} />
      </mesh>
      {ink > 0 && (
        <mesh>
          <boxGeometry args={[size[0] + ink * 2, size[1] + ink * 2, size[2] + ink * 2]} />
          <Outline />
        </mesh>
      )}
    </group>
  );
}

export function Round({
  position,
  radius,
  height,
  color,
  top,
  segments = 14,
  ink = 0.05,
  emissive,
}: {
  position: V3;
  radius: number;
  height: number;
  color: string;
  top?: number;
  segments?: number;
  ink?: number;
  emissive?: string;
}) {
  const topRadius = top ?? radius;
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[topRadius, radius, height, segments]} />
        <Toon color={color} emissive={emissive} />
      </mesh>
      {ink > 0 && (
        <mesh>
          <cylinderGeometry args={[topRadius + ink, radius + ink, height + ink * 2, segments]} />
          <Outline />
        </mesh>
      )}
    </group>
  );
}

export function Ball({ position, radius, color, ink = 0.04 }: { position: V3; radius: number; color: string; ink?: number }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <sphereGeometry args={[radius, 14, 12]} />
        <Toon color={color} />
      </mesh>
      {ink > 0 && (
        <mesh>
          <sphereGeometry args={[radius + ink, 14, 12]} />
          <Outline />
        </mesh>
      )}
    </group>
  );
}

/**
 * Gabled roof: a triangular prism. `across` is the span under the two slopes, `along` the ridge length.
 * With rotationY 0 the ridge runs along x; with π/2 along z.
 */
export function Gable({
  position,
  across,
  along,
  rise,
  color,
  rotationY = 0,
  ink = 0.05,
}: {
  position: V3;
  across: number;
  along: number;
  rise: number;
  color: string;
  rotationY?: number;
  ink?: number;
}) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-across / 2, 0);
    shape.lineTo(across / 2, 0);
    shape.lineTo(0, rise);
    shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: along, bevelEnabled: false });
    g.translate(0, 0, -along / 2);
    g.rotateY(Math.PI / 2); // extrusion axis -> x (ridge along x)
    return g;
  }, [across, along, rise]);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <Toon color={color} />
      </mesh>
      {ink > 0 && (
        <mesh geometry={geometry} scale={[1 + (ink * 2) / along, 1 + (ink * 2) / rise, 1 + (ink * 2) / across]} position={[0, -ink * 0.6, 0]}>
          <Outline />
        </mesh>
      )}
    </group>
  );
}
