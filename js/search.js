/* Site search: index + header UI */
(function () {
  const INDEX = [
    { url: "index.html", title: { ru: "Главная", en: "Home" }, type: { ru: "Страница", en: "Page" }, keys: "акман akman home" },
    { url: "company.html", title: { ru: "О компании", en: "About the company" }, type: { ru: "Страница", en: "Page" }, keys: "компания about" },
    { url: "products.html", title: { ru: "Наши продукты", en: "Our products" }, type: { ru: "Каталог", en: "Catalog" }, keys: "продукты products каталог" },
    { url: "documents.html", title: { ru: "Документы", en: "Documents" }, type: { ru: "Документы", en: "Documents" }, keys: "декларации сертификаты тип си" },
    { url: "contacts.html", title: { ru: "Контакты", en: "Contacts" }, type: { ru: "Страница", en: "Page" }, keys: "ткп контакты mail" },
    { url: "products/instruments.html", title: { ru: "Средства измерений", en: "Measuring instruments" }, type: { ru: "Продукты", en: "Products" }, keys: "расходомеры ротаметры уровнемеры flowmeters" },
    { url: "products/flowmeters.html", title: { ru: "Расходомеры", en: "Flowmeters" }, type: { ru: "Продукты", en: "Products" }, keys: "flowmeter расход" },
    { url: "products/vortex-flowmeters.html", title: { ru: "Вихревые расходомеры", en: "Vortex flowmeters" }, type: { ru: "Продукты", en: "Products" }, keys: "flstv vortex вихревые" },
    { url: "products/flstv-fk60.html", title: { ru: "FLSTV FK60", en: "FLSTV FK60" }, type: { ru: "Продукты", en: "Products" }, keys: "вихревой fk60 bluetooth" },
    { url: "products/flstv-fk60b.html", title: { ru: "FLSTV FK60 Bluetooth", en: "FLSTV FK60 Bluetooth" }, type: { ru: "Продукты", en: "Products" }, keys: "fk60b bluetooth" },
    { url: "products/flstv-fk62.html", title: { ru: "FLSTV FK62", en: "FLSTV FK62" }, type: { ru: "Продукты", en: "Products" }, keys: "fk62" },
    { url: "products/rotameters.html", title: { ru: "Ротаметры", en: "Rotameters" }, type: { ru: "Продукты", en: "Products" }, keys: "ротаметр rotameter" },
    { url: "products/level-gauges.html", title: { ru: "Уровнемеры", en: "Level gauges" }, type: { ru: "Продукты", en: "Products" }, keys: "уровень level radar" },
    { url: "products/valves.html", title: { ru: "Арматура трубопроводная", en: "Pipeline valves" }, type: { ru: "Продукты", en: "Products" }, keys: "арматура valves" },
    { url: "products/control-valves.html", title: { ru: "Клапаны регулирующие", en: "Control valves" }, type: { ru: "Продукты", en: "Products" }, keys: "sv100 sv200 sv300 control" },
    { url: "products/cv-2way.html", title: { ru: "Клапаны регулирующие 2-х ходовые", en: "Two-way control valves" }, type: { ru: "Продукты", en: "Products" }, keys: "2-way двухходовые" },
    { url: "products/cv-3way.html", title: { ru: "Клапаны регулирующие 3-х ходовые", en: "Three-way control valves" }, type: { ru: "Продукты", en: "Products" }, keys: "3-way трехходовые" },
    { url: "products/cv-angle.html", title: { ru: "Клапаны регулирующие угловые", en: "Angle control valves" }, type: { ru: "Продукты", en: "Products" }, keys: "angle угловые" },
    { url: "products/globe-valves.html", title: { ru: "Клапаны (вентили)", en: "Globe valves" }, type: { ru: "Продукты", en: "Products" }, keys: "globe вентиль" },
    { url: "products/pressure-regulators.html", title: { ru: "Регуляторы давления", en: "Pressure regulators" }, type: { ru: "Продукты", en: "Products" }, keys: "pressure regulator" },
    { url: "products/ball-valves.html", title: { ru: "Краны шаровые", en: "Ball valves" }, type: { ru: "Продукты", en: "Products" }, keys: "ball шар" },
    { url: "products/butterfly-valves.html", title: { ru: "Затворы дисковые", en: "Butterfly valves" }, type: { ru: "Продукты", en: "Products" }, keys: "butterfly диск" },
    { url: "products/gate-valves.html", title: { ru: "Задвижки", en: "Gate valves" }, type: { ru: "Продукты", en: "Products" }, keys: "gate задвижка" },
    { url: "products/check-valves.html", title: { ru: "Клапаны обратные", en: "Check valves" }, type: { ru: "Продукты", en: "Products" }, keys: "check обратный" },
    { url: "products/internals.html", title: { ru: "ВКУ", en: "Tower internals" }, type: { ru: "Продукты", en: "Products" }, keys: "вку internals насадки" },
    { url: "products/tower-packings.html", title: { ru: "Насадки башенные", en: "Tower packings" }, type: { ru: "Продукты", en: "Products" }, keys: "packing насадка" },
    { url: "products/structured-packings.html", title: { ru: "Насадки регулярные", en: "Structured packings" }, type: { ru: "Продукты", en: "Products" }, keys: "structured регулярные" },
    { url: "products/packings-gen1.html", title: { ru: "Насадки регулярные 1-го поколения", en: "1st-generation structured packings" }, type: { ru: "Продукты", en: "Products" }, keys: "gen1" },
    { url: "products/packings-gen2.html", title: { ru: "Насадки регулярные 2-го поколения", en: "2nd-generation structured packings" }, type: { ru: "Продукты", en: "Products" }, keys: "gen2" },
    { url: "products/packings-gen3.html", title: { ru: "Насадки регулярные 3-го поколения", en: "3rd-generation structured packings" }, type: { ru: "Продукты", en: "Products" }, keys: "gen3" },
    { url: "products/column-trays.html", title: { ru: "Тарелки ректификационной колонны", en: "Distillation column trays" }, type: { ru: "Продукты", en: "Products" }, keys: "trays тарелки" },
    { url: "products/packed-tower-internals.html", title: { ru: "Внутренние устройства башенные с насадкой", en: "Packed tower internals" }, type: { ru: "Продукты", en: "Products" }, keys: "packed" },
    { url: "products/separation-internals.html", title: { ru: "Внутренние устройства разделения", en: "Separation internals" }, type: { ru: "Продукты", en: "Products" }, keys: "separation сепаратор" },
    { url: "products/reactor-internals.html", title: { ru: "Внутренние устройства реактора", en: "Reactor internals" }, type: { ru: "Продукты", en: "Products" }, keys: "reactor реактор" },
  ];

  const depth = Number(document.body.dataset.depth || 0);
  const prefix = "../".repeat(depth);
  const t = (k) => (window.AkmanI18n ? window.AkmanI18n.t(k) : k);
  const lang = () => (window.AkmanI18n ? window.AkmanI18n.getLang() : "ru");

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .trim();
  }

  function search(q) {
    const query = norm(q);
    if (!query || query.length < 1) return [];
    const tokens = query.split(/\s+/).filter(Boolean);
    const L = lang();
    return INDEX.map((item) => {
      const title = item.title[L] || item.title.ru;
      const hay = norm([title, item.title.ru, item.title.en, item.keys, item.type.ru, item.type.en].join(" "));
      let score = 0;
      tokens.forEach((tok) => {
        if (hay.includes(tok)) score += tok.length;
        if (norm(title).startsWith(tok)) score += 10;
      });
      return score > 0 ? { ...item, title, type: item.type[L] || item.type.ru, score } : null;
    })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  function renderResults(box, q) {
    const items = search(q);
    if (!q.trim()) {
      box.innerHTML = `<p class="search-hint">${t("search_hint")}</p>`;
      return;
    }
    if (!items.length) {
      box.innerHTML = `<p class="search-hint">${t("search_empty")}</p>`;
      return;
    }
    box.innerHTML = items
      .map(
        (it) =>
          `<a class="search-item" href="${prefix}${it.url}"><span class="search-item-title">${it.title}</span><span class="search-item-type">${it.type}</span></a>`
      )
      .join("");
  }

  function bindRoot(root) {
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "1";

    const toggle = root.querySelector(".search-toggle");
    const panel = root.querySelector(".search-panel");
    const input = root.querySelector(".search-input");
    const results = root.querySelector(".search-results");
    if (!toggle || !panel || !input || !results) return;

    const open = () => {
      panel.classList.remove("hidden");
      root.classList.add("is-open");
      input.placeholder = t("search_ph");
      toggle.setAttribute("aria-expanded", "true");
      input.focus();
      renderResults(results, input.value);
    };
    const close = () => {
      panel.classList.add("hidden");
      root.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (root.classList.contains("is-open")) close();
      else open();
    });
    input.addEventListener("input", () => renderResults(results, input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
      if (e.key === "Enter") {
        const first = results.querySelector(".search-item");
        if (first) first.click();
      }
    });
    document.addEventListener("click", (e) => {
      if (!root.contains(e.target)) close();
    });
    window.addEventListener("akman:lang", () => {
      input.placeholder = t("search_ph");
      toggle.setAttribute("aria-label", t("search_aria"));
      if (root.classList.contains("is-open")) renderResults(results, input.value);
    });
  }

  function init() {
    document.querySelectorAll(".header-search").forEach(bindRoot);
  }

  window.AkmanSearch = { init, search, INDEX };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  document.addEventListener("keydown", (e) => {
    if ((e.key === "/" || (e.key === "k" && (e.ctrlKey || e.metaKey))) && !/input|textarea|select/i.test((e.target || {}).tagName || "")) {
      e.preventDefault();
      const root = document.querySelector(".header-contacts .header-search") || document.querySelector(".header-search");
      if (!root) return;
      const input = root.querySelector(".search-input");
      const panel = root.querySelector(".search-panel");
      if (panel) panel.classList.remove("hidden");
      root.classList.add("is-open");
      if (input) input.focus();
    }
  });
})();
