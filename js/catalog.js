/* Catalog engine: seed + custom sections/folders/products */
(function () {
  const STORAGE_KEY = "akman_catalog_v2";
  const LEGACY_KEY = "akman_custom_products_v1";
  const PUBLISHED_URL = "assets/catalog/catalog.json";

  const SEED_SECTIONS = [
    {
      id: "soacv",
      title: "Запорно-регулирующая арматура",
      subtitle: "Регулирующая и запорная арматура",
      image: "assets/images/1071a158f6d3.png",
      page: "products/valves.html",
      builtin: true,
      order: 1,
    },
    {
      id: "cami",
      title: "Средства измерений",
      subtitle: "Расходомеры, ротаметры и уровнемеры",
      image: "assets/images/b182b10a204b.png",
      page: "products/instruments.html",
      builtin: true,
      order: 2,
    },
    {
      id: "icp",
      title: "Внутренние контактные устройства (ВКУ)",
      subtitle: "Насадки, тарелки и устройства колонн",
      image: "assets/images/182a24ce0eb3.png",
      page: "products/internals.html",
      builtin: true,
      order: 3,
    },
  ];

  const SEED_NODES = [
    { id: "flowmeters", parentId: "cami", kind: "folder", title: "Расходомеры", href: "products/flowmeters.html", image: "assets/images/b182b10a204b.png", builtin: true },
    { id: "rotameters", parentId: "cami", kind: "folder", title: "Ротаметры", href: "products/rotameters.html", image: "assets/images/b182b10a204b.png", builtin: true },
    { id: "level-gauges", parentId: "cami", kind: "folder", title: "Уровнемеры", href: "products/level-gauges.html", image: "assets/images/84ee50937786.png", builtin: true },

    { id: "control-valves", parentId: "soacv", kind: "folder", title: "Клапаны регулирующие", href: "products/control-valves.html", image: "assets/images/b182b10a204b.png", builtin: true },
    { id: "globe-valves", parentId: "soacv", kind: "folder", title: "Клапаны (вентили)", href: "products/globe-valves.html", image: "assets/images/da0d02b2084c.png", builtin: true },
    { id: "pressure-regulators", parentId: "soacv", kind: "folder", title: "Регуляторы давления", href: "products/pressure-regulators.html", image: "assets/images/5d1952b58569.png", builtin: true },
    { id: "ball-valves", parentId: "soacv", kind: "folder", title: "Краны шаровые", href: "products/ball-valves.html", image: "assets/images/3b0839ea9847.png", builtin: true },
    { id: "butterfly-valves", parentId: "soacv", kind: "folder", title: "Затворы дисковые", href: "products/butterfly-valves.html", image: "assets/images/5cf6c79bba27.png", builtin: true },
    { id: "gate-valves", parentId: "soacv", kind: "folder", title: "Задвижки", href: "products/gate-valves.html", image: "assets/images/985da41787d7.png", builtin: true },
    { id: "check-valves", parentId: "soacv", kind: "folder", title: "Клапаны обратные", href: "products/check-valves.html", image: "assets/images/49151193e920.png", builtin: true },

    { id: "tower-packings", parentId: "icp", kind: "folder", title: "Насадки башенные", href: "products/tower-packings.html", image: "assets/images/b182b10a204b.png", builtin: true },
    { id: "column-trays", parentId: "icp", kind: "folder", title: "Тарелки ректификационной колонны", href: "products/column-trays.html", image: "assets/images/b182b10a204b.png", builtin: true },
    { id: "packed-tower-internals", parentId: "icp", kind: "folder", title: "Внутренние устройства башенные с насадкой", href: "products/packed-tower-internals.html", image: "assets/images/b182b10a204b.png", builtin: true },
    { id: "separation-internals", parentId: "icp", kind: "folder", title: "Внутренние устройства разделения", href: "products/separation-internals.html", image: "assets/images/b182b10a204b.png", builtin: true },
    { id: "reactor-internals", parentId: "icp", kind: "folder", title: "Внутренние устройства реактора", href: "products/reactor-internals.html", image: "assets/images/b182b10a204b.png", builtin: true },
  ];

  // back-compat aliases used earlier
  const CATEGORIES = {
    cami: SEED_SECTIONS.find((s) => s.id === "cami"),
    soacv: SEED_SECTIONS.find((s) => s.id === "soacv"),
    icp: SEED_SECTIONS.find((s) => s.id === "icp"),
    other: { id: "other", title: "Дополнительное оборудование", page: "products.html", label: "Дополнительное оборудование" },
  };
  Object.keys(CATEGORIES).forEach((k) => {
    CATEGORIES[k].label = CATEGORIES[k].title || CATEGORIES[k].label;
  });

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function emptyStore() {
    return { sections: [], nodes: [], hidden: [] };
  }

  function readStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (raw && typeof raw === "object") {
        return {
          sections: Array.isArray(raw.sections) ? raw.sections : [],
          nodes: Array.isArray(raw.nodes) ? raw.nodes : [],
          hidden: Array.isArray(raw.hidden) ? raw.hidden : [],
        };
      }
    } catch (_) {}
    return migrateLegacy();
  }

  function writeStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  }

  function migrateLegacy() {
    const store = emptyStore();
    try {
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "[]");
      if (Array.isArray(legacy)) {
        legacy.forEach((p) => {
          store.nodes.push({
            id: p.id || uid("product"),
            parentId: normalizeParent(p.category),
            kind: "product",
            title: p.title || "Без названия",
            subtitle: p.subtitle || "",
            image: p.image || "",
            specs: p.specs || [],
            createdAt: p.createdAt || new Date().toISOString(),
            builtin: false,
          });
        });
      }
    } catch (_) {}
    writeStore(store);
    return store;
  }

  function normalizeParent(raw) {
    const v = String(raw || "").trim().toLowerCase();
    if (["cami", "soacv", "icp", "other"].includes(v)) return v === "other" ? "cami" : v;
    if (v.includes("измер")) return "cami";
    if (v.includes("армат")) return "soacv";
    if (v.includes("вку")) return "icp";
    return v || "cami";
  }

  async function loadPublished() {
    const depth = Number(document.body.dataset.depth || 0);
    const prefix = "../".repeat(depth);
    try {
      const res = await fetch(prefix + PUBLISHED_URL, { cache: "no-store" });
      if (!res.ok) return emptyStore();
      const data = await res.json();
      if (Array.isArray(data)) {
        return {
          sections: [],
          nodes: data.map((p) => ({
            id: p.id,
            parentId: normalizeParent(p.category),
            kind: "product",
            title: p.title,
            subtitle: p.subtitle || "",
            image: p.image || "",
            specs: p.specs || [],
            builtin: false,
          })),
          hidden: [],
        };
      }
      return {
        sections: Array.isArray(data.sections) ? data.sections : [],
        nodes: Array.isArray(data.nodes) ? data.nodes : [],
        hidden: Array.isArray(data.hidden) ? data.hidden : [],
      };
    } catch {
      return emptyStore();
    }
  }

  function mergeById(seedList, publishedList, localList, hidden) {
    const map = new Map();
    seedList.forEach((x) => map.set(x.id, { ...x, builtin: true }));
    publishedList.forEach((x) => {
      if (!x || !x.id) return;
      map.set(x.id, { ...map.get(x.id), ...x, builtin: !!(map.get(x.id) || {}).builtin && !!x.builtin });
    });
    localList.forEach((x) => {
      if (!x || !x.id) return;
      map.set(x.id, { ...map.get(x.id), ...x, builtin: false });
    });
    const hide = new Set(hidden || []);
    return [...map.values()].filter((x) => !hide.has(x.id));
  }

  async function getCatalog() {
    const local = readStore();
    const published = await loadPublished();
    const sections = mergeById(SEED_SECTIONS, published.sections, local.sections, [...(published.hidden || []), ...(local.hidden || [])])
      .sort((a, b) => (a.order || 99) - (b.order || 99) || String(a.title).localeCompare(String(b.title), "ru"));
    const nodes = mergeById(SEED_NODES, published.nodes, local.nodes, [...(published.hidden || []), ...(local.hidden || [])]);
    return { sections, nodes, local };
  }

  function getSection(id, catalog) {
    return (catalog.sections || []).find((s) => s.id === id) || null;
  }

  function getNode(id, catalog) {
    return (catalog.nodes || []).find((n) => n.id === id) || null;
  }

  function childrenOf(parentId, catalog) {
    return (catalog.nodes || []).filter((n) => n.parentId === parentId);
  }

  function saveSection(section) {
    const store = readStore();
    const i = store.sections.findIndex((s) => s.id === section.id);
    const item = {
      ...section,
      id: section.id || uid("section"),
      builtin: false,
      order: Number(section.order) || 50,
      updatedAt: new Date().toISOString(),
    };
    if (i >= 0) store.sections[i] = { ...store.sections[i], ...item };
    else store.sections.push(item);
    writeStore(store);
    return item;
  }

  function saveNode(node) {
    const store = readStore();
    const i = store.nodes.findIndex((n) => n.id === node.id);
    const item = {
      ...node,
      id: node.id || uid(node.kind === "folder" ? "folder" : "product"),
      kind: node.kind === "folder" ? "folder" : "product",
      builtin: false,
      updatedAt: new Date().toISOString(),
      createdAt: node.createdAt || new Date().toISOString(),
    };
    if (i >= 0) store.nodes[i] = { ...store.nodes[i], ...item };
    else store.nodes.unshift(item);
    writeStore(store);
    return item;
  }

  function removeEntry(id) {
    const store = readStore();
    const isBuiltin =
      SEED_SECTIONS.some((s) => s.id === id) || SEED_NODES.some((n) => n.id === id);
    if (isBuiltin) {
      if (!store.hidden.includes(id)) store.hidden.push(id);
      writeStore(store);
      return { hidden: true };
    }
    store.sections = store.sections.filter((s) => s.id !== id);
    store.nodes = store.nodes.filter((n) => n.id !== id && n.parentId !== id);
    // cascade remove children in local store
    let changed = true;
    while (changed) {
      const ids = new Set(store.nodes.map((n) => n.id));
      const before = store.nodes.length;
      store.nodes = store.nodes.filter((n) => !n.parentId || ids.has(n.parentId) || store.sections.some((s) => s.id === n.parentId) || SEED_SECTIONS.some((s) => s.id === n.parentId));
      // also drop orphans whose parent was deleted custom
      const parentIds = new Set([
        ...store.sections.map((s) => s.id),
        ...SEED_SECTIONS.map((s) => s.id),
        ...store.nodes.map((n) => n.id),
        ...SEED_NODES.map((n) => n.id),
      ]);
      store.nodes = store.nodes.filter((n) => parentIds.has(n.parentId) || SEED_SECTIONS.some((s) => s.id === n.parentId));
      changed = store.nodes.length !== before;
      if (!changed) break;
    }
    writeStore(store);
    return { removed: true };
  }

  function exportJSON() {
    return JSON.stringify(readStore(), null, 2);
  }

  function importJSON(text) {
    const data = JSON.parse(text);
    if (Array.isArray(data)) {
      // legacy products array
      const store = emptyStore();
      data.forEach((p) => {
        store.nodes.push({
          id: p.id || uid("product"),
          parentId: normalizeParent(p.category),
          kind: "product",
          title: p.title,
          subtitle: p.subtitle || "",
          image: p.image || "",
          specs: p.specs || [],
          builtin: false,
        });
      });
      writeStore(store);
      return store;
    }
    if (!data || typeof data !== "object") throw new Error("Неверный JSON");
    writeStore({
      sections: Array.isArray(data.sections) ? data.sections : [],
      nodes: Array.isArray(data.nodes) ? data.nodes : [],
      hidden: Array.isArray(data.hidden) ? data.hidden : [],
    });
    return readStore();
  }

  // ---- legacy API shims for older pages ----
  function getLocalProducts() {
    return readStore().nodes.filter((n) => n.kind === "product");
  }

  function normalizeCategory(raw) {
    return normalizeParent(raw);
  }

  window.AkmanCatalog = {
    STORAGE_KEY,
    CATEGORIES,
    SEED_SECTIONS,
    SEED_NODES,
    getCatalog,
    getSection,
    getNode,
    childrenOf,
    saveSection,
    saveNode,
    removeEntry,
    exportJSON,
    importJSON,
    normalizeCategory,
    categoryLabel(id) {
      const s = SEED_SECTIONS.find((x) => x.id === id) || CATEGORIES[id];
      return (s && (s.title || s.label)) || id;
    },
    // legacy
    getCustomProducts: getLocalProducts,
    saveCustomProducts() {},
    async getAllProducts() {
      const cat = await getCatalog();
      return cat.nodes.filter((n) => n.kind === "product");
    },
    addProduct(product) {
      return saveNode({
        ...product,
        kind: "product",
        parentId: normalizeParent(product.category || product.parentId),
      });
    },
    removeProduct(id) {
      removeEntry(id);
    },
  };

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function resolveImage(src, prefix) {
    if (!src) return prefix + "assets/images/b182b10a204b.png";
    if (/^(data:|https?:|blob:)/i.test(src)) return src;
    if (src.startsWith("../") || src.startsWith("./") || src.startsWith("/")) return src;
    return prefix + src.replace(/^\//, "");
  }

  function nodeHref(node, prefix) {
    if (node.builtin && node.href) return prefix + node.href.replace(/^\.\.\//, "");
    if (node.kind === "folder") return prefix + "catalog.html?id=" + encodeURIComponent(node.id);
    return prefix + "custom-product.html?id=" + encodeURIComponent(node.id);
  }

  function cardHtml(node, prefix) {
    const href = nodeHref(node, prefix);
    const img = resolveImage(node.image, prefix);
    const L = window.AkmanI18n ? window.AkmanI18n.getLang() : "ru";
    const phrases = window.AkmanPhrases || {};
    const titleRaw = node.title || "";
    const title =
      L === "en" ? node.titleEn || phrases[titleRaw] || titleRaw : titleRaw;
    const subtitleRaw = node.subtitle || "";
    const subtitle =
      L === "en"
        ? node.subtitleEn || phrases[subtitleRaw] || subtitleRaw
        : subtitleRaw;
    const more =
      node.kind === "folder"
        ? L === "en"
          ? phrases["Открыть"] || "Open"
          : "Открыть"
        : L === "en"
          ? phrases["Подробнее"] || "Details"
          : "Подробнее";
    return `
      <a class="product-card reveal visible" href="${href}">
        <div class="product-card-media"><img src="${img}" alt="${escapeHtml(title)}"></div>
        <div class="product-card-body">
          <h3>${escapeHtml(title)}</h3>
          ${subtitle ? `<p>${escapeHtml(subtitle)}</p>` : ""}
          <span class="link-more">${more}</span>
        </div>
      </a>`;
  }

  function detectPageCategory() {
    const forced = document.body.dataset.catalogCategory;
    if (forced === "products-index") return "products-index";
    if (forced) return normalizeParent(forced);
    const path = (location.pathname || "").replace(/\\/g, "/").toLowerCase();
    if (path.includes("/instruments.html")) return "cami";
    if (path.includes("/valves.html")) return "soacv";
    if (path.includes("/internals.html")) return "icp";
    if (path.includes("/products.html")) return "products-index";
    return null;
  }

  async function renderCatalog() {
    const pageCat = detectPageCategory();
    const depth = Number(document.body.dataset.depth || 0);
    const prefix = "../".repeat(depth);
    const catalog = await getCatalog();
    const local = catalog.local || readStore();

    // hide builtin cards marked hidden in admin
    const hiddenIds = new Set(local.hidden || []);
    if (hiddenIds.size) {
      const hiddenHrefs = new Set(
        SEED_NODES.filter((n) => hiddenIds.has(n.id)).map((n) => (n.href || "").split("/").pop())
      );
      document.querySelectorAll("a.product-card[href]").forEach((a) => {
        const file = (a.getAttribute("href") || "").split("/").pop();
        if (hiddenHrefs.has(file)) a.remove();
      });
    }

    if (!pageCat) return;

    if (pageCat === "products-index") {
      const root = document.getElementById("custom-products-root");
      const customSections = catalog.sections.filter((s) => !s.builtin);
      // also hide builtin section cards on products.html
      if (hiddenIds.size) {
        document.querySelectorAll(".grid-3 > a.product-card").forEach((a) => {
          const href = a.getAttribute("href") || "";
          SEED_SECTIONS.forEach((s) => {
            if (hiddenIds.has(s.id) && href.indexOf(s.page.split("/").pop()) !== -1) a.remove();
          });
        });
      }
      if (root && customSections.length) {
        root.innerHTML = `
          <div class="section-head">
            <span class="eyebrow">Каталог</span>
            <h2>Дополнительные разделы</h2>
          </div>
          <div class="grid-3">
            ${customSections
              .map((s) => {
                const href = s.page ? prefix + s.page : prefix + "catalog.html?id=" + encodeURIComponent(s.id);
                const img = resolveImage(s.image, prefix);
                return `<a class="product-card reveal visible" href="${href}">
                  <div class="product-card-media"><img src="${img}" alt="${escapeHtml(s.title)}"></div>
                  <div class="product-card-body"><h3>${escapeHtml(s.title)}</h3>
                  ${s.subtitle ? `<p>${escapeHtml(s.subtitle)}</p>` : ""}
                  <span class="link-more">Перейти</span></div></a>`;
              })
              .join("")}
          </div>`;
      }
      return;
    }

    const items = childrenOf(pageCat, catalog).filter((n) => !n.builtin);
    if (!items.length) return;
    let grid = document.querySelector("[data-catalog-grid]");
    if (!grid) grid = document.querySelector("main .grid-3");
    if (!grid) return;
    const wrap = document.createElement("div");
    wrap.innerHTML = items.map((n) => cardHtml(n, prefix)).join("");
    [...wrap.children].forEach((el) => grid.appendChild(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderCatalog()
      .then(() => {
        if (window.AkmanI18n) window.AkmanI18n.apply();
      })
      .catch(() => {});
  });

  window.addEventListener("akman:lang", () => {
    if (window.AkmanI18n) window.AkmanI18n.apply();
  });
})();
