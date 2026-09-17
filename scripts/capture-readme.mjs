import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { execFileSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../docs/readme");
fs.mkdirSync(outDir, { recursive: true });

const BASE = process.env.PORTFOLIO_URL || "http://localhost:5175";

/** PNG captures; JPG variants are derived for the README where noted. */
const SECTIONS = [
  { id: "hero", file: "01-hero.png", wait: 2500 },
  { id: "experience", file: "02-experience.png", jpg: "02-experience.jpg", wait: 1400 },
  { id: "projects", file: "03-projects.png", jpg: "03-projects.jpg", wait: 1400 },
  { id: "about", file: "04-about.png", jpg: "04-about.jpg", wait: 1800 },
  { id: "contact", file: "05-contact.png", wait: 1500 },
];

async function hideCursor(page) {
  await page.addStyleTag({
    content: `
      canvas.pointer-events-none.fixed { visibility: hidden !important; }
      [style*="z-index: 100001"], [style*="z-index:100001"] { visibility: hidden !important; }
      html, body, * { cursor: default !important; }
    `,
  });
}

function toJpg(pngPath, jpgPath) {
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "82", pngPath, "--out", jpgPath], {
    stdio: "inherit",
  });
  fs.unlinkSync(pngPath);
}

function toGif(webmPath, gifPath) {
  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      webmPath,
      "-vf",
      "fps=8,scale=640:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=64:stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5",
      "-loop",
      "0",
      gifPath,
    ],
    { stdio: "inherit" },
  );
  fs.unlinkSync(webmPath);
}

async function main() {
  const captureUrl = `${BASE.replace(/\/$/, "")}/?capture=1`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    // Match the MacBook-sized page frame so docs match the locked layout.
    viewport: { width: 1470, height: 956 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  // ?capture=1 freezes idle stretch so hero/tour stay on Standing.
  await page.goto(captureUrl, { waitUntil: "networkidle", timeout: 60000 });
  await hideCursor(page);
  // Give the GLB / animations a moment to settle
  await page.waitForTimeout(2500);

  for (const section of SECTIONS) {
    await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
      else window.scrollTo(0, 0);
    }, section.id);
    await page.waitForTimeout(section.wait);
    const dest = path.join(outDir, section.file);
    await page.screenshot({ path: dest, type: "png" });
    console.log("saved", dest);
    if (section.jpg) {
      const jpgDest = path.join(outDir, section.jpg);
      toJpg(dest, jpgDest);
      console.log("saved", jpgDest);
    }
  }

  // Short scroll tour video → GIF for the README
  const videoPath = path.join(outDir, "tour.webm");
  const videoContext = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    recordVideo: { dir: outDir, size: { width: 1280, height: 720 } },
  });
  const vpage = await videoContext.newPage();
  await vpage.goto(captureUrl, { waitUntil: "networkidle", timeout: 60000 });
  await hideCursor(vpage);
  await vpage.waitForTimeout(2000);

  const ids = ["hero", "experience", "projects", "about", "contact"];
  for (const id of ids) {
    await vpage.evaluate((sectionId) => {
      const el = document.getElementById(sectionId);
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      const start = window.scrollY;
      const dist = top - start;
      const duration = 1100;
      const t0 = performance.now();
      return new Promise((resolve) => {
        const step = (now) => {
          const p = Math.min(1, (now - t0) / duration);
          const e = 1 - Math.pow(1 - p, 3);
          window.scrollTo(0, start + dist * e);
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    }, id);
    await vpage.waitForTimeout(700);
  }
  await vpage.waitForTimeout(800);

  const recorded = await vpage.video().path();
  await videoContext.close();
  fs.renameSync(recorded, videoPath);
  console.log("saved", videoPath);

  const gifPath = path.join(outDir, "tour.gif");
  toGif(videoPath, gifPath);
  console.log("saved", gifPath);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
