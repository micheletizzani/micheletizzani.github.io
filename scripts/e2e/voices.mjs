// Voice selection: a real language must never be read by a wrong-language voice. Uses controlled voice lists.
//   npm i -D playwright-core ; npm run dev ; CHROMIUM_PATH=... node scripts/e2e/voices.mjs
import { chromium } from "playwright-core";
import { clickMarker } from "./_lq.mjs";
const BASE = process.env.BASE_URL ?? "http://localhost:4321";
const SHOTS = process.env.SHOTS ?? "/tmp";
let failed = 0;
const ok = (c, m) => (console.log(c ? "PASS" : "FAIL", m), c || (failed += 1));
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});

const stub = ({ voices, lateMs }) => {
  const listeners = {};
  window.__spoken = [];
  window.__voices = lateMs ? [] : voices;
  const synth = {
    getVoices: () => window.__voices,
    speak: (u) => window.__spoken.push({ text: u.text, lang: u.lang, voice: u.voice ? u.voice.name : null }),
    cancel() {},
    addEventListener: (t, f) => (listeners[t] ??= []).push(f),
    removeEventListener: (t, f) => (listeners[t] = (listeners[t] ?? []).filter((x) => x !== f)),
  };
  Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true });
  window.SpeechSynthesisUtterance = function (t) { this.text = t; this.lang = ""; this.voice = null; };
  if (lateMs) setTimeout(() => { window.__voices = voices; (listeners.voiceschanged ?? []).forEach((f) => f()); }, lateMs);
};
const EN = [{ name: "Daniel", lang: "en-GB", localService: true }, { name: "Samantha", lang: "en-US", localService: true }];
const DA = { name: "Sara", lang: "da-DK", localService: true };

async function open(opts, pack = "da") {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => console.log("ERR:", e.message.slice(0, 300)));
  await p.addInitScript(stub, opts);
  await p.goto(BASE + "/tools/maru/", { waitUntil: "networkidle" });
  await p.evaluate((id) => { localStorage.clear(); localStorage.setItem("language-quest-pack", id); }, pack);
  await p.reload({ waitUntil: "networkidle" });
  await p.getByRole("button", { name: /^Enter / }).click();
  await p.waitForTimeout(2500);
  await clickMarker(p, "fountain");
  await p.waitForTimeout(2500);
  const dlg = p.getByRole("dialog", { name: /Pump|Fountain/ });
  await dlg.getByRole("tab", { name: /Sound/ }).click();
  return { p, dlg };
}

// A. Danish with English voices only: silent, and it says why
{
  const { p, dlg } = await open({ voices: EN });
  await dlg.getByRole("button", { name: /^Listen/ }).click();
  await p.waitForTimeout(500);
  ok((await p.evaluate(() => window.__spoken.length)) === 0, "A: only English voices installed -> Danish is NOT spoken");
  const panel = p.getByRole("dialog", { name: "Voice" });
  ok((await panel.count()) === 1, "A: the voice panel opens by itself");
  ok(/No Danish voice is installed/.test(await panel.textContent()), "A: it says no Danish voice is installed");
  ok(/English/.test(await panel.textContent()), "A: it explains why the game stays silent");
  ok(/Settings|System|speech-dispatcher/i.test(await panel.textContent()), "A: it lists install steps");
  await p.screenshot({ path: SHOTS + "/v_missing.png" });
  // D. override with an English voice: allowed, but labelled as not native
  await panel.getByLabel("Choose a voice").selectOption("Daniel");
  await panel.getByRole("button", { name: /Test voice/ }).click();
  await p.waitForTimeout(300);
  const spoken = await p.evaluate(() => window.__spoken);
  ok(spoken.length === 1 && spoken[0].voice === "Daniel", "D: an explicit choice of another voice is honoured");
  ok(/not a Danish voice/.test(await panel.textContent()), "D: and the panel states that it will not be native");
  await p.close();
}
// B. Danish voice present: used
{
  const { p, dlg } = await open({ voices: [...EN, DA] });
  await dlg.getByRole("button", { name: /^Listen/ }).click();
  await p.waitForTimeout(300);
  const s = await p.evaluate(() => window.__spoken);
  ok(s.length === 1 && s[0].voice === "Sara" && s[0].lang === "da-DK" && s[0].text === "vand", "B: a Danish voice is selected explicitly: " + JSON.stringify(s));
  ok((await p.getByRole("dialog", { name: "Voice" }).count()) === 0, "B: no warning when a Danish voice exists");
  await p.getByRole("button", { name: /Voice: Sara/ }).click();
  const panel = p.getByRole("dialog", { name: "Voice" });
  ok(/Speaking with\s*Sara/.test((await panel.textContent()).replace(/\s+/g, " ")), "B: the panel names the voice in use");
  await p.screenshot({ path: SHOTS + "/v_ok.png" });
  await p.close();
}
// C. Voices that load late (Chrome returns an empty list at first)
{
  const { p, dlg } = await open({ voices: [...EN, DA], lateMs: 4500 });
  await dlg.getByRole("button", { name: /^Listen/ }).click();
  await p.waitForTimeout(6000);
  const s = await p.evaluate(() => window.__spoken);
  ok(s.length === 1 && s[0].voice === "Sara", "C: Listen pressed before the voice list loaded waits, then speaks with the Danish voice");
  await p.close();
}
// E. Maru (invented language, not strict): still speaks with whatever voice exists
{
  const { p, dlg } = await open({ voices: EN }, "maru");
  await dlg.getByRole("button", { name: /^Listen/ }).click();
  await p.waitForTimeout(300);
  ok((await p.evaluate(() => window.__spoken.length)) === 1, "E: the invented language is still spoken (approximation) without a Danish voice");
  await p.close();
}
await b.close();
process.exit(failed ? 1 : 0);
