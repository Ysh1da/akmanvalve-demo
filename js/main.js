/* Shared layout: header, footer, mobile nav, reveal */
(function () {
  const depth = Number(document.body.dataset.depth || 0);
  const prefix = "../".repeat(depth);
  const active = document.body.dataset.active || "";
  const I = window.AkmanI18n;
  const t = (k) => (I ? I.t(k) : k);

  function link(href, labelKey, key) {
    const isActive = active === key ? " active" : "";
    return `<a class="${isActive}" href="${prefix}${href}" data-i18n="${labelKey}">${t(labelKey)}</a>`;
  }

  function buildHeader() {
    return `
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="${prefix}index.html" data-i18n="home_aria" data-i18n-attr="aria-label" aria-label="${t("home_aria")}">
        <img src="${prefix}assets/images/logo-akman.png" alt="АКМАН">
      </a>
      <div class="header-right">
        <div class="header-search" id="site-search-mobile">
          <button type="button" class="search-toggle" aria-label="${t("search_aria")}" aria-expanded="false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <div class="search-panel hidden">
            <input class="search-input" type="search" placeholder="${t("search_ph")}" autocomplete="off">
            <div class="search-results"></div>
          </div>
        </div>
        <button type="button" class="lang-toggle" aria-label="${t("lang_aria")}">${t("lang_btn")}</button>
        <a class="header-phone-mobile" href="tel:+74957903250">+7 495 790-32-50</a>
        <button class="burger" type="button" data-i18n="nav_menu" data-i18n-attr="aria-label" aria-label="${t("nav_menu")}" id="burger">
          <span></span><span></span><span></span>
        </button>
      </div>
      <nav class="nav" id="nav">
        ${link("company.html", "nav_company", "company")}
        <div class="nav-dropdown">
          ${link("products.html", "nav_products", "products")}
          <div class="nav-dropdown-menu">
            <a href="${prefix}products/instruments.html" data-i18n="nav_instruments">${t("nav_instruments")}</a>
            <a href="${prefix}products/valves.html" data-i18n="nav_valves">${t("nav_valves")}</a>
            <a href="${prefix}products/internals.html" data-i18n="nav_internals">${t("nav_internals")}</a>
          </div>
        </div>
        ${link("documents.html", "nav_documents", "documents")}
        ${link("contacts.html", "nav_contacts", "contacts")}
      </nav>
      <div class="header-contacts">
        <div class="header-search" id="site-search">
          <button type="button" class="search-toggle" aria-label="${t("search_aria")}" aria-expanded="false">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          </button>
          <div class="search-panel hidden">
            <input class="search-input" type="search" placeholder="${t("search_ph")}" autocomplete="off">
            <div class="search-results"></div>
          </div>
        </div>
        <button type="button" class="lang-toggle" aria-label="${t("lang_aria")}">${t("lang_btn")}</button>
        <a href="tel:+74957903250">+7 495 790-32-50</a>
      </div>
    </div>
  </header>`;
  }

  function buildFooter() {
    return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <img src="${prefix}assets/images/logo-akman-on-dark.png" alt="AKMAN">
          </div>
          <p data-i18n="footer_about">${t("footer_about")}</p>
        </div>
        <div>
          <h4 data-i18n="footer_sections">${t("footer_sections")}</h4>
          <a href="${prefix}company.html" data-i18n="nav_company">${t("nav_company")}</a>
          <a href="${prefix}products.html" data-i18n="nav_products">${t("nav_products")}</a>
          <a href="${prefix}documents.html" data-i18n="nav_documents">${t("nav_documents")}</a>
          <a href="${prefix}contacts.html" data-i18n="nav_contacts">${t("nav_contacts")}</a>
        </div>
        <div>
          <h4 data-i18n="footer_contacts">${t("footer_contacts")}</h4>
          <a href="tel:+74957903250">+7 495 790-32-50</a>
          <a href="mailto:mail@akmanvalve.ru">mail@akmanvalve.ru</a>
          <a href="${prefix}contacts.html" data-i18n="footer_cities">${t("footer_cities")}</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span data-i18n="footer_copy">${t("footer_copy")}</span>
        <span>mail@akmanvalve.ru</span>
      </div>
    </div>
  </footer>`;
  }

  function loadExtraScripts() {
    const files = ["js/phrases.js?v=23", "js/search.js?v=23"];
    files.forEach((src) => {
      const name = src.split("?")[0];
      if ([...document.scripts].some((s) => (s.src || "").includes(name))) return;
      const el = document.createElement("script");
      el.src = prefix + src;
      el.onload = () => {
        if (name.endsWith("phrases.js") && window.AkmanI18n) window.AkmanI18n.apply();
        if (name.endsWith("search.js") && window.AkmanSearch) window.AkmanSearch.init();
      };
      document.body.appendChild(el);
    });
  }

  function mount() {
    const headerEl = document.getElementById("site-header");
    const footerEl = document.getElementById("site-footer");
    if (headerEl) headerEl.outerHTML = buildHeader();
    if (footerEl) footerEl.outerHTML = buildFooter();

    document.querySelectorAll(".lang-toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (window.AkmanI18n) window.AkmanI18n.toggle();
      });
    });

    const burger = document.getElementById("burger");
    const nav = document.getElementById("nav");
    if (burger && nav) {
      if (!nav.querySelector(".nav-mobile-phone")) {
        const phone = document.createElement("a");
        phone.className = "nav-mobile-phone";
        phone.href = "tel:+74957903250";
        phone.textContent = "+7 495 790-32-50";
        nav.appendChild(phone);
      }

      const setOpen = (open) => {
        nav.classList.toggle("open", open);
        burger.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-open", open);
      };

      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-controls", "nav");
      burger.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
      nav.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", () => setOpen(false));
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth > 960) setOpen(false);
      });
    }

    if (window.AkmanI18n) window.AkmanI18n.apply();
    loadExtraScripts();
  }

  mount();

  window.addEventListener("akman:lang", () => {
    // re-apply only; header already has data-i18n
    if (window.AkmanI18n) window.AkmanI18n.apply();
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("visible");
    } else {
      io.observe(el);
    }
  });
})();
