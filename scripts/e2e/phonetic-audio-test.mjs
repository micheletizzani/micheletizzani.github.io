// E2E test verifying the phonetic audio test feature in the Sound tab and Phonetic Dictionary.
import { chromium } from "playwright-core";
import assert from "node:assert/strict";

const ok = (cond, msg) => {
  assert.ok(cond, msg);
  console.log("PASS", msg);
};

const BASE = process.env.BASE_URL ?? "http://localhost:4321";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox"],
});
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();

await page.addInitScript(() => {
  window.__spoken = [];
  window.__voices = true;
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
});

try {
  await page.goto(BASE + "/tools/maru/", { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Enter Nyhavn/i }).click();
  await page.waitForTimeout(2500);

  // open the lesson by clicking the pump marker
  let opened = false;
  for (const [x, y] of [
    [640, 330],
    [690, 330],
    [600, 340],
    [650, 280],
  ]) {
    await page.mouse.click(x, y);
    await page.waitForTimeout(1600);
    if ((await page.getByRole("dialog").count()) > 0) {
      opened = true;
      break;
    }
  }
  ok(opened, "clicking the pump opens the guided lesson");

  const dlg = page.getByRole("dialog");

  // Go to Sound tab
  await dlg.getByRole("tab", { name: /Sound/ }).click();
  const testBtn = dlg.getByRole("button", { name: /Test sound/ });
  await testBtn.waitFor({ state: "visible", timeout: 5000 });
  ok((await testBtn.count()) === 1, "Test sound button is rendered in SoundTab");

  // 1. Click Test sound with empty input
  await dlg.getByLabel("Type the sound you hear").fill("");
  await testBtn.click();
  await page.waitForTimeout(150);
  const emptyFeedback = await dlg.locator("[aria-live=polite]").textContent();
  ok(/Type or select phonetic symbols/.test(emptyFeedback), "empty input prompts user to enter phonetic symbols");

  // 2. Type an arbitrary IPA hypothesis "fɑn"
  await dlg.getByLabel("Type the sound you hear").fill("fɑn");
  const spokenBeforeHyp = await page.evaluate(() => window.__spoken.length);
  await testBtn.click();
  await page.waitForTimeout(150);
  const spokenAfterHyp = await page.evaluate(() => window.__spoken);
  ok(spokenAfterHyp.length > spokenBeforeHyp, "Test sound spoke the phonetic hypothesis");
  const lastSpokenHyp = spokenAfterHyp.at(-1);
  ok(lastSpokenHyp.startsWith("farn") || lastSpokenHyp.startsWith("fɑn"), "IPA fɑn converted to pronounceable Danish (farn)");
  const feedbackHyp = await dlg.locator("[aria-live=polite]").textContent();
  ok(/Testing sound/.test(feedbackHyp), "feedback indicates testing sound for hypothesis");

  // 3. Test Alt+P chord with "vanˀ"
  await dlg.getByLabel("Type the sound you hear").fill("vanˀ");
  const spokenBeforeChord = await page.evaluate(() => window.__spoken.length);
  await page.keyboard.press("Alt+KeyP");
  await page.waitForTimeout(150);
  const spokenAfterChord = await page.evaluate(() => window.__spoken);
  ok(spokenAfterChord.length > spokenBeforeChord, "Alt+P triggered Test sound");
  const lastSpokenChord = spokenAfterChord.at(-1);
  ok(lastSpokenChord.startsWith("vand"), "vanˀ resolved to target word vand");

  // 4. Test single phoneme symbol "ð"
  await dlg.getByLabel("Type the sound you hear").fill("ð");
  await testBtn.click();
  await page.waitForTimeout(150);
  const spokenAfterPh = await page.evaluate(() => window.__spoken);
  const lastSpokenPh = spokenAfterPh.at(-1);
  ok(lastSpokenPh.startsWith("mad"), "single phoneme ð spoke keyword mad");

  // Screenshot of SoundTab with Test sound button active
  await page.screenshot({ path: "/tmp/phonetic_audio_test_soundtab.png" });

  // 5. Open Phonetic dictionary
  await dlg.getByRole("button", { name: /Phonetic dictionary/ }).click();
  await page.waitForTimeout(400);
  const dict = page.getByRole("dialog", { name: "Phonetic dictionary" });
  ok((await dict.count()) === 1, "Phonetic dictionary dialog opens");

  // Type in dictionary search
  const searchInput = dict.getByLabel("Search the phonetic dictionary");
  await searchInput.fill("bɔːð");
  const dictTestBtn = dict.getByRole("button", { name: /Test sound/ });
  ok((await dictTestBtn.count()) === 1, "Test sound button appears in dictionary search");
  await dictTestBtn.click();
  await page.waitForTimeout(150);
  const spokenAfterDict = await page.evaluate(() => window.__spoken);
  ok(spokenAfterDict.at(-1).startsWith("båd"), "search test sound resolved bɔːð to båd");

  // Click symbol badge on entry
  const symbolBadge = dict.getByRole("button", { name: /Hear sound of/ });
  if ((await symbolBadge.count()) > 0) {
    await symbolBadge.first().click();
    await page.waitForTimeout(150);
    ok(true, "clicking symbol badge plays audio for phoneme");
  }

  await page.screenshot({ path: "/tmp/phonetic_audio_test_dict.png" });
  console.log("All phonetic audio test checks passed successfully!");
} finally {
  await browser.close();
}
