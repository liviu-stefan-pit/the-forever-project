#!/usr/bin/env node
/**
 * Renders the addon icons from their master SVGs (addon/<Name>/branding/icon.svg):
 *   branding/icon-{400,256,128,64}.png  still frame (the prefers-reduced-motion state)
 *   branding/icon.webp                  animated, 400 px, transparent corners
 *   branding/icon.gif                   animated, 256 px, on the site's dark canvas colour
 *   media/icon.tga                      64 px still frame for `## IconTexture:` in the .toc
 *   web/public/addons/<name>.svg|.png   copies for the site's Addons page
 *
 * Needs Chrome or Edge (or set CHROME_PATH) and ffmpeg with libwebp on PATH. No npm packages:
 * drives headless Chrome over the DevTools protocol with Node's built-in WebSocket.
 *
 *   node web/scripts/render-addon-icons.mjs [AdventureLog|GuideWebExport ...] [--stills]
 *   (--stills skips the animated exports, for quick iteration on a design)
 */
import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repo = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const ADDONS = ["AdventureLog", "GuideWebExport"];
const LOOP_SECONDS = 6; // every animation in the masters divides this
const FPS = 25;
const STILL_SIZES = [400, 256, 128, 64];
const CANVAS = { r: 0x12, g: 0x0c, b: 0x0a }; // web/tailwind.config `canvas`

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  const found = candidates.find((p) => existsSync(p));
  if (!found) throw new Error("Chrome/Edge not found; set CHROME_PATH");
  return found;
}

async function launch() {
  const profile = mkdtempSync(join(tmpdir(), "addon-icons-"));
  const proc = spawn(findChrome(), ["--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--hide-scrollbars", "--no-first-run", "about:blank"], {
    stdio: "ignore",
  });
  const portFile = join(profile, "DevToolsActivePort");
  for (let i = 0; i < 100 && !existsSync(portFile); i++) await new Promise((r) => setTimeout(r, 100));
  const port = readFileSync(portFile, "utf8").split("\n")[0].trim();
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const page = targets.find((t) => t.type === "page");
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((r, j) => ((ws.onopen = r), (ws.onerror = j)));
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    const p = pending.get(msg.id);
    if (!p) return;
    pending.delete(msg.id);
    msg.error ? p.reject(new Error(msg.error.message)) : p.resolve(msg.result);
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  const close = () => {
    ws.close();
    proc.kill();
    setTimeout(() => rmSync(profile, { recursive: true, force: true }), 500);
  };
  return { send, close };
}

async function render(cdp, svg, size, dir, { reducedMotion }) {
  const html = `<!doctype html><html><body style="margin:0;background:transparent">${svg.replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`;
  const file = join(dir, "page.html");
  writeFileSync(file, html);
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: size, height: size, deviceScaleFactor: 1, mobile: false });
  await cdp.send("Emulation.setDefaultBackgroundColorOverride", { color: { r: 0, g: 0, b: 0, a: 0 } });
  await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: reducedMotion ? "reduce" : "no-preference" }] });
  await cdp.send("Page.navigate", { url: "file:///" + file.replace(/\\/g, "/") });
  await new Promise((r) => setTimeout(r, 400));
}

async function shot(cdp, size, t) {
  if (t !== undefined) {
    // Seek every animation; the screenshot itself draws a fresh frame (waiting on
    // requestAnimationFrame here is throttled to seconds per frame in headless Chrome).
    await cdp.send("Runtime.evaluate", {
      expression: `document.getAnimations().forEach(a => { a.pause(); a.currentTime = ${t * 1000}; })`,
    });
  }
  const { data } = await cdp.send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: size, height: size, scale: 1 } });
  return Buffer.from(data, "base64");
}

function ffmpeg(args) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${args.join(" ")}`);
}

/** 32-bit uncompressed TGA, bottom-left origin, 8 alpha bits: the plainest form WoW loads. */
function writeTga(png, out, size, tmp) {
  const raw = join(tmp, "tga.raw");
  writeFileSync(join(tmp, "tga.png"), png);
  ffmpeg(["-i", join(tmp, "tga.png"), "-f", "rawvideo", "-pix_fmt", "bgra", raw]);
  const bgra = readFileSync(raw);
  const header = Buffer.alloc(18);
  header[2] = 2; // uncompressed true-colour
  header.writeUInt16LE(size, 12);
  header.writeUInt16LE(size, 14);
  header[16] = 32;
  header[17] = 8; // 8 alpha bits, bottom-left origin
  const rows = [];
  for (let y = size - 1; y >= 0; y--) rows.push(bgra.subarray(y * size * 4, (y + 1) * size * 4));
  writeFileSync(out, Buffer.concat([header, ...rows]));
}

async function main() {
  const stillsOnly = process.argv.includes("--stills");
  const wanted = process.argv.slice(2).filter((a) => !a.startsWith("--"));
  const names = wanted.length ? ADDONS.filter((n) => wanted.includes(n)) : ADDONS;
  const cdp = await launch();
  try {
    for (const name of names) {
      const branding = join(repo, "addon", name, "branding");
      const media = join(repo, "addon", name, "media");
      const site = join(repo, "web", "public", "addons");
      mkdirSync(media, { recursive: true });
      mkdirSync(site, { recursive: true });
      const svg = readFileSync(join(branding, "icon.svg"), "utf8");
      const tmp = mkdtempSync(join(tmpdir(), `${name}-`));
      try {
        for (const size of STILL_SIZES) {
          await render(cdp, svg, size, tmp, { reducedMotion: true });
          const png = await shot(cdp, size);
          writeFileSync(join(branding, `icon-${size}.png`), png);
          if (size === 64) writeTga(png, join(media, "icon.tga"), 64, tmp);
        }

        if (!stillsOnly) {
          await render(cdp, svg, 400, tmp, { reducedMotion: false });
          for (let f = 0; f < LOOP_SECONDS * FPS; f++) writeFileSync(join(tmp, `f${String(f).padStart(4, "0")}.png`), await shot(cdp, 400, f / FPS));
          const frames = ["-framerate", String(FPS), "-i", join(tmp, "f%04d.png")];
          ffmpeg([...frames, "-c:v", "libwebp_anim", "-lossless", "0", "-q:v", "82", "-pix_fmt", "yuva420p", "-loop", "0", join(branding, "icon.webp")]);
          const hex = [CANVAS.r, CANVAS.g, CANVAS.b].map((c) => c.toString(16).padStart(2, "0")).join("");
          ffmpeg([
            "-f", "lavfi", "-i", `color=c=0x${hex}:s=256x256:r=${FPS}`, ...frames,
            "-filter_complex",
            "[1:v]scale=256:256:flags=lanczos[i];[0:v][i]overlay=shortest=1,split[a][b];[a]palettegen=max_colors=256:stats_mode=full[p];[b][p]paletteuse=dither=sierra2_4a",
            "-loop", "0", join(branding, "icon.gif"),
          ]);
        }

        const lower = name.toLowerCase();
        copyFileSync(join(branding, "icon.svg"), join(site, `${lower}.svg`));
        copyFileSync(join(branding, "icon-128.png"), join(site, `${lower}-128.png`));
        console.log(`${name}: stills, icon.webp, icon.gif, media/icon.tga, web/public/addons/${lower}.*`);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    }
  } finally {
    cdp.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
