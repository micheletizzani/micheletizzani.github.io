import { test } from "node:test";
import assert from "node:assert/strict";
import { PACKS, da, maru, template } from "./_packs";
import { validatePack, contrast } from "../../src/components/tools/lingua/packs/validate";
import { grade, gradeSound, normalizeSound, syllablesOf, ipaToPronounceable, resolvePhoneticAudio } from "../../src/components/tools/lingua/maruPhonetics";
import { findPath, buildGrid } from "../../src/components/tools/lingua/maruNav";
import { hiddenGround } from "../../src/components/tools/lingua/packs/visibility";
import { makeTerrain } from "../../src/components/tools/lingua/maruTerrain";
import { packGrid, packTerrain } from "../../src/components/tools/lingua/packs/navgrid";
import { pickVoice, rankVoices, installHints } from "../../src/components/tools/lingua/maruVoices";
import { candidatesFor, emptyProgress, evidenceFor, verdicts, compatibility } from "../../src/components/tools/lingua/progress";
import type { LanguagePack } from "../../src/components/tools/lingua/packs/types";

const clone = (p: LanguagePack): LanguagePack => JSON.parse(JSON.stringify(p));
const rulesOf = (p: LanguagePack) => ({ kind: p.notation.kind, ignore: p.notation.ignore, equivalent: p.notation.equivalent });

test("registered packs validate without errors", () => {
  for (const pack of PACKS) assert.deepEqual(validatePack(pack).errors, [], pack.id);
});

test("validator catches broken packs", () => {
  const unknownWord = clone(da);
  unknownWord.encounters[0].drills = ["nope"];
  assert.ok(validatePack(unknownWord).errors.some((e) => e.includes('unknown word "nope"')));

  const thin = clone(da);
  thin.encounters[0].clues = thin.encounters[0].clues.filter((c) => c.id !== "f-pump" && c.id !== "f-sign" && c.id !== "f-point");
  assert.ok(validatePack(thin).errors.some((e) => e.includes("need at least 2")));

  const cycle = clone(maru);
  cycle.encounters[0].requires = "archive";
  assert.ok(validatePack(cycle).errors.some((e) => e.includes("exactly one")));

  const lie = clone(da);
  lie.verification.status = "verified";
  assert.ok(validatePack(lie).errors.some((e) => e.includes("pack says verified")));

  const finale = clone(da);
  finale.finale.target = [...finale.finale.target, "vand"];
  assert.ok(validatePack(finale).errors.some((e) => e.includes("permutation")));

  const stuck = clone(maru);
  stuck.encounters[1].approach = [-10, 6];
  assert.ok(validatePack(stuck).errors.some((e) => e.includes("inside a building")));

  const badMeaning = clone(maru);
  badMeaning.lexicon[0].meaning = "zzz";
  assert.ok(validatePack(badMeaning).errors.some((e) => e.includes("unknown meaning")));
});

test("validator warns when the scene gives the answer away", () => {
  const leaky = clone(da);
  leaky.encounters[0].scene += " The word is vand.";
  assert.ok(validatePack(leaky).warnings.some((w) => w.includes("give the answer away")));
});

test("ui contrast helper", () => {
  assert.ok(contrast("#000000", "#ffffff") > 20);
  for (const p of PACKS) assert.ok(contrast(p.ui.ink, p.ui.paper) >= 7, p.id);
});

test("IPA grading ignores stød/length/stress and treats equivalent sounds as one", () => {
  const r = rulesOf(da);
  const vand = da.lexicon.find((w) => w.id === "vand")!;
  assert.equal(gradeSound(vand.sound, vand.alsoAccept, "van", r).verdict, "exact");
  assert.equal(gradeSound(vand.sound, vand.alsoAccept, "[vɑnˀ]", r).verdict, "exact");
  const kop = da.lexicon.find((w) => w.id === "kop")!;
  assert.equal(gradeSound(kop.sound, kop.alsoAccept, "kɔp", r).verdict, "exact"); // ɔ~ʌ, p~b
  const nogle = da.lexicon.find((w) => w.id === "nøgle")!;
  assert.equal(gradeSound(nogle.sound, nogle.alsoAccept, "ˈnojle", r).passed, true); // one slip in five allowed
  assert.equal(gradeSound(nogle.sound, nogle.alsoAccept, "xyz", r).verdict, "miss");
  assert.equal(normalizeSound("ˈkʌb̥ɐ̯", r), normalizeSound("kʌbɐ", r));
});

test("hint pattern shows the sounds you got right", () => {
  const r = rulesOf(da);
  const g = gradeSound("ˈkʌbɐ", [], "kɔpe", r);
  assert.match(g.pattern, /^ˈkʌb[·ɐ]$/);
});

test("romanisation must be exact", () => {
  const r = rulesOf(maru);
  assert.equal(gradeSound("koponi", [], "kopone", r).passed, false);
  assert.equal(gradeSound("koponi", [], "Kopo-ni", r).passed, true);
});

test("spoken guesses are compared with the written form, leniently", () => {
  assert.equal(grade("nøgle", "nogle", true).passed, true);
  assert.equal(grade("lukket", "lukket", true).verdict, "exact");
  assert.equal(grade("vand", "bil", true).passed, false);
});

test("syllable counts", () => {
  assert.equal(syllablesOf("kopper", "ipa"), 2);
  assert.equal(syllablesOf("jeg", "ipa"), 1);
  assert.equal(syllablesOf("koponi", "romanisation"), 3);
  assert.equal(syllablesOf("naeno", "romanisation"), 3);
});

test("IPA to pronounceable Danish mapping", () => {
  assert.equal(ipaToPronounceable("vanˀ", "da"), "van");
  assert.equal(ipaToPronounceable("vænˀ", "da"), "væn");
  assert.equal(ipaToPronounceable("kʰɔb̥", "da"), "kåb");
  assert.equal(ipaToPronounceable("bɔːð", "da"), "båd");
  assert.equal(ipaToPronounceable("ˈfɑˀ", "da"), "far");
  assert.equal(ipaToPronounceable("[mæð]", "da"), "mæd");
});

test("phonetic audio test resolution finds exact targets, lexicon words, keywords and phonemes", () => {
  // Empty input returns null
  assert.equal(resolvePhoneticAudio("", da), null);
  assert.equal(resolvePhoneticAudio("   ", da), null);

  // Exact target word match
  const resTarget = resolvePhoneticAudio("vanˀ", da, "vand");
  assert.ok(resTarget);
  assert.equal(resTarget.source, "exact-target");
  assert.equal(resTarget.speakable, "vand");

  // Lexicon match without targetId specified
  const resLex = resolvePhoneticAudio("kɔp", da);
  assert.ok(resLex);
  assert.equal(resLex.source, "lexicon");
  assert.equal(resLex.speakable, "kop");

  // Keyword match (e.g. "far" [fɑˀ] keyword for open back vowel ɑ)
  const resKw = resolvePhoneticAudio("fɑˀ", da);
  assert.ok(resKw);
  assert.equal(resKw.source, "keyword");
  assert.equal(resKw.speakable, "far");

  // Single phoneme symbol (e.g. "ð")
  const resPh = resolvePhoneticAudio("ð", da);
  assert.ok(resPh);
  assert.equal(resPh.source, "phoneme");
  assert.equal(resPh.speakable, "mad"); // keyword for ð

  // Novel phonetic hypothesis synthesized to Danish
  const resSynth = resolvePhoneticAudio("pɔl", da);
  assert.ok(resSynth);
  assert.equal(resSynth.source, "synthesized");
  assert.equal(resSynth.speakable, "pål");

  // Romanised pack (Maru)
  const resMaru = resolvePhoneticAudio("tala", maru);
  assert.ok(resMaru);
  assert.equal(resMaru.speakable, "tala");
});
test("meaning cards always include the truth and every rival the clues allow", () => {
  for (const pack of PACKS)
    for (const e of pack.encounters)
      for (const id of e.drills) {
        const w = pack.lexicon.find((x) => x.id === id)!;
        const ids = candidatesFor(pack, id).map((m) => m.id);
        assert.ok(ids.includes(w.meaning), `${pack.id}/${id}: truth missing`);
        for (const c of e.clues.filter((k) => k.about?.includes(id))) for (const m of c.supports) assert.ok(ids.includes(m), `${pack.id}/${id}: rival "${m}" missing`);
      }
});

test("evidence grows with varied observations and flags unsupported or conflicting guesses", () => {
  const w = emptyProgress();
  assert.equal(evidenceFor(da, "vand", undefined, w).state, "none");
  assert.equal(evidenceFor(da, "vand", "water", w).state, "untested");
  const seen = { ...w, noticed: ["f-pump"] };
  assert.equal(evidenceFor(da, "vand", "water", seen).dots, 1);
  assert.equal(evidenceFor(da, "vand", "boat", seen).state, "unsupported");
  const many = { ...w, noticed: ["f-pump", "f-drink", "f-point", "f-sign"] };
  assert.equal(evidenceFor(da, "vand", "water", many).dots, 3);
  // "drink" is also compatible with some of the clues, but fewer than "water": its meter must be lower
  assert.ok(compatibility(da, "vand", "drink", many).fits < compatibility(da, "vand", "water", many).fits);
  // a guess that most observations contradict is a conflict
  const odd = { ...w, noticed: ["f-pump", "f-point", "f-drink"] };
  assert.equal(evidenceFor(da, "vand", "cup", odd).state, "conflict");
});

test("verdicts compare guesses with the truth and reveal nothing for missing words", () => {
  const p = { ...emptyProgress(), words: { vand: { heard: true, sound: true, hintsUsed: 0, hypothesis: "water" }, kop: { heard: true, sound: true, hintsUsed: 0, hypothesis: "drink" }, kopper: { heard: false, sound: false, hintsUsed: 0 } } };
  const v = Object.fromEntries(verdicts(da, p).map((x) => [x.word, x.result]));
  assert.deepEqual(v, { vand: "correct", kop: "wrong", kopper: "unanswered" });
});

test("the template pack is a valid, working example", () => {
  const report = validatePack(template);
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.warnings, []);
  assert.ok(!PACKS.some((p) => p.id === template.id), "the template must not be registered in the game");
});

const V = (name: string, lang: string, localService = true) => ({ name, lang, localService });

test("voice selection never silently falls back to a voice of another language", () => {
  const english = [V("Daniel", "en-GB"), V("Samantha", "en-US")];
  assert.equal(pickVoice(english, "da-DK"), null, "only English voices: report 'no Danish voice'");
  assert.equal(pickVoice([], "da-DK"), null, "no voices loaded yet");
  const withDanish = [...english, V("Sara", "da-DK")];
  assert.equal(pickVoice(withDanish, "da-DK")?.name, "Sara");
  assert.equal(pickVoice([V("Greenlandic-ish", "da-GL")], "da-DK")?.name, "Greenlandic-ish", "same language, other region is acceptable");
  assert.equal(pickVoice([V("Sara", "da_DK")], "da-DK")?.name, "Sara", "underscore tags are normalised");
});

test("voice choice: best quality first, the player's choice wins, a vanished choice is ignored", () => {
  const voices = [V("Basic", "da-DK"), V("Christel Online (Natural)", "da-DK", false), V("Daniel", "en-GB")];
  assert.equal(pickVoice(voices, "da-DK")?.name, "Christel Online (Natural)");
  assert.equal(pickVoice(voices, "da-DK", "Daniel")?.name, "Daniel", "explicit 'use another voice anyway'");
  assert.equal(pickVoice(voices, "da-DK", "Uninstalled")?.name, "Christel Online (Natural)");
  const r = rankVoices(voices, "da-DK");
  assert.deepEqual([r.exact.length, r.sameLanguage.length, r.other.length], [2, 0, 1]);
});

test("install hints are specific to the platform when it can be told", () => {
  const mac = installHints("Danish", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15");
  assert.deepEqual(mac.map((h) => h.platform), ["macOS"]);
  const android = installHints("Danish", "Mozilla/5.0 (Linux; Android 14) Chrome/120 Mobile");
  assert.deepEqual(android.map((h) => h.platform), ["Android"]);
  assert.ok(installHints("Danish", "SomethingUnknown").length >= 4, "unknown platform lists all");
});

test("terrain: heights of terraces, stairs interpolate, the sea has no ground", () => {
  const t = packTerrain(da);
  assert.equal(t.groundY(0, 5), 0, "quay");
  assert.equal(t.groundY(-8, -8), 1.2, "terrace");
  assert.equal(t.groundY(0, -14), 2.4, "upper terrace");
  assert.equal(t.groundY(0, 12), null, "sea south of the quay");
  assert.equal(t.groundY(12, 0), null, "sea east of the quay");
  assert.ok(Math.abs((t.groundY(0, -4.5) ?? 99) - 0.6) < 1e-9, "halfway up the first stairs");
  assert.ok(Math.abs((t.groundY(0, -11.1) ?? 99) - 1.8) < 1e-9, "halfway up the second stairs");
  assert.equal(t.walkable(-13.7, 0, 0.4), false, "too close to the edge");
  const tiny = makeTerrain([{ id: "a", x: [0, 2], z: [0, 2], y: 1, color: "#fff", side: "#fff" }], []);
  assert.equal(tiny.groundY(1, 1), 1);
  assert.equal(tiny.groundY(3, 1), null);
});

test("every encounter is reachable on foot, and only by the stairs", () => {
  for (const pack of PACKS) {
    const { grid } = packGrid(pack);
    for (const e of pack.encounters) assert.ok(findPath(grid, [0, 6.4], e.approach).length > 0, `${pack.id}: no route to ${e.id}`);
    // the terrace is a wall away from the quay except at the stairs: a route from the west quay to the west terrace must pass them
    const route = findPath(grid, [-10, 0], [-10, -8]);
    assert.ok(route.length > 0, `${pack.id}: west terrace unreachable`);
    assert.ok(route.some(([x, z]) => Math.abs(x) <= 2 && z > -5.6 && z < -3.4), `${pack.id}: route to the terrace did not use the stairs: ${JSON.stringify(route)}`);
  }
});

test("validator catches a layered world that does not hang together", () => {
  const noStairs = clone(da);
  noStairs.world.stairs = [];
  const r1 = validatePack(noStairs);
  assert.ok(r1.errors.some((e) => e.includes('encounter "guard" cannot be reached')), "terraces without stairs strand the story");

  const wrongHeight = clone(da);
  wrongHeight.world.stairs[0].y0 = 2.0;
  assert.ok(validatePack(wrongHeight).errors.some((e) => e.includes("does not meet a terrace")), "stair that ends in mid-air");

  const floating = clone(da);
  floating.encounters[0].position = [30, 0, 30];
  assert.ok(validatePack(floating).errors.some((e) => e.includes("not on any terrace")));

  const offGround = clone(maru);
  offGround.encounters[0].approach = [0, 12];
  assert.ok(validatePack(offGround).errors.some((e) => e.includes("not on walkable ground")));

  const wrongBase = clone(da);
  wrongBase.world.buildings[0].position[1] = 1.2;
  assert.ok(validatePack(wrongBase).errors.some((e) => e.includes("stands at height")));

  const nearEdge = clone(da);
  nearEdge.world.buildings.push({ position: [8, 0, 6], size: [3, 6, 3], color: "#fff", roof: "#fff", faces: ["w"], kind: "house" });
  const rn = validatePack(nearEdge);
  assert.ok([...rn.errors, ...rn.warnings].some((m) => m.includes("hidden behind buildings")), "a tall building on the near edge hides ground and is reported");
});

test("visibility: the shipped layout hides no walkable ground, and the check can see a hiding building", () => {
  for (const pack of PACKS) {
    const v = hiddenGround(pack);
    assert.ok(v.total > 300, `${pack.id}: expected a few hundred walkable points, got ${v.total}`);
    assert.equal(v.hidden.length, 0, `${pack.id}: hidden ${JSON.stringify(v.hidden.slice(0, 5))}`);
  }
  const bad = clone(da);
  bad.world.buildings.push({ position: [5, 0, 3], size: [3, 6, 3], color: "#fff", roof: "#fff", faces: ["w"], kind: "house" });
  assert.ok(hiddenGround(bad).hidden.length > 20, "a tall building near the camera hides ground behind it");
  // a tall building on the far (west) edge hides nothing that can be walked on
  const far = clone(da);
  far.world.buildings = far.world.buildings.filter((b) => b.position[0] > 0 || b.position[2] < 0);
  assert.equal(hiddenGround(far).hidden.length, 0);
});
