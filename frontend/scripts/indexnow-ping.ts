// scripts/indexnow-ping.ts
//
// IndexNow (https://www.indexnow.org) lets a site push "these URLs changed"
// notifications to participating search engines (Bing, and others that share
// the same index) instead of waiting for the next crawl. It does not replace
// the sitemap or general SEO — it's a faster notification channel on top of it.
//
// This is a MANUAL / CI-triggered script, not run automatically on every
// `npm run build` (a normal build shouldn't spam IndexNow on every deploy).
// Run it by hand after a real content change:
//
//   npm run indexnow
//
// Key file: public/0f7fe3193df226b27f075894e5b7ec16.txt (deployed at
// https://www.seleniun.com/0f7fe3193df226b27f075894e5b7ec16.txt) — this is
// the ownership proof IndexNow requires; its content must equal the key below.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SITE = "https://www.seleniun.com";
const KEY = "0f7fe3193df226b27f075894e5b7ec16";

function urlsFromSitemap(): string[] {
  const xml = fs.readFileSync(path.join(ROOT, "public", "sitemap.xml"), "utf8");
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1]);
}

async function main() {
  const urlList = urlsFromSitemap();
  if (urlList.length === 0) {
    console.error("[indexnow] no URLs found in public/sitemap.xml — aborting.");
    process.exit(1);
  }

  const body = {
    host: "www.seleniun.com",
    key: KEY,
    keyLocation: `${SITE}/${KEY}.txt`,
    urlList,
  };

  console.log(`[indexnow] submitting ${urlList.length} URLs...`);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });

  console.log(`[indexnow] response: ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(text);
    process.exit(1);
  }
}

main();
