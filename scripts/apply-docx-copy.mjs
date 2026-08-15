import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const productsDir = join(root, "products");
for (const file of readdirSync(productsDir).filter((f) => f.endsWith(".html"))) {
  const path = join(productsDir, file);
  let html = readFileSync(path, "utf8");
  const next = html.replace(/href="valves\.html">Арматура<\/a>/g, 'href="valves.html">Запорно-регулирующая арматура</a>');
  if (next !== html) {
    writeFileSync(path, next);
    console.log("breadcrumb", file);
  }
}

const docsPath = join(root, "documents.html");
let docs = readFileSync(docsPath, "utf8");
docs = docs.replace(/data-lightbox="([^"]+)"/g, (_, src) => `data-doc="${Buffer.from(src, "utf8").toString("base64")}"`);
docs = docs.replace(/<span class="doc-thumb"><img src="[^"]+" alt="[^"]*" loading="lazy"><\/span>/g, '<span class="doc-thumb"></span>');
writeFileSync(docsPath, docs);
console.log("documents encoded");
