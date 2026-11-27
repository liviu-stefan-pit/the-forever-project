/**
 * After `vite build`, write crawl files into dist:
 * - sitemap.xml for the public pages and every guide
 * - a copy of the built shell at each of those URLs, with that page's title,
 *   description, canonical and Open Graph tags already in the HTML
 *
 * Quest, profile and transfer stay on the shared shell (see public/_redirects).
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const SITE_ORIGIN = "https://theforeverproject.app";

/** Written into dist. A `robots.txt` in the repo is ignored by the `*.txt` gitignore rule. */
export const ROBOTS_TXT = `User-agent: *
Allow: /
Disallow: /profile
Disallow: /transfer

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;

const DEFAULT_DESCRIPTION =
  "Free, fan-made Horde 1–60 leveling routes for WoW Forever: Balanced and Speedrun paces, maps, quest details and class tips.";

export interface SeoPage {
  /** Path beginning with `/`. `/` is the homepage. */
  path: string;
  title: string;
  description: string;
}

export interface GuideMeta {
  slug: string;
  displayName: string;
  minLevel: number;
  maxLevel: number;
  subgroup?: string;
}

/** Public pages, in sitemap order. Guide URLs are appended from the built data. */
export const STATIC_PAGES: readonly SeoPage[] = [
  {
    path: "/",
    title: "The Forever Project — WoW Forever leveling guide",
    description: DEFAULT_DESCRIPTION,
  },
  {
    path: "/about",
    title: "About · The Forever Project",
    description: "What The Forever Project is: a free fan-made Horde leveling guide for WoW Forever, how it is tested, and how to get in touch.",
  },
  {
    path: "/credits",
    title: "Credits · The Forever Project",
    description: "Sources and credits for The Forever Project, including the quest database and the cited public pages.",
  },
  {
    path: "/addons",
    title: "Addons · The Forever Project",
    description: "Optional WoW Forever addons: GuideWebExport syncs quest progress, and AdventureLog records a play session.",
  },
  {
    path: "/horde",
    title: "Horde 1–60 · The Forever Project",
    description: "Pick a Horde race and follow the Balanced or Speedrun route from level 1 to 60.",
  },
  {
    path: "/overview",
    title: "Route overview · The Forever Project",
    description: "The Horde route from 1 to 60: zones, level brackets, and where the Balanced and Speedrun lines go.",
  },
  {
    path: "/gold",
    title: "Gold plan · The Forever Project",
    description: "What to save for while leveling: riding, dual spec, and where gold comes from in each level bracket.",
  },
];

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function guidePage(guide: GuideMeta): SeoPage {
  const title = `${guide.displayName} · The Forever Project`;
  const description =
    guide.subgroup === "Dungeons"
      ? `Dungeon guide: ${guide.displayName}. Optional dungeon steps for the Horde route on WoW Forever.`
      : `Horde ${guide.minLevel}–${guide.maxLevel} guide: ${guide.displayName}. Balanced and Speedrun routes for WoW Forever.`;
  return { path: `/guide/${guide.slug}`, title, description };
}

export function pagesFor(guides: readonly GuideMeta[]): SeoPage[] {
  const guidesInOrder = [...guides].sort((a, b) => a.slug.localeCompare(b.slug));
  return [...STATIC_PAGES, ...guidesInOrder.map(guidePage)];
}

/** Replace the shared title and description, and add canonical plus og:url. */
export function applyPageMeta(html: string, page: SeoPage): string {
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  const url = escapeHtml(pageUrl(page.path));
  let next = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
  next = replaceMeta(next, "name", "description", description);
  next = replaceMeta(next, "property", "og:title", title);
  next = replaceMeta(next, "property", "og:description", description);
  next = replaceMeta(next, "name", "twitter:title", title);
  next = replaceMeta(next, "name", "twitter:description", description);
  next = replaceMeta(next, "property", "og:url", url);
  next = replaceLink(next, "canonical", url);
  return next;
}

export function sitemapXml(pages: readonly SeoPage[]): string {
  const urls = pages
    .map((page) => `  <url><loc>${escapeHtml(pageUrl(page.path))}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function loadGuides(guidesDir: string): GuideMeta[] {
  return readdirSync(guidesDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => {
      const guide = JSON.parse(readFileSync(join(guidesDir, name), "utf8")) as Partial<GuideMeta>;
      if (!guide.slug || !guide.displayName || guide.minLevel == null || guide.maxLevel == null) {
        throw new Error(`${name} is missing slug, displayName, or levels`);
      }
      return {
        slug: guide.slug,
        displayName: guide.displayName,
        minLevel: guide.minLevel,
        maxLevel: guide.maxLevel,
        ...(guide.subgroup ? { subgroup: guide.subgroup } : {}),
      };
    });
}

/** Write sitemap.xml and one index.html per public URL. `shellHtml` is the built homepage. */
export function writeSeo(distDir: string, shellHtml: string, guides: readonly GuideMeta[]): SeoPage[] {
  const pages = pagesFor(guides);
  for (const page of pages) {
    const html = applyPageMeta(shellHtml, page);
    if (page.path === "/") {
      writeFileSync(join(distDir, "index.html"), html);
      continue;
    }
    const dir = join(distDir, page.path.slice(1));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), html);
  }
  writeFileSync(join(distDir, "sitemap.xml"), sitemapXml(pages));
  writeFileSync(join(distDir, "robots.txt"), ROBOTS_TXT);
  return pages;
}

function pageUrl(path: string): string {
  return path === "/" ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

function replaceMeta(html: string, attr: "name" | "property", key: string, content: string): string {
  const tag = `<meta ${attr}="${key}" content="${content}" />`;
  const re = new RegExp(`<meta\\b[^>]*\\b${attr}="${key}"[^>]*>`, "i");
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function replaceLink(html: string, rel: string, href: string): string {
  const tag = `<link rel="${rel}" href="${href}" />`;
  const re = new RegExp(`<link\\b[^>]*\\brel="${rel}"[^>]*>`, "i");
  if (re.test(html)) return html.replace(re, tag);
  return html.replace("</head>", `    ${tag}\n  </head>`);
}

function main(): void {
  const distDir = fileURLToPath(new URL("../dist", import.meta.url));
  const shellPath = join(distDir, "index.html");
  const guidesDir = join(distDir, "data", "guides");
  const shellHtml = readFileSync(shellPath, "utf8");
  const guides = loadGuides(guidesDir);
  const pages = writeSeo(distDir, shellHtml, guides);
  console.log(`[seo] ${pages.length} pages (${guides.length} guides) → sitemap.xml`);
}

const invokedDirectly = process.argv[1] != null && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (invokedDirectly) main();
