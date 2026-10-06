import React from "react";

/** Stylised plan of central Copenhagen (Indre By). A game map, not a survey: it only has to read at a glance. */
export interface MapLabel {
  x: number;
  y: number;
  text: string;
}

const COPENHAGEN: MapLabel[] = [
  { x: 6, y: 24, text: "NØRREPORT" },
  { x: 4, y: 54, text: "INDRE BY" },
  { x: 39, y: 55, text: "HØJBRO" },
  { x: 65, y: 39, text: "KONGENS" },
  { x: 65, y: 42, text: "NYTORV" },
  { x: 54, y: 67, text: "SLOTSHOLMEN" },
  { x: 71, y: 72, text: "NYHAVN" },
  { x: 4, y: 78, text: "GAMMEL STRAND" },
  { x: 61, y: 83, text: "INDERHAVN" },
];

export function CityMapArt({ water = "#82afb6", labels = COPENHAGEN }: { water?: string; labels?: MapLabel[] }) {
  return (
    <>
      <rect width="100" height="100" fill="#dccfac" />
      <path d="M-6 74 C19 66 26 67 45 70 C63 73 79 68 106 75 L106 104 L-6 104Z" fill={water} />
      <path d="M62 -4 C59 21 59 35 63 50 C67 62 64 72 69 104" fill="none" stroke={water} strokeWidth="9" />
      <path d="M0 51 C19 49 33 48 55 50 C73 53 84 50 100 47" fill="none" stroke="#f1ead7" strokeWidth="8" />
      <path d="M49 4 C48 22 48 37 51 50 C54 62 52 79 50 100" fill="none" stroke="#f1ead7" strokeWidth="7" />
      <path d="M4 23 L93 26 M9 38 L92 39 M15 10 L16 91 M32 5 L34 67 M78 4 L80 66" fill="none" stroke="#f1ead7" strokeWidth="3" />
      <g fill="#b98c69" stroke="#795846" strokeWidth="0.7">
        <path d="M4 5H14V20H4Z M19 5H30V20H19Z M35 5H46V20H35Z M53 6H59V20H53Z M67 5H76V21H67Z M83 5H96V21H83Z" />
        <path d="M4 28H13V35H4Z M19 28H31V35H19Z M37 28H45V35H37Z M54 29H59V35H54Z M67 29H76V36H67Z M83 29H96V36H83Z" />
        <path d="M5 42H14V48H5Z M20 42H30V48H20Z M36 42H45V48H36Z M54 42H59V48H54Z M69 42H78V48H69Z M84 42H96V48H84Z" />
        <path d="M4 56H14V67H4Z M20 56H31V67H20Z M37 56H45V67H37Z M70 55H78V66H70Z M84 55H96V66H84Z" />
      </g>
      <path d="M60 8 L68 8 L70 28 L64 37 L57 28Z" fill="#d4b56f" stroke="#795846" strokeWidth="0.7" />
      <g fontFamily="ui-monospace, monospace" fontSize="2.6" fill="#385054" letterSpacing="0.2">
        {labels.map((l) => (
          <text key={l.text} x={l.x} y={l.y}>
            {l.text}
          </text>
        ))}
      </g>
    </>
  );
}
