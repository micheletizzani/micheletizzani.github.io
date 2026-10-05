import * as THREE from "three";
import { H, W, drawAperture, drawBody, type Kind } from "./shapes";

const SCALE = 3;
const cache = new Map<string, THREE.CanvasTexture>();

function canvasTexture(w: number, h: number, draw: (c: CanvasRenderingContext2D) => void): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const c = canvas.getContext("2d")!;
  draw(c);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/**
 * The solid silhouette. `awaken` (0 to 1) fills it with colour from the feet up: the share of this person's
 * vocabulary that the player has recorded. The colour comes from `tint`.
 */
export function bodyTexture(kind: Kind, awaken = 0, tint = "#d9558c"): THREE.CanvasTexture {
  const step = Math.round(awaken * 8) / 8; // eight steps: fewer textures to build
  const key = `body:${kind}:${step}:${tint}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const t = canvasTexture(W * SCALE, H * SCALE, (c) => {
    c.scale(SCALE, SCALE);
    drawBody(c, kind);
    if (step > 0) {
      c.save();
      c.globalCompositeOperation = "source-atop";
      const top = H * (1 - step);
      const g = c.createLinearGradient(0, top, 0, H);
      g.addColorStop(0, `${tint}00`);
      g.addColorStop(0.18, `${tint}cc`);
      g.addColorStop(1, `${tint}ff`);
      c.fillStyle = g;
      c.fillRect(0, top, W, H - top);
      c.restore();
    }
  });
  cache.set(key, t);
  return t;
}

/** The glowing opening, drawn white so a material colour can tint it. */
export function apertureTexture(kind: Kind): THREE.CanvasTexture {
  const key = `glow:${kind}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const t = canvasTexture(W * SCALE, H * SCALE, (c) => {
    c.scale(SCALE, SCALE);
    drawAperture(c, kind);
  });
  cache.set(key, t);
  return t;
}

/** Paul's scarf: a gradient ribbon written over with the words the player has recorded (and a few sparks). */
export function scarfTexture(glyphs: readonly string[]): THREE.CanvasTexture {
  const key = `scarf:${glyphs.join("|")}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const t = canvasTexture(1024, 96, (c) => {
    const g = c.createLinearGradient(0, 0, 1024, 0);
    g.addColorStop(0, "#f2b84b");
    g.addColorStop(0.35, "#d9558c");
    g.addColorStop(0.75, "#5a68c4");
    g.addColorStop(1, "#3fa7c9");
    c.fillStyle = g;
    c.fillRect(0, 0, 1024, 96);
    c.fillStyle = "rgba(255,255,255,0.88)";
    c.textBaseline = "middle";
    const words = glyphs.length ? glyphs : ["·", "?", "·"];
    let x = 18;
    let i = 0;
    while (x < 1000) {
      const w = words[i % words.length];
      c.font = `${i % 3 === 0 ? 40 : 30}px Georgia, serif`;
      c.fillText(w, x, 30 + ((i * 17) % 36));
      x += c.measureText(w).width + 26;
      i += 1;
    }
    c.fillStyle = "rgba(255,244,210,0.95)";
    for (let k = 0; k < 40; k++) c.fillRect(((k * 97) % 1000) + 8, (k * 53) % 90, 3, 3);
    // the free end fades
    const fade = c.createLinearGradient(700, 0, 1024, 0);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,1)");
    c.globalCompositeOperation = "destination-out";
    c.fillStyle = fade;
    c.fillRect(700, 0, 324, 96);
  });
  cache.set(key, t);
  return t;
}

/** A single speech mark (an accent or diacritic) as a small cream sprite. */
export function markTexture(mark: string): THREE.CanvasTexture {
  const key = `mark:${mark}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const t = canvasTexture(64, 64, (c) => {
    c.fillStyle = "#fff4d2";
    c.shadowColor = "#ffe9a8";
    c.shadowBlur = 8;
    c.font = "44px Georgia, serif";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(mark, 32, 30);
  });
  cache.set(key, t);
  return t;
}
