/**
 * Generates brand assets from the supplied logo and a set of placeholder images
 * used by the demo seed. Run with: npm run assets
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const brandDir = path.join(root, "public", "brand");
const demoDir = path.join(root, "public", "demo");

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  return [h, s, l];
}

/** Removes the dark olive vignette behind the gold artwork, keeping gold and blue pixels. */
async function cutOutLogo() {
  const src = path.join(brandDir, "logo.png");
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  const smooth = (x: number, a: number, b: number) => Math.min(1, Math.max(0, (x - a) / (b - a)));
  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const [h, s] = rgbToHsl(r, g, b);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const isBlue = h > 170 && h < 230 && s > 0.3;
    const goldHue = h >= 20 && h <= 50;
    // Background is olive (hue ~50-70) and dark. Gold is warmer (hue 30-45) and brighter.
    let alpha = smooth(lum, 0.2, 0.36);
    if (goldHue) alpha = Math.max(alpha, smooth(lum, 0.14, 0.26));
    if (isBlue) alpha = 1;
    if (!goldHue && !isBlue) alpha = Math.min(alpha, smooth(lum, 0.3, 0.5));
    out[i + 3] = Math.round(alpha * 255);
  }
  const transparent = sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png();
  await transparent.clone().toFile(path.join(brandDir, "logo-transparent.png"));

  // Trim to content: full lockup and house mark only.
  await sharp(path.join(brandDir, "logo-transparent.png")).trim().png().toFile(path.join(brandDir, "logo-lockup.png"));
  // sharp runs trim() before extract() internally, so crop first and trim in a second pass.
  const houseCrop = await sharp(path.join(brandDir, "logo-transparent.png"))
    .extract({ left: 270, top: 140, width: 484, height: 430 })
    .png()
    .toBuffer();
  await sharp(houseCrop).trim().png().toFile(path.join(brandDir, "logo-mark.png"));

  // Favicon / app icon: house mark centred on the brand olive.
  const mark = await sharp(path.join(brandDir, "logo-mark.png")).resize(380, 380, { fit: "inside" }).png().toBuffer();
  const markMeta = await sharp(mark).metadata();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: "#1a1d0c" } })
    .composite([
      {
        input: mark,
        left: Math.round((512 - (markMeta.width ?? 380)) / 2),
        top: Math.round((512 - (markMeta.height ?? 380)) / 2),
      },
    ])
    .png()
    .toFile(path.join(root, "src", "app", "icon.png"));
  await sharp(path.join(root, "src", "app", "icon.png")).resize(180, 180).png().toFile(path.join(root, "src", "app", "apple-icon.png"));
}

type Palette = { skyTop: string; skyMid: string; glow: string; hillFar: string; hillNear: string; ground: string };

function landscapeSvg(w: number, h: number, p: Palette, seed: number): string {
  const horizon = Math.round(h * 0.58);
  const rows = 9;
  const cols = 14;
  let grid = "";
  // Perspective plot grid on the ground plane.
  for (let r = 0; r <= rows; r++) {
    const t = r / rows;
    const y = horizon + (h - horizon) * t * t;
    grid += `<line x1="0" y1="${y.toFixed(1)}" x2="${w}" y2="${y.toFixed(1)}" stroke="#E8CF8F" stroke-opacity="${(0.06 + t * 0.12).toFixed(3)}" stroke-width="${(1 + t * 2).toFixed(1)}"/>`;
  }
  const vx = w * (0.45 + ((seed * 37) % 10) / 100);
  for (let c = 0; c <= cols; c++) {
    const x = (c / cols) * w;
    grid += `<line x1="${vx.toFixed(1)}" y1="${horizon}" x2="${(x * 1.6 - w * 0.3).toFixed(1)}" y2="${h}" stroke="#E8CF8F" stroke-opacity="0.12" stroke-width="1.5"/>`;
  }
  const sunX = w * (0.62 + ((seed * 13) % 20) / 100);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.skyTop}"/>
      <stop offset="0.62" stop-color="${p.skyMid}"/>
    </linearGradient>
    <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.hillNear}"/>
      <stop offset="1" stop-color="${p.ground}"/>
    </linearGradient>
    <radialGradient id="glow" cx="${(sunX / w).toFixed(3)}" cy="${(horizon / h).toFixed(3)}" r="0.45">
      <stop offset="0" stop-color="${p.glow}" stop-opacity="0.85"/>
      <stop offset="1" stop-color="${p.glow}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#sky)"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  <path d="M0 ${horizon - 70} C ${w * 0.2} ${horizon - 130}, ${w * 0.4} ${horizon - 20}, ${w * 0.6} ${horizon - 90} S ${w * 0.9} ${horizon - 40}, ${w} ${horizon - 100} V ${horizon + 40} H 0 Z" fill="${p.hillFar}" fill-opacity="0.9"/>
  <path d="M0 ${horizon} C ${w * 0.25} ${horizon - 40}, ${w * 0.5} ${horizon + 30}, ${w * 0.75} ${horizon - 20} S ${w} ${horizon + 10}, ${w} ${horizon} V ${h} H 0 Z" fill="url(#ground)"/>
  ${grid}
  <path d="M ${w * 0.47} ${h} C ${w * 0.5} ${h * 0.85}, ${w * 0.52} ${h * 0.75}, ${vx.toFixed(1)} ${horizon + 6}" stroke="#F1E3BE" stroke-opacity="0.35" stroke-width="${Math.round(w * 0.012)}" fill="none" stroke-linecap="round"/>
  <rect width="${w}" height="${h}" fill="url(#vignette)"/>
</svg>`;
}

const palettes: Record<string, Palette> = {
  dawn: { skyTop: "#F6EEDC", skyMid: "#E6CFA1", glow: "#F1D89A", hillFar: "#6E7746", hillNear: "#4C5530", ground: "#242A15" },
  noon: { skyTop: "#EEF1E6", skyMid: "#D9D7B8", glow: "#F5EBC8", hillFar: "#7C8A55", hillNear: "#556237", ground: "#2A3118" },
  dusk: { skyTop: "#3B3920", skyMid: "#8C7443", glow: "#D8B573", hillFar: "#3F4626", hillNear: "#2C3218", ground: "#151809" },
  mist: { skyTop: "#F2F0E6", skyMid: "#CFCBAE", glow: "#E9DFC0", hillFar: "#8A9466", hillNear: "#5E6A3F", ground: "#2E3520" },
};

async function placeholder(name: string, w: number, h: number, p: Palette, seed: number) {
  const svg = Buffer.from(landscapeSvg(w, h, p, seed));
  await sharp(svg).blur(0.4).webp({ quality: 80 }).toFile(path.join(demoDir, `${name}.webp`));
}

async function main() {
  await fs.mkdir(demoDir, { recursive: true });
  await cutOutLogo();
  await placeholder("hero", 2400, 1400, palettes.dusk, 3);
  await placeholder("enclave-cover", 1600, 1000, palettes.dawn, 1);
  await placeholder("enclave-1", 1600, 1000, palettes.noon, 4);
  await placeholder("enclave-2", 1600, 1000, palettes.mist, 7);
  await placeholder("enclave-3", 1600, 1000, palettes.dusk, 9);
  await placeholder("gardens-cover", 1600, 1000, palettes.noon, 2);
  await placeholder("gardens-1", 1600, 1000, palettes.dawn, 6);
  await placeholder("greens-cover", 1600, 1000, palettes.mist, 5);
  await placeholder("site-1", 1600, 1000, palettes.dawn, 8);
  await placeholder("site-2", 1600, 1000, palettes.noon, 11);
  await placeholder("office", 1600, 1000, palettes.dusk, 12);
  // Layout plan placeholder: clean grid drawing.
  const plan = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100" viewBox="0 0 1600 1100">
    <rect width="1600" height="1100" fill="#F7F4EC"/>
    <g stroke="#3B3920" stroke-width="3" fill="#FFFDF8">
      ${Array.from({ length: 6 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => {
          const x = 120 + c * 138;
          const y = 120 + r * 150 + (r >= 3 ? 80 : 0);
          return `<rect x="${x}" y="${y}" width="118" height="120" rx="2"/>`;
        }).join(""),
      ).join("")}
    </g>
    <rect x="90" y="560" width="1420" height="60" fill="#D8B573" fill-opacity="0.35"/>
    <rect x="60" y="80" width="1480" height="960" fill="none" stroke="#3B3920" stroke-width="6" stroke-dasharray="18 12"/>
  </svg>`;
  await sharp(Buffer.from(plan)).webp({ quality: 85 }).toFile(path.join(demoDir, "layout-plan.webp"));
  console.log("Assets written to public/brand, public/demo and src/app/icon.png");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
