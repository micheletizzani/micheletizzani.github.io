# Language Quest

A point-and-click language-discovery game for the Study Hub. You arrive in a city knowing none of the language,
watch what people do, listen, write down the sounds, and work out what the words mean from your own notes.

| Document                                                                     | Read it to…                                                                    |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| [DESIGN.md](./DESIGN.md)                                                     | understand what the game is, why it works the way it does, and how it is built |
| [PACK_TEMPLATE.md](./PACK_TEMPLATE.md)                                       | add a new language, a new city, or a new story chapter                         |
| [`packs/_template.ts`](../../src/components/tools/lingua/packs/_template.ts) | copy a complete, type-checked, validator-passing starting point                |

## Run it

```bash
npm install
npm run dev                      # open http://localhost:4321/tools/maru/  (add ?debug for fps + GPU name)
npm run packs:check              # validate every language pack (errors fail, warnings need a decision)
npm run test:lingua              # unit tests: grading, evidence logic, pathfinding, pack validator
```

The game also opens from the Study Hub: **Games → 6. Language Quest**.

## Where things live

```
src/components/tools/lingua/
  packs/            language packs (data) + types, helpers, validator, template
  world/            3D scenery per art style (nyhavn, sandstone), terraces, sea, props
  MaruWorld.tsx     canvas, isometric camera, point-and-click walking
  maruTerrain.ts    terraces + stairs: ground height at a point
  maruCamera.ts     the isometric camera angle, shared with the visibility check
  MaruExpedition.tsx  the game shell: map, HUD, commands, wiring
  Lesson.tsx        Observe / Sound / Meaning for one encounter
  Notebook.tsx      words, guesses, observations, story
  PhoneticDictionary.tsx
  Finale.tsx        the closing sentence
  progress.ts       save data + evidence/confidence logic
  maruPhonetics.ts  grading of sounds (IPA-aware)
  maruNav.ts        grid A* pathfinding
scripts/            pack validator and test runner
docs/language-quest/  you are here
```

The URL `/tools/maru/` and the component names (`MaruExpedition`, `Maru*`) predate the multi-language design and were
kept so existing links keep working. "Maru" is the name of the invented-language pack.
