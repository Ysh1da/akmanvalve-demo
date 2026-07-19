/* Shared layout: header, footer, mobile nav, reveal */
(function () {
  const depth = Number(document.body.dataset.depth || 0);
  const prefix = "../".repeat(depth);
  const active = document.body.dataset.active || "";

  function link(href, label, key) {
    const isActive = active === key ? " active" : "";
    return `<a class="${isActive}" href="${prefix}${href}">${label}</a>`;
  }

  const header = `
  <header class="site-header">
    <div class="container header-inner">
      <a class="logo" href="${prefix}index.html" aria-label="АКМАН — на главную">
        <img src="${prefix}assets/images/a9b33a8775c0.png" alt="AKMAN">
      </a>
      <div class="header-right">
        <a class="header-phone-mobile" href="tel:+74957903250">+7 495 790-32-50</a>
        <button class="burger" type="button" aria-label="Меню" id="burger">
          <span></span><span></span><span></span>
        </button>
      </div>
      <nav class="nav" id="nav">
        ${link("company.html", "О компании", "company")}
        <div class="nav-dropdown">
          ${link("products.html", "Продукты", "products")}
          <div class="nav-dropdown-menu">
            <a href="${prefix}products/instruments.html">Средства измерений</a>
            <a href="${prefix}products/valves.html">Арматура трубопроводная</a>
            <a href="${prefix}products/internals.html">ВКУ</a>
          </div>
        </div>
        ${link("documents.html", "Документы", "documents")}
        ${link("contacts.html", "Контакты", "contacts")}
      </nav>
      <div class="header-contacts">
        <a href="tel:+74957903250">+7 495 790-32-50</a>
        <span>Пн—Пт 09:00—18:00</span>
      </div>
    </div>
  </header>`;

  const footer = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">AKMAN</div>
          <p>Поставщик технологического оборудования для нефтегазовой и нефтехимической промышленности.</p>
        </div>
        <div>
          <h4>Разделы</h4>
          <a href="${prefix}company.html">О компании</a>
          <a href="${prefix}products.html">Продукция</a>
          <a href="${prefix}documents.html">Документы</a>
          <a href="${prefix}contacts.html">Контакты</a>
        </div>
        <div>
          <h4>Контакты</h4>
          <a href="tel:+74957903250">+7 495 790-32-50</a>
          <a href="mailto:mail@akmanvalve.ru">mail@akmanvalve.ru</a>
          <a href="${prefix}contacts.html">Москва / Казань</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2017–2026 ООО «АКМАН», официальный сайт</span>
        <span>mail@akmanvalve.ru</span>
      </div>
    </div>
  </footer>`;

  const headerEl = document.getElementById("site-header");
  const footerEl = document.getElementById("site-footer");
  if (headerEl) headerEl.outerHTML = header;
  if (footerEl) footerEl.outerHTML = footer;

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