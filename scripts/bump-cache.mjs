import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";

const root = process.cwd();
const files = execSync("git ls-files *.html products/*.html", { cwd: root, encoding: "utf8" })
  .trim()
  .split(/\r?\n/)
  .filter(Boolean);

for (const rel of files) {
  const path = join(root, rel);
  let html = readFileSync(path, "utf8");
  const next = html
    .replace(/styles\.css\?v=\d+/g, "styles.css?v=30")
    .replace(/main\.js\?v=\d+/g, "main.js?v=30")
    .replace(/phrases\.js\?v=\d+/g, "phrases.js?v=30")
    .replace(/i18n\.js(\?v=\d+)?/g, "i18n.js?v=30")
    .replace(/search\.js\?v=\d+/g, "search.js?v=30")
    .replace(/lightbox\.js(\?v=\d+)?/g, "lightbox.js?v=30")
    .replace(/catalog\.js(\?v=\d+)?/g, "catalog.js?v=30");
  if (next !== html) writeFileSync(path, next);
}
console.log("cache bumped", files.length);
