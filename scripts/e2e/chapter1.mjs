// End-to-end check for Danish chapter 1 ("Skilt"): story text at checkpoints, the five encounters, the finale and the end card.
//   npm run dev   then   node scripts/e2e/chapter1.mjs   (software WebGL: slow)
import { chromium } from "playwright-core";
import { clickMarker, waitForWorld } from "./_lq.mjs";
const BASE = process.env.BASE_URL ?? "http://localhost:4321";
const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});
let failed = 0;
const ok = (c, m) => (console.log(c ? "PASS" : "FAIL", m), c || (failed += 1));
const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
p.on("pageerror", (e) => console.log("ERR:", e.message.slice(0, 400)));
await p.addInitScript(() => {
  window.__spoken = [];
  Object.defineProperty(window, "speechSynthesis", {
    value: {
      speak: (u) => window.__spoken.push(u.text),
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
});
await p.goto(BASE + "/tools/maru/", { waitUntil: "networkidle" });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: "networkidle" });

const story = () => p.getByRole("dialog", { name: /story text|Chapter \d/ });
/** Read and dismiss every story box that is on screen (first Space finishes the line, the second moves on). */
async function drain() {
  for (let i = 0; i < 25 && (await story().count()); i++) {
    await p.keyboard.press("Space");
    await p.waitForTimeout(120);
    await p.keyboard.press("Space");
    await p.waitForTimeout(250);
  }
}

// --- map screen and chapter start
ok((await p.getByRole("button", { name: /Dansk 1 · Skilt/ }).getAttribute("aria-pressed")) === "true", "the Danish chapter 1 is the default pack");
ok((await p.getByRole("button", { name: /Dansk 2 · Navn/ }).count()) === 1, "chapter 2 (Nyhavn) is listed beside it");
await p.getByRole("button", { name: /^Enter Copenhagen Airport/ }).click();
await waitForWorld(p);
await p.waitForTimeout(1200);
const card = story();
ok((await card.count()) === 1 && /Chapter 1 · Skilt/.test((await card.textContent()) ?? ""), "the chapter card opens when the player enters");
await p.keyboard.press("Space");
await p.keyboard.press("Space");
await p.waitForTimeout(500);
await p.keyboard.press("Space");
await p.waitForTimeout(300);
const box = story();
ok((await box.count()) === 1 && /Paul Glotty/.test((await box.textContent()) ?? ""), "the first checkpoint speaks as Paul Glotty in a dialogue box");
ok((await p.evaluate(() => window.__spoken.length)) === 0, "story text makes no sound");
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/c1_box.png" });
await p.keyboard.press("Space");
await p.waitForTimeout(150);
await p.keyboard.press("Escape"); // skips the rest of the queue
await p.waitForTimeout(500);
ok((await story().count()) === 0, "Esc skips the queued story text");
ok(await p.getByText("Find your way out of the airport.").count(), "the objective bar shows the goal");

const chain = [
  {
    id: "boards",
    title: /The Two Boards/,
    sounds: ["ˈɑnkʌmsd", "ˈɑwɡɑŋ"],
    meanings: [/arrival/, /departure/],
    after: /fewer vowels/,
    objective: "Find the man in the yellow vest.",
  },
  {
    id: "door",
    title: /The Glass Panel/,
    sounds: ["ˈuðɡɑŋ", "døɐ"],
    meanings: [/exit/, /door/],
    after: /the man is thorough/,
    objective: "Climb to the hall above.",
  },
  {
    id: "machine",
    title: /The Machine/,
    sounds: ["biˈlɛd", "ˈmetʁo"],
    meanings: [/ticket/, /metro/],
    after: /like an apology/,
    objective: "Find the platform.",
  },
  {
    id: "platform",
    title: /The Carriage/,
    sounds: ["tɒw", "vɒɐ"],
    meanings: [/train/, /where/, /^is\b/, /metro/],
    after: /more informative/,
    objective: "Climb the stairs to the station sign.",
  },
];
for (const e of chain) {
  await clickMarker(p, e.id);
  let dlg = p.getByRole("dialog", { name: e.title });
  for (let i = 0; i < 30 && !(await dlg.count()); i++) {
    await drain(); // an "enter" checkpoint may appear while walking up to it
    await p.waitForTimeout(500);
  }
  if (!(await dlg.count()))
    console.log(
      "   dialogs now:",
      await p.getByRole("dialog").evaluateAll((els) => els.map((x) => x.getAttribute("aria-label"))),
      "pose:",
      await p.evaluate(() => JSON.stringify(window.__lq.pose()))
    );
  ok((await dlg.count()) === 1, `${e.id}: the lesson opens after the walk and its checkpoint text`);
  await dlg.getByRole("tab", { name: /Sound/ }).click();
  for (const s of e.sounds) {
    await dlg.getByLabel("Type the sound you hear").fill(s);
    await p.keyboard.press("Enter");
    await p.waitForTimeout(350);
  }
  ok(
    (await dlg.getByRole("tab", { name: /Sound/ }).textContent()).includes(`${e.sounds.length}/${e.sounds.length}`),
    `${e.id}: the sounds are accepted`
  );
  await dlg.getByRole("tab", { name: /Meaning/ }).click();
  const rows = dlg.locator("ul > li");
  for (let i = 0; i < e.meanings.length; i++) await rows.nth(i).getByRole("radio", { name: e.meanings[i] }).first().click();
  await dlg.getByRole("button", { name: /Record in notebook/ }).click();
  await p.waitForTimeout(3000); // the line is typed out gradually
  const done = story();
  ok((await done.count()) === 1 && e.after.test((await done.textContent()) ?? ""), `${e.id}: recording shows the Notebook line in a dialogue box`);
  await drain();
  ok((await p.getByText(e.objective).count()) >= 1, `${e.id}: the objective moves on to "${e.objective}"`);
}

// --- finale
await clickMarker(p, "sign");
for (let i = 0; i < 30 && !(await p.getByRole("dialog", { name: /The Station Sign/ }).count()); i++) {
  await drain();
  await p.waitForTimeout(500);
}
const fin = p.getByRole("dialog", { name: /The Station Sign/ });
ok((await fin.count()) === 1, "the final encounter opens the sentence sheet");
await fin.getByLabel("Type the sentence").fill("hvor metroen er");
await p.keyboard.press("Enter");
await p.waitForTimeout(300);
ok((await fin.getByText(/not quite what you were told/).count()) === 1, "a wrong word order is rejected");
for (const w of ["hvor", "er", "metroen"])
  await fin
    .getByRole("button", { name: new RegExp("^" + w + "$") })
    .first()
    .click();
await fin.getByRole("button", { name: /Say my sentence/ }).click();
await p.waitForTimeout(3500);
const last = story();
ok((await last.count()) === 1 && /loose tooth/.test((await last.textContent()) ?? ""), "solving the sentence shows the closing narration");
await p.keyboard.press("Space");
await p.waitForTimeout(150);
await p.keyboard.press("Space");
await p.waitForTimeout(3500);
const end = story();
ok((await end.count()) === 1 && /Chapter 2 · Navn/.test((await end.textContent()) ?? ""), "the end card announces chapter 2");
await p.screenshot({ path: (process.env.SHOTS ?? "/tmp") + "/c1_end.png" });
await drain();
const nb = p.getByRole("dialog", { name: "Field notebook" });
ok((await nb.count()) === 1, "after the story the notebook opens with the verdicts");
ok((await nb.getByTitle("correct").count()) >= 8, "verdict marks show the correct guesses");
await nb.getByRole("tab", { name: "Story" }).click();
ok(
  (await nb.getByText(/Story so far/).count()) === 1 && (await nb.getByText(/loose tooth/).count()) === 1,
  "the Story tab keeps a log of the story text"
);
const saved = JSON.parse(await p.evaluate(() => localStorage.getItem("language-quest-progress-v1:da")));
ok(saved.finished === true && saved.story.length >= 12, "progress (shared with Nyhavn, key 'da') holds the story log and the finish flag");
await b.close();
process.exit(failed ? 1 : 0);
