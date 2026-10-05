import type { Archetype } from "../../packs/types";

// Hand-drawn silhouettes on a 120 x 240 canvas, feet near y = 228, everybody facing right.
// Each drawing function paints the solid body; `aperture` paints the same character's glowing opening in white.

export const W = 120;
export const H = 240;
export const BODY = "#23212c";
export const BODY_SOFT = "#35323f";

export type Kind = Archetype | "paul";
type Ctx = CanvasRenderingContext2D;

/** Height in metres of the full 240-unit canvas. Characters fill different shares of it, so these are tuned by eye to give people of a believable size (about 1.7 to 2.4 m of drawn body). */
export const HEIGHT_M: Record<Kind, number> = { paul: 3.3, gatekeeper: 3.4, elder: 2.9, messenger: 4.2, merchant: 3.6, scholar: 4.0 };

const line = (c: Ctx, w: number, color: string, ...pts: [number, number][]) => {
  c.strokeStyle = color;
  c.lineWidth = w;
  c.lineCap = "round";
  c.lineJoin = "round";
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
};
const ellipse = (c: Ctx, x: number, y: number, rx: number, ry: number, color = BODY, rot = 0) => {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  c.fill();
};
const path = (c: Ctx, d: string, color = BODY) => {
  c.fillStyle = color;
  c.fill(new Path2D(d));
};
const cut = (c: Ctx, fn: () => void) => {
  c.save();
  c.globalCompositeOperation = "destination-out";
  fn();
  c.restore();
};

/** Paul Glotty: hat, pointed nose, short coat, thin legs, staff, belt with notebook, pencil and pouch. */
function paul(c: Ctx) {
  line(c, 6, BODY, [52, 150], [47, 226]);
  line(c, 6, BODY, [70, 150], [80, 226]);
  ellipse(c, 44, 229, 9, 3.4);
  ellipse(c, 85, 229, 9, 3.4);
  line(c, 5, BODY, [40, 102], [31, 140], [36, 162]); // arm behind
  path(c, "M36 98 Q60 88 84 98 L93 158 L30 158 Z");
  line(c, 5.5, BODY, [80, 102], [96, 128], [101, 142]); // arm with the staff
  line(c, 4.5, BODY, [102, 90], [106, 232]);
  ellipse(c, 60, 72, 17, 18);
  path(c, "M75 69 L90 77 L75 81 Z"); // the nose
  ellipse(c, 60, 56, 31, 6.5); // hat brim
  path(c, "M44 56 L46 28 Q60 21 74 28 L76 56 Z");
  c.fillStyle = "#4a4660";
  c.fillRect(44, 45, 32, 6);
  c.fillStyle = "#4b4440"; // belt
  c.fillRect(34, 142, 58, 5);
  c.fillStyle = "#6d5a48"; // pouch
  c.beginPath();
  c.roundRect(32, 146, 17, 15, 3);
  c.fill();
  c.fillStyle = "#8a6a4a"; // notebook
  c.beginPath();
  c.roundRect(70, 124, 21, 28, 2);
  c.fill();
  c.fillStyle = "#c9b08a";
  for (let i = 0; i < 5; i++) c.fillRect(70, 128 + i * 5, 3, 2);
  line(c, 2.6, "#d8b878", [66, 122], [70, 150]); // pencil
}

/** Gatekeeper (O with a slash): a round body with a hollow, and the slash as a tall tapping staff. */
function gatekeeper(c: Ctx) {
  line(c, 6, BODY, [48, 170], [46, 227]);
  line(c, 6, BODY, [72, 170], [76, 227]);
  ellipse(c, 44, 229, 9, 3.4);
  ellipse(c, 80, 229, 9, 3.4);
  ellipse(c, 60, 118, 43, 52);
  line(c, 7, BODY, [100, 54], [30, 214]); // the slash
  cut(c, () => ellipse(c, 60, 114, 16, 24, "#000", 0));
}

/** Elder (A with a ring): a hunched arch on wide feet, and a ring held above the head as a lantern. */
function elder(c: Ctx) {
  path(c, "M22 214 Q20 100 60 86 Q100 100 98 214 Z");
  cut(c, () => path(c, "M42 214 Q42 132 60 124 Q78 132 78 214 Z", "#000"));
  c.fillStyle = BODY;
  c.fillRect(40, 168, 40, 8);
  c.fillRect(14, 212, 34, 7);
  c.fillRect(72, 212, 34, 7);
  line(c, 3.5, BODY, [60, 70], [60, 90]);
  c.strokeStyle = BODY;
  c.lineWidth = 7;
  c.beginPath();
  c.arc(60, 52, 20, 0, Math.PI * 2);
  c.stroke();
}

/** Messenger (k): a very tall stem, an outstretched arm pointing the way, a long striding leg, a scroll. */
function messenger(c: Ctx) {
  c.fillStyle = BODY;
  c.beginPath();
  c.roundRect(54, 36, 12, 182, 5);
  c.fill();
  ellipse(c, 60, 24, 13, 14);
  line(c, 9, BODY, [62, 130], [105, 76]);
  line(c, 9, BODY, [62, 136], [98, 218]);
  line(c, 6, BODY, [60, 112], [32, 152]);
  ellipse(c, 58, 228, 10, 3.4);
  ellipse(c, 100, 228, 9, 3.4);
  c.strokeStyle = BODY;
  c.lineWidth = 5;
  c.beginPath();
  c.arc(109, 70, 9, 0, Math.PI * 2);
  c.stroke(); // the scroll, seen end-on
}

/** Merchant (AE): two joined bowls as apron and sleeves, a wide sloping hat, ribbon garments. */
function merchant(c: Ctx) {
  line(c, 6, BODY, [46, 172], [44, 227]);
  line(c, 6, BODY, [80, 176], [84, 227]);
  ellipse(c, 42, 229, 9, 3.4);
  ellipse(c, 88, 229, 9, 3.4);
  ellipse(c, 42, 138, 35, 36);
  ellipse(c, 80, 142, 30, 32);
  cut(c, () => {
    ellipse(c, 42, 138, 15, 18, "#000");
    ellipse(c, 80, 142, 12, 15, "#000");
  });
  ellipse(c, 60, 96, 14, 15);
  path(c, "M12 98 Q60 52 108 102 L102 108 Q60 78 20 106 Z");
  path(c, "M96 150 Q116 160 108 188 Q104 168 94 160 Z", BODY_SOFT);
}

/** Towering scholar (T): a flat cantilevered head like a roof on a rigid post, perfectly still. */
function scholar(c: Ctx) {
  c.fillStyle = BODY;
  c.beginPath();
  c.roundRect(14, 16, 92, 28, 3);
  c.fill();
  c.fillRect(52, 44, 16, 152);
  c.fillRect(46, 194, 12, 34);
  c.fillRect(62, 194, 12, 34);
  c.fillRect(40, 226, 22, 4);
  c.fillRect(60, 226, 22, 4);
  cut(c, () => c.fillRect(30, 28, 60, 5));
}

const DRAW: Record<Kind, (c: Ctx) => void> = { paul, gatekeeper, elder, messenger, merchant, scholar };
export const drawBody = (c: Ctx, kind: Kind) => DRAW[kind](c);

/** The glowing letter opening: where light shows through (or from) the silhouette. */
export function drawAperture(c: Ctx, kind: Kind) {
  c.fillStyle = "#fff";
  c.shadowColor = "#fff";
  c.shadowBlur = 10;
  switch (kind) {
    case "gatekeeper":
      ellipse(c, 60, 114, 16, 24, "#fff");
      break;
    case "elder":
      ellipse(c, 60, 52, 14, 14, "#fff");
      c.beginPath();
      c.moveTo(48, 214);
      c.quadraticCurveTo(48, 140, 60, 134);
      c.quadraticCurveTo(72, 140, 72, 214);
      c.fill();
      break;
    case "messenger":
      ellipse(c, 109, 70, 6, 6, "#fff");
      break;
    case "merchant":
      ellipse(c, 42, 138, 15, 18, "#fff");
      ellipse(c, 80, 142, 12, 15, "#fff");
      break;
    case "scholar":
      c.fillRect(30, 28, 60, 5);
      break;
    case "paul":
      break;
  }
}

/** Where speech marks float: above the head, in canvas units. */
export const HEAD: Record<Kind, [number, number]> = {
  paul: [60, 14],
  gatekeeper: [60, 56],
  elder: [60, 18],
  messenger: [60, 4],
  merchant: [60, 50],
  scholar: [60, 4],
};
