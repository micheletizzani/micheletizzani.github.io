import { da } from "./da";
import { da1 } from "./da1";
import { el1 } from "./el1";
import type { LanguagePack } from "./types";

/** Registered packs. To add a language: create packs/<id>.ts from packs/_template.ts and list it here. */
export const PACKS: LanguagePack[] = [da1, da, el1];
export const DEFAULT_PACK_ID = "da-1";
export const getPack = (id: string | null | undefined): LanguagePack =>
  PACKS.find((p) => p.id === id) ?? PACKS.find((p) => p.id === DEFAULT_PACK_ID)!;

export * from "./types";
export * from "./helpers";
