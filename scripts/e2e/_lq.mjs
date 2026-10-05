// Shared helpers for the browser checks: find things on screen through the scene's own camera (window.__lq).
export async function waitForWorld(p) {
  await p.waitForFunction(() => !!window.__lq, null, { timeout: 15000 });
}
/** Screen position of an encounter marker, once the camera has stopped moving. */
export async function markerPoint(p, id) {
  await waitForWorld(p);
  let last = null;
  for (let i = 0; i < 40; i++) {
    const now = await p.evaluate((m) => window.__lq.marker(m), id);
    if (last && Math.hypot(now.x - last.x, now.y - last.y) < 0.5) return now;
    last = now;
    await p.waitForTimeout(250);
  }
  return last;
}
export async function clickMarker(p, id) {
  const { x, y } = await markerPoint(p, id);
  await p.mouse.click(x, y);
}
