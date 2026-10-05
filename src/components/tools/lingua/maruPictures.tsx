import React from "react";
import type { PictureId } from "./packs/types";
import { FILL, PICTURES } from "./maruPictureData";

export { MEANING_LIBRARY, PICTURES, PICTURE_IDS } from "./maruPictureData";

export function Picture({ id, size = 44, className }: { id: PictureId; size?: number; className?: string }) {
  const shapes = PICTURES[id] ?? PICTURES.writing;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="var(--mx-ink, #2a1520)"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {shapes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={FILL[s.fill ?? "none"]}
          stroke={s.stroke === "none" ? "none" : undefined}
          strokeWidth={s.width}
          strokeDasharray={s.dash ? "3 3" : undefined}
        />
      ))}
    </svg>
  );
}
