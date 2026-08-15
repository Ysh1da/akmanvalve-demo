import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "products");

// Иерархия каталога: страница -> родитель
const parents = {
  instruments: "products",
  flowmeters: "instruments",
  "vortex-flowmeters": "flowmeters",
  "flstv-fk60": "vortex-flowmeters",
  "flstv-fk60b": "vortex-flowmeters",
  "flstv-fk62": "vortex-flowmeters",
  rotameters: "instruments",
  "level-gauges": "instruments",
  valves: "products",
  "control-valves": "valves",
  "cv-2way": "control-valves",
  "cv-3way": "control-valves",
  "cv-angle": "control-valves",
  "ball-valves": "valves",
  "butterfly-valves": "valves",
  "check-valves": "valves",
  "gate-valves": "valves",
  "globe-valves": "valves",
  "pressure-regulators": "valves",
  internals: "products",
  "column-trays": "internals",
  "packed-tower-internals": "internals",
  "reactor-internals": "internals",
  "separation-internals": "internals",
  "tower-packings": "internals",
  "structured-packings": "tower-packings",
  "packings-gen1": "structured-packings",
  "packings-gen2": "structured-packings",
  "packings-gen3": "structured-packings",
};

const labels = {
  products: "Наши продукты",
  instruments: "Средства измерений",
  flowmeters: "Расходомеры",
  "vortex-flowmeters": "Вихревые",
  valves: "Запорно-регулирующая арматура",
  "control-valves": "Клапаны регулирующие",
  internals: "ВКУ",
  "tower-packings": "Насадки",
  "structured-packings": "Регулярные",
};

function href(slug) {
  return slug === "products" ? "../products.html" : `${slug}.html`;
}

function chain(slug) {
  const out = [];
  let cur = parents[slug];
  while (cur) {
    out.unshift(cur);
    cur = parents[cur];
  }
  return out;
}

let changed = 0;
for (const file of readdirSync(DIR).filter((f) => f.endsWith(".html"))) {
  const slug = file.replace(/\.html$/, "");
  if (!(slug in parents)) continue;
  const path = join(DIR, file);
  const html = readFileSync(path, "utf8");

  const m = html.match(/<nav class="breadcrumb">([\s\S]*?)<\/nav>/);
  if (!m) {
    console.warn(`no breadcrumb: ${file}`);
    continue;
  }
  const strongMatch = m[1].match(/<strong>([\s\S]*?)<\/strong>/);
  if (!strongMatch) {
    console.warn(`no <strong> in breadcrumb: ${file}`);
    continue;
  }
  const leaf = strongMatch[1].trim();

  const parts = [`<a href="../index.html">Главная</a>`];
  for (const anc of chain(slug)) {
    parts.push(`<a href="${href(anc)}">${labels[anc]}</a>`);
  }
  parts.push(`<strong>${leaf}</strong>`);
  const nav = `<nav class="breadcrumb">${parts.join(" <span>/</span> ")}</nav>`;

  const updated = html.replace(m[0], nav);
  if (updated !== html) {
    writeFileSync(path, updated);
    changed++;
    console.log(`${file}: Главная / ${chain(slug).map((a) => labels[a]).join(" / ")} / ${leaf}`);
  }
}
console.log(`updated ${changed} files`);
