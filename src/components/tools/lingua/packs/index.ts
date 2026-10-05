import { da } from "./da";
import { maru } from "./maru";
import type { LanguagePack } from "./types";

/** Registered packs. To add a language: create packs/<id>.ts from packs/_template.ts and list it here. */
export const PACKS: LanguagePack[] = [da, maru];
export const DEFAULT_PACK_ID = "da";
export const getPack = (id: string | null | undefined): LanguagePack =>
  PACKS.find((p) => p.id === id) ?? PACKS.find((p) => p.id === DEFAULT_PACK_ID)!;

export * from "./types";
export * from "./helpers";
