import { chromium } from "@playwright/test";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
await fs.mkdir(".qa", { recursive: true });
let browser;
try {
  browser = await chromium.launch({ headless: true });
} catch {
  browser = await chromium.launch({ headless: true, channel: "chrome" });
}
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  reducedMotion: "reduce",
});
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:5173");
await page.waitForLoadState("networkidle");
await page.screenshot({ path: ".qa/landing-desktop.png", fullPage: true });
await page
  .getByRole("link", { name: "Open workspace", exact: false })
  .first()
  .click();
await page
  .getByRole("heading", { name: "Welcome back, Dr. Maya Hassan" })
  .waitFor();
await page.screenshot({ path: ".qa/dashboard-desktop.png", fullPage: true });
await page.getByRole("link", { name: "Case library", exact: true }).click();
await page.getByRole("textbox", { name: "Search cases" }).fill("OC-0248");
assert.equal(await page.locator("tbody tr").count(), 1);
await page.getByRole("link", { name: "Review OC-0248", exact: true }).click();
await page
  .getByRole("heading", { name: "Timing variation", exact: true })
  .waitFor();
await page.getByRole("button", { name: "Confirm", exact: true }).click();
await page.getByRole("button", { name: "Undo", exact: true }).waitFor();
await page
  .getByRole("textbox", { name: "Clinical review notes" })
  .fill("Reviewed timing in context — demo QA.");
await page.getByRole("button", { name: "Save notes" }).click();
await page.reload();
await page.getByRole("textbox", { name: "Clinical review notes" }).waitFor();
assert.equal(
  await page
    .getByRole("textbox", { name: "Clinical review notes" })
    .inputValue(),
  "Reviewed timing in context — demo QA.",
);
await page.screenshot({ path: ".qa/review-desktop.png", fullPage: true });
const dl = page.waitForEvent("download");
await page.getByRole("button", { name: "Export review" }).click();
const download = await dl;
assert.match(download.suggestedFilename(), /OC-0248/);
await page
  .getByRole("button", { name: "Complete review", exact: true })
  .click();
assert.equal(
  await page
    .getByRole("button", { name: "Review completed", exact: true })
    .isDisabled(),
  true,
);
await page.getByRole("link", { name: "Performance", exact: true }).click();
await page
  .getByRole("combobox", { name: "Filter by surgeon" })
  .selectOption("Dr. Maya Hassan");
assert.equal(await page.locator("tbody tr").count(), 2);
await page.getByRole("button", { name: "New case", exact: true }).click();
await page.getByRole("button", { name: "Open case", exact: true }).click();
await page.getByRole("alert").waitFor();
const videoBytes = await page.evaluate(async () => {
  const canvas = document.createElement("canvas");
  canvas.width = 320;
  canvas.height = 180;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#332244";
  ctx.fillRect(0, 0, 320, 180);
  const stream = canvas.captureStream(10);
  const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  const chunks = [];
  recorder.ondataavailable = (e) => chunks.push(e.data);
  const done = new Promise((resolve) => (recorder.onstop = resolve));
  recorder.start();
  await new Promise((resolve) => setTimeout(resolve, 300));
  ctx.fillStyle = "#aa88dd";
  ctx.fillRect(20, 20, 100, 100);
  await new Promise((resolve) => setTimeout(resolve, 200));
  recorder.stop();
  await done;
  stream.getTracks().forEach((t) => t.stop());
  return Array.from(
    new Uint8Array(
      await new Blob(chunks, { type: "video/webm" }).arrayBuffer(),
    ),
  );
});
await page.getByLabel("Select video").setInputFiles({
  name: "test-recording.webm",
  mimeType: "video/webm",
  buffer: Buffer.from(videoBytes),
});
await page.getByRole("button", { name: "Open case", exact: true }).click();
await page.locator("video").waitFor();
await page.waitForFunction(
  () => document.querySelector("video")?.readyState >= 2,
);
assert(await page.locator("video").evaluate((v) => v.videoWidth > 0));
await page.setViewportSize({ width: 390, height: 844 });
for (const route of [
  "/",
  "/overview",
  "/cases",
  "/case/OC-0248",
  "/analytics",
  "/settings",
]) {
  await page.goto(`http://127.0.0.1:5173/#${route}`);
  await page.waitForLoadState("networkidle");
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `Overflow ${route}`,
  );
  await page.screenshot({
    path: `.qa/mobile-${route.replaceAll("/", "-") || "home"}.png`,
    fullPage: true,
  });
}
await page.getByRole("button", { name: "Toggle sidebar" }).click();
await page.getByRole("link", { name: "Case library", exact: true }).click();
assert.equal(
  await page
    .getByRole("button", { name: "Toggle sidebar" })
    .getAttribute("aria-expanded"),
  "false",
);
assert.deepEqual(errors, []);
console.log(
  JSON.stringify({
    result: "PASS",
    checks: [
      "routing",
      "search",
      "review decisions",
      "notes persistence",
      "export",
      "complete review",
      "analytics filter",
      "upload validation",
      "actual local video playback",
      "mobile overflow",
      "mobile navigation",
    ],
    errors,
  }),
);
await browser.close();
