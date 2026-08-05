/* Local file editor. Requires Chromium File System Access API. */
(function () {
  const $ = (id) => document.getElementById(id);
  let rootHandle;
  let productsHandle;
  let entries = [];
  let selected = null;

  function status(message, error) {
    const el = $("admin-status");
    el.textContent = message;
    el.classList.toggle("form-error", !!error);
  }

  const clean = (value = "") =>
    value.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  const escapeHtml = (value = "") =>
    String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const slugify = (value) =>
    (value
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]+/gi, "-")
      .replace(/[а-яё]/gi, "")
      .replace(/^-+|-+$/g, "")) || `new-product-${Date.now()}`;

  function parsePage(file, text) {
    const h1 = clean(text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || file.replace(/\.html$/, ""));
    const h1Match = text.match(/<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*>([\s\S]*?)<\/p>/i);
    const subtitle = clean(h1Match?.[1] || "");
    const specs = [...text.matchAll(/<tr[^>]*>\s*<th[^>]*>([\s\S]*?)<\/th>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/gi)]
      .map((match) => `${clean(match[1])} | ${clean(match[2])}`)
      .join("\n");
    const image = text.match(/(?:src|data-full)="(\.\.\/assets\/images\/[^"]+)"/i)?.[1] || "";
    const pdf = text.match(/data-product-catalog[^>]*href="([^"]+)"/i)?.[1] || "";
    return { file, text, title: h1, subtitle, specs, image, pdf };
  }

  async function scanProducts() {
    entries = [];
    for await (const [name, handle] of productsHandle.entries()) {
      if (handle.kind !== "file" || !name.endsWith(".html")) continue;
      entries.push(parsePage(name, await (await handle.getFile()).text()));
    }
    entries.sort((a, b) => a.title.localeCompare(b.title, "ru"));
    renderList();
  }

  function renderList() {
    const query = $("product-filter").value.trim().toLowerCase();
    $("product-list").innerHTML = entries
      .filter((entry) => entry.title.toLowerCase().includes(query))
      .map(
        (entry) =>
          `<button type="button" class="local-admin-item ${selected?.file === entry.file ? "active" : ""}" data-file="${escapeHtml(entry.file)}">${escapeHtml(entry.title)}</button>`
      )
      .join("");
    $("product-list").querySelectorAll("[data-file]").forEach((button) =>
      button.addEventListener("click", () => selectEntry(button.dataset.file))
    );
  }

  function selectEntry(file) {
    selected = entries.find((entry) => entry.file === file);
    if (!selected) return;
    $("editor-title").textContent = selected.title;
    $("p-file").value = selected.file;
    $("p-title").value = selected.title;
    $("p-subtitle").value = selected.subtitle;
    $("p-specs").value = selected.specs;
    $("p-image").value = "";
    $("p-pdf").value = "";
    $("pdf-state").textContent = selected.pdf ? `Подключён: ${selected.pdf}` : "PDF-каталог не добавлен.";
    renderList();
  }

  async function copyFile(file, directory, name) {
    const target = await directory.getFileHandle(name, { create: true });
    const writable = await target.createWritable();
    await writable.write(file);
    await writable.close();
  }

  function productTemplate(title, subtitle, image, specs, pdf) {
    return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)} — АКМАН</title><link rel="stylesheet" href="../css/styles.css?v=27"></head>
<body data-active="products" data-depth="1"><div id="site-header"></div><main><section class="section"><div class="container">
<div class="product-hero"><div class="gallery"><div class="gallery-main"><img src="${escapeHtml(image)}" alt="${escapeHtml(title)}"></div></div>
<div><span class="eyebrow">Наши продукты</span><h1>${escapeHtml(title)}</h1><p>${escapeHtml(subtitle)}</p>
<a class="btn btn-blue" href="../inquiry.html">Запросить коммерческое предложение</a>${pdf ? ` <a class="btn btn-outline" data-product-catalog href="${escapeHtml(pdf)}" download>Скачать каталог</a>` : ""}</div></div>
${specs ? `<div class="specs-wrap"><table class="specs">${specs}</table></div>` : ""}</div></section></main>
<div id="site-footer"></div><script src="../js/i18n.js"></script><script src="../js/main.js?v=27"></script></body></html>`;
  }

  function specsHtml(raw) {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, ...values] = line.split("|");
        return `<tr><th>${escapeHtml(name.trim())}</th><td>${escapeHtml(values.join("|").trim())}</td></tr>`;
      })
      .join("");
  }

  function updatePage(entry, title, subtitle, image, specs, pdf) {
    if (!entry.text) return productTemplate(title, subtitle, image, specsHtml(specs), pdf);
    let html = entry.text;
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)} — АКМАН</title>`);
    html = html.replace(/<h1([^>]*)>[\s\S]*?<\/h1>/i, `<h1$1>${escapeHtml(title)}</h1>`);
    html = html.replace(/(<h1[^>]*>[\s\S]*?<\/h1>\s*<p[^>]*>)[\s\S]*?(<\/p>)/i, `$1${escapeHtml(subtitle)}$2`);
    const table = `<table class="specs">${specsHtml(specs)}</table>`;
    html = /<table class="specs">[\s\S]*?<\/table>/i.test(html) ? html.replace(/<table class="specs">[\s\S]*?<\/table>/i, table) : html.replace("</main>", `<div class="section"><div class="container">${table}</div></div></main>`);
    if (image) html = html.replace(/(?:src|data-full)="\.\.\/assets\/images\/[^"]+"/i, `src="${escapeHtml(image)}"`);
    const pdfButton = `<a class="btn btn-outline" data-product-catalog href="${escapeHtml(pdf)}" download>Скачать каталог</a>`;
    html = /data-product-catalog[^>]*>[\s\S]*?<\/a>/i.test(html)
      ? html.replace(/<a[^>]*data-product-catalog[^>]*>[\s\S]*?<\/a>/i, pdf ? pdfButton : "")
      : pdf
        ? html.replace(/(<a class="btn btn-blue"[^>]*>[\s\S]*?<\/a>)/i, `$1 ${pdfButton}`)
        : html;
    return html;
  }

  async function saveProduct(event) {
    event.preventDefault();
    const title = $("p-title").value.trim();
    const file = $("p-file").value || `${slugify(title)}.html`;
    const subtitle = $("p-subtitle").value.trim();
    let image = selected?.image || "";
    let pdf = selected?.pdf || "";
    const imageFile = $("p-image").files[0];
    const pdfFile = $("p-pdf").files[0];
    if (imageFile) {
      const extension = imageFile.name.split(".").pop() || "jpg";
      const name = `${file.replace(/\.html$/, "")}.${extension}`;
      await copyFile(imageFile, await (await rootHandle.getDirectoryHandle("assets")).getDirectoryHandle("images"), name);
      image = `../assets/images/${name}`;
    }
    if (pdfFile) {
      const pdfDir = await (await rootHandle.getDirectoryHandle("assets")).getDirectoryHandle("catalog", { create: true });
      const name = `${file.replace(/\.html$/, "")}.pdf`;
      await copyFile(pdfFile, pdfDir, name);
      pdf = `../assets/catalog/${name}`;
    }
    const current = selected || { file, text: "", image: "", pdf: "" };
    const handle = await productsHandle.getFileHandle(file, { create: true });
    const writable = await handle.createWritable();
    await writable.write(updatePage(current, title, subtitle, image, $("p-specs").value, pdf));
    await writable.close();
    status(`Сохранено: products/${file}`);
    await scanProducts();
    selectEntry(file);
  }

  async function chooseFolder() {
    if (!window.showDirectoryPicker) {
      status("Используйте Chrome или Edge и откройте админку через localhost или HTTPS.", true);
      return;
    }
    try {
      rootHandle = await window.showDirectoryPicker({ mode: "readwrite" });
      productsHandle = await rootHandle.getDirectoryHandle("products");
      $("local-admin").classList.remove("hidden");
      status(`Открыта папка: ${rootHandle.name}`);
      await scanProducts();
    } catch (error) {
      if (error.name !== "AbortError") status("Не удалось открыть папку сайта.", true);
    }
  }

  $("choose-folder").addEventListener("click", chooseFolder);
  $("product-filter").addEventListener("input", renderList);
  $("product-form").addEventListener("submit", saveProduct);
  $("new-product").addEventListener("click", () => {
    selected = null;
    $("editor-title").textContent = "Новый товар";
    $("product-form").reset();
    $("p-file").value = "";
    $("pdf-state").textContent = "PDF-каталог не добавлен.";
    renderList();
  });
  $("delete-product").addEventListener("click", async () => {
    if (!selected || !confirm(`Удалить страницу «${selected.title}»?`)) return;
    await productsHandle.removeEntry(selected.file);
    selected = null;
    $("product-form").reset();
    $("editor-title").textContent = "Выберите товар";
    status("Страница товара удалена.");
    await scanProducts();
  });
})();
