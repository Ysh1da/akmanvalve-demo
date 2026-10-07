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
    .replace(/styles\.css\?v=\d+/g, "styles.css?v=32")
    .replace(/main\.js\?v=\d+/g, "main.js?v=32")
    .replace(/phrases\.js\?v=\d+/g, "phrases.js?v=32")
    .replace(/i18n\.js(\?v=\d+)?/g, "i18n.js?v=32")
    .replace(/search\.js\?v=\d+/g, "search.js?v=32")
    .replace(/lightbox\.js(\?v=\d+)?/g, "lightbox.js?v=32")
    .replace(/docs-vault\.js(\?v=\d+)?/g, "docs-vault.js?v=32")
    .replace(/catalog\.js(\?v=\d+)?/g, "catalog.js?v=32");
  if (next !== html) writeFileSync(path, next);
}
console.log("cache bumped", files.length);
