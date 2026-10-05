// End-to-end check for Language Quest. NOT part of `npm test`: it needs a browser.
//   npm i -D playwright-core            (once)
//   npm run dev                          (in another terminal)
//   CHROMIUM_PATH=/path/to/chromium BASE_URL=http://localhost:4321 node scripts/e2e/danish-lesson.mjs
// Software WebGL flags are used so it also runs on machines without a GPU (slowly).
import { chromium } from "playwright-core";
import { clickMarker } from "./_lq.mjs";
const BASE = process.env.BASE_URL ?? "http://localhost:4321";
const launch = () =>
  chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
  });
const b = await launch();
let failed = 0;
const ok = (c, m) => (console.log(c ? "PASS" : "FAIL", m), c || (failed += 1));
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
const p = await ctx.newPage();
p.on("pageerror", (e) => console.log("ERR:", e.message.slice(0, 500)));
await p.addInitScript(() => {
  window.__spoken = [];
  window.__osc = 0;
  window.__heard = "vand";
  Object.defineProperty(window, "speechSynthesis", {
    value: {
      speak(u) {
        window.__spoken.push(u.text + "|" + u.lang);
      },
      cancel() {},
      getVoices: () => [{ name: "Sara", lang: "da-DK", localService: true }],
      addEventListener() {},
      removeEventListener() {},
    },
    configurable: true,
  });
  window.SpeechSynthesisUtterance = function (t) {
    this.text = t;
  };
  const Fake = function () {
    this.start = () =>
      setTimeout(() => {
        this.onresult({ results: [[{ transcript: window.__heard }, { transcript: "x" }]] });
        this.onend && this.onend();
      }, 50);
  };
  window.SpeechRecognition = Fake;
  window.webkitSpeechRecognition = Fake;
});
await p.goto(BASE + "/tools/maru/", { waitUntil: "networkidle" });
await p.evaluate(() => {
  localStorage.clear();
  localStorage.setItem("language-quest-pack", "da"); // Chapter 2, the Nyhavn pack
});
await p.reload({ waitUntil: "networkidle" });
await p.getByRole("button", { name: /Enter Nyhavn/i }).click();
await p.waitForTimeout(2500);
ok(!(await p.evaluate(() => window.__spoken.length)), "walking near the pump makes no sound");

// open the lesson by clicking the pump marker
let opened = false;
await clickMarker(p, "fountain");
await p.waitForTimeout(2500);
opened = (await p.getByRole("dialog").count()) > 0;
ok(opened, "clicking the pump opens the guided lesson");
ok((await p.evaluate(() => window.__spoken.length)) === 0, "opening the lesson does not autoplay audio");
await p.waitForTimeout(1500);
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/l1_observe.png" });

// --- Observe: unseen clues are hidden, looking closer reveals them
const dlg = p.getByRole("dialog").first();
const cards = dlg.getByRole("button", { name: /Look closer/ });
ok((await cards.count()) >= 4, "clues start face-down (" + (await cards.count()) + " cards)");
await cards.first().click();
await cards.first().click();
await cards.first().click();
ok((await dlg.getByText(/brass pump spouts|holds a cup|Pointing at the stream/).count()) >= 2, "clues reveal on click");
await dlg
  .getByRole("button", { name: /Vand\.?/i })
  .first()
  .click()
  .catch(() => {});
ok(
  (await p.evaluate(() => window.__spoken)).some((s) => s.startsWith("Vand.") && s.endsWith("da-DK")),
  "the NPC line plays only when asked, in a Danish voice"
);
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/l2_observe_clues.png" });

// --- Sound
await dlg.getByRole("tab", { name: /Sound/ }).click();
await p.waitForTimeout(300);
await dlg
  .getByRole("button", { name: /Listen/ })
  .first()
  .click();
ok((await p.evaluate(() => window.__spoken.at(-1))) === "vand|da-DK", "Listen speaks the word with the da-DK voice");
await dlg.getByRole("button", { name: /Hint/ }).click();
ok(/syllable/.test(await dlg.locator("[aria-live=polite]").textContent()), "hint 1 gives the syllable count");
await dlg.getByRole("button", { name: /Hint/ }).click();
console.log("   hint 2:", (await dlg.locator("[aria-live=polite]").textContent()).trim());
await dlg.getByRole("button", { name: /Hint/ }).click();
console.log("   hint 3:", (await dlg.locator("[aria-live=polite]").textContent()).trim());
// symbol keyboard + dictionary insert
await dlg.getByLabel("Type the sound you hear").fill("");
await dlg
  .getByRole("button", { name: "ɑ" })
  .first()
  .click()
  .catch(() => {});
await dlg.getByRole("button", { name: /Phonetic dictionary/ }).click();
await p.waitForTimeout(400);
ok((await p.getByRole("dialog", { name: "Phonetic dictionary" }).count()) === 1, "phonetic dictionary opens over the lesson");
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/l3_dictionary.png" });
await p
  .getByRole("button", { name: /^v labiodental|v labio/ })
  .first()
  .click()
  .catch(() => {});
await p
  .getByRole("dialog", { name: "Phonetic dictionary" })
  .getByRole("button", { name: /^v / })
  .first()
  .click()
  .catch(() => {});
const ins = p.getByRole("button", { name: /Insert “v”/ });
if (await ins.count()) {
  await ins.click();
}
await p.keyboard.press("Escape"); // closes the dictionary only
await p.waitForTimeout(200);
ok(
  (await p.getByRole("dialog", { name: "Phonetic dictionary" }).count()) === 0 && (await p.getByRole("dialog").count()) >= 1,
  "Esc closes only the dictionary"
);
const typed = await dlg.getByLabel("Type the sound you hear").inputValue();
ok(typed.includes("v"), "dictionary inserted the symbol into the answer: '" + typed + "'");
// wrong, then right (IPA, ignoring stød)
await dlg.getByLabel("Type the sound you hear").fill("fɑn");
await p.keyboard.press("Enter");
await p.waitForTimeout(200);
console.log("   after wrong:", (await dlg.locator("[aria-live=polite]").textContent()).trim());
await dlg.getByLabel("Type the sound you hear").fill("vanˀ");
await p.keyboard.press("Enter");
await p.waitForTimeout(400);
ok((await dlg.getByText("Sound recorded").count()) === 1, "correct IPA (with stød) records the sound");
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/l4_sound_done.png" });

// --- Meaning
await dlg.getByRole("tab", { name: /Meaning/ }).click();
await p.waitForTimeout(300);
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/l5_meaning_before.png" });
await dlg.getByRole("radio", { name: /water/ }).click();
await p.waitForTimeout(200);
console.log("   evidence:", (await dlg.locator("li").first().textContent()).replace(/\s+/g, " ").slice(0, 160));
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/l6_meaning.png" });
ok((await dlg.getByRole("radio", { name: /water/ }).getAttribute("aria-checked")) === "true", "a meaning card can be chosen");
await dlg.getByRole("button", { name: /Record in notebook/ }).click();
await p.waitForTimeout(500);
ok((await p.getByRole("dialog").count()) === 0, "recording closes the lesson");
// --- notebook
await p.getByRole("button", { name: "Field notebook" }).click();
await p.waitForTimeout(400);
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/l7_notebook.png" });
const nb = p.getByRole("dialog", { name: "Field notebook" });
ok((await nb.getByText("What you noticed").count()) === 1, "notebook shows the word page with observations");
ok((await nb.getByText("[vanˀ]").count()) >= 1, "notebook shows the recorded sound");
await nb.getByRole("tab", { name: "Sounds" }).click();
await p.waitForTimeout(300);
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/l8_sounds.png" });
await nb.getByRole("tab", { name: "Story" }).click();
ok((await nb.getByText("Quay Water Pump").count()) >= 1, "notebook story tab lists encounters");
// progress persists across reload
await p.keyboard.press("Escape");
await p.reload({ waitUntil: "networkidle" });
const saved = await p.evaluate(() => localStorage.getItem("language-quest-progress-v1:da"));
ok(saved && JSON.parse(saved).done.includes("fountain"), "progress is saved per language");
await b.close();
process.exit(failed ? 1 : 0);
