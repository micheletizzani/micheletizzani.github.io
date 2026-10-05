import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Blob } from "./shared";
import { Ball, Box, Round, Toon, darken, lighten, type V3 } from "./toon";

// Small set pieces shared by the sceneries. Everything is built from flat boxes, cylinders and spheres,
// kept low (under 2.2 m) wherever it stands in front of something the player has to see.

export function Bench({
  position,
  rotationY = 0,
  wood = "#d9b48f",
  leg = "#b98d7a",
}: {
  position: V3;
  rotationY?: number;
  wood?: string;
  leg?: string;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <Box position={[0, 0.42, 0]} size={[1.6, 0.12, 0.5]} color={wood} />
      <Box position={[-0.65, 0.2, 0]} size={[0.1, 0.4, 0.4]} color={leg} />
      <Box position={[0.65, 0.2, 0]} size={[0.1, 0.4, 0.4]} color={leg} />
    </group>
  );
}

export function Lamp({ position, pole = "#8a8fa8", globe = "#fff3cf" }: { position: V3; pole?: string; globe?: string }) {
  return (
    <group position={position} userData={{ noOcclude: true }}>
      <Round position={[0, 1.2, 0]} radius={0.06} height={2.4} color={pole} segments={6} />
      <Ball position={[0, 2.5, 0]} radius={0.2} color={globe} />
    </group>
  );
}

/** A low planter box with a round bush: the near-edge furniture. */
export function Planter({
  position,
  color = "#f0c9b6",
  leaf = "#a9d3b0",
  width = 1.4,
}: {
  position: V3;
  color?: string;
  leaf?: string;
  width?: number;
}) {
  return (
    <group position={position}>
      <Blob radius={width * 0.7} />
      <Box position={[0, 0.25, 0]} size={[width, 0.5, 0.6]} color={color} />
      <Ball position={[0, 0.72, 0]} radius={0.38} color={leaf} />
    </group>
  );
}

export function Balustrade({ from, to, y = 0, color = "#f7ead6" }: { from: [number, number]; to: [number, number]; y?: number; color?: string }) {
  const len = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const posts = Math.max(2, Math.round(len / 0.7));
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  return (
    <group position={[from[0], y, from[1]]} rotation={[0, -angle, 0]}>
      {Array.from({ length: posts }, (_, i) => (
        <Round key={i} position={[(i / (posts - 1)) * len, 0.32, 0]} radius={0.09} top={0.07} height={0.64} color={color} segments={8} />
      ))}
      <Box position={[len / 2, 0.7, 0]} size={[len, 0.12, 0.24]} color={lighten(color, 0.2)} />
    </group>
  );
}

export function Boat({
  position,
  hull,
  cabin = "#fbf3e4",
  rotationY = 0,
  phase = 0,
}: {
  position: V3;
  hull: string;
  cabin?: string;
  rotationY?: number;
  phase?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime + phase;
    ref.current.position.y = position[1] + Math.sin(t * 1.1) * 0.05;
    ref.current.rotation.z = Math.sin(t * 0.9) * 0.025;
  });
  return (
    <group ref={ref} position={position} rotation={[0, rotationY, 0]} userData={{ noOcclude: true }}>
      <Box position={[0, 0.25, 0]} size={[3.6, 0.8, 1.3]} color={hull} />
      <group position={[2.0, 0.25, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <Round position={[0, 0, 0]} radius={0.62} top={0.04} height={1.0} color={hull} segments={4} />
      </group>
      <Box position={[0, 0.7, 0]} size={[3.65, 0.12, 1.35]} color="#fbf3e4" cast={false} />
      <Box position={[-0.5, 1.25, 0]} size={[1.3, 0.8, 0.95]} color={cabin} />
      <Round position={[0.5, 2.1, 0]} radius={0.05} height={3} color="#c9b49a" segments={6} />
    </group>
  );
}

/** A bicycle: two wheels and a frame, parked on the quay. */
export function Bike({ position, rotationY = 0, color = "#8fb0cf" }: { position: V3; rotationY?: number; color?: string }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0.38, 0]}>
          <torusGeometry args={[0.36, 0.04, 6, 18]} />
          <meshBasicMaterial color="#6f86a6" />
        </mesh>
      ))}
      <Box position={[0, 0.62, 0]} size={[1.0, 0.06, 0.06]} color={color} />
      <Box position={[-0.1, 0.5, 0]} size={[0.06, 0.4, 0.06]} color={color} rotation={[0, 0, 0.5]} />
      <Box position={[0.5, 0.88, 0]} size={[0.06, 0.06, 0.42]} color="#6f86a6" />
      <Box position={[0.58, 0.8, 0]} size={[0.3, 0.2, 0.34]} color="#f0b8a0" cast={false} />
    </group>
  );
}

/** A round fountain / pump on the quay (no taller than 2.2 m). */
export function Basin({ basin, stone, water, spout = true }: { basin: string; stone: string; water: string; spout?: boolean }) {
  return (
    <group position={[0, 0, 2]}>
      <Blob radius={2.5} />
      <Round position={[0, 0.3, 0]} radius={1.95} top={1.8} height={0.6} color={basin} segments={22} />
      <mesh position={[0, 0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.62, 28]} />
        <Toon color={water} />
      </mesh>
      <Round position={[0, 1.0, 0]} radius={0.32} top={0.2} height={1.4} color={stone} segments={10} />
      <Round position={[0, 1.78, 0]} radius={0.55} top={0.25} height={0.25} color={darken(stone, 0.04)} segments={12} />
      {spout && <Ball position={[0, 2.0, 0]} radius={0.17} color={lighten(water, 0.35)} />}
    </group>
  );
}
