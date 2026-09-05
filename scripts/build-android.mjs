import { build } from "vite";
import { cp, readdir, readFile, rename, rm, stat } from "node:fs/promises";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const outDir = join(repo, "ash-android/app/src/main/assets");

const TEXT_EXTS = new Set([".html", ".js", ".css", ".svg", ".json", ".txt", ".xml", ".map"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

await rm(outDir, { recursive: true, force: true });

await build({
  configFile: false,
  root: repo,
  base: "./",
  publicDir: false,
  plugins: [tailwindcss(), viteReact()],
  resolve: {
    alias: { "@": join(repo, "src") },
  },
  build: {
    outDir,
    emptyOutDir: true,
    assetsDir: "assets",
    cssCodeSplit: false,
    sourcemap: false,
    rollupOptions: {
      input: join(repo, "index.android.html"),
    },
  },
});

const generatedHtml = join(outDir, "index.android.html");
const indexHtml = join(outDir, "index.html");
try {
  await stat(generatedHtml);
  await rename(generatedHtml, indexHtml);
} catch {
  await stat(indexHtml);
}

await cp(join(repo, "public/favicon.svg"), join(outDir, "favicon.svg"));

const files = await walk(outDir);
const problems = [];
const ALLOWED_URL = [
  /^https?:\/\/(www\.)?w3\.org\//i,
  /^https?:\/\/react\.dev\//i,
  /^https?:\/\/github\.com\//i,
  /^https?:\/\/(www\.)?tailwindcss\.com/i,
  /^https?:\/\/fb\.me\//i,
];

function isFetchedAbsoluteUrl(url) {
  return !ALLOWED_URL.some((re) => re.test(url));
}

for (const file of files) {
  const ext = extname(file).toLowerCase();
  if (!TEXT_EXTS.has(ext)) continue;
  const text = await readFile(file, "utf8");
  const rel = relative(outDir, file);

  if (ext === ".html") {
    const attrs = text.matchAll(/(?:src|href)=["']([^"']+)["']/gi);
    for (const match of attrs) {
      const value = match[1];
      if (/^https?:\/\//i.test(value)) problems.push(`${rel}: network ${match[0]}`);
      if (value.startsWith("/") && !value.startsWith("//")) {
        problems.push(`${rel}: leading-slash asset path ${value}`);
      }
    }
  }

  if (ext === ".css") {
    const urls = text.matchAll(/url\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi);
    for (const match of urls) {
      const value = match[1];
      if (/^https?:\/\//i.test(value)) problems.push(`${rel}: network font/asset ${value}`);
      if (value.startsWith("/") && !value.startsWith("//")) {
        problems.push(`${rel}: leading-slash asset path ${value}`);
      }
    }
    if (/@import\s+['"]https?:\/\//i.test(text)) {
      problems.push(`${rel}: CSS @import from the network`);
    }
  }

  if (ext === ".js" || ext === ".svg" || ext === ".html" || ext === ".css") {
    const absUrls = text.match(/https?:\/\/[^\s"'`)]+/g) ?? [];
    for (const url of absUrls) {
      if (isFetchedAbsoluteUrl(url)) problems.push(`${rel}: absolute URL ${url}`);
    }
  }
}

if (problems.length > 0) {
  console.error("Android assets are not offline-safe:\n" + problems.map((p) => `  ${p}`).join("\n"));
  process.exit(1);
}

console.log(`Wrote Android WebView assets to ${relative(repo, outDir)}`);
