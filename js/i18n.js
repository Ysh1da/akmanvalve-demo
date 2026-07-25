/* i18n: default Russian, optional English */
(function () {
  const KEY = "akman_lang";
  const DEFAULT = "ru";

  const DICT = {
    ru: {
      lang_btn: "EN",
      lang_aria: "Switch to English",
      nav_company: "О компании",
      nav_products: "Наши продукты",
      nav_instruments: "Средства измерений",
      nav_valves: "Арматура трубопроводная",
      nav_internals: "ВКУ",
      nav_documents: "Документы",
      nav_contacts: "Контакты",
      nav_menu: "Меню",
      home_aria: "АКМАН — на главную",
      footer_about: "Поставщик технологического оборудования для нефтегазохимической отрасли.",
      footer_sections: "Разделы",
      footer_contacts: "Контакты",
      footer_cities: "Москва / Казань",
      footer_copy: "© 2017–2026 ООО «АКМАН», официальный сайт",
      cta_tkp: "Запросить ТКП",
      cta_products: "Наши продукты",
      cta_more: "Подробнее",
      cta_docs: "Документы",
      cta_call: "Позвонить",
      cta_request: "Запросить",
      cta_view: "Смотреть →",
      cta_models: "Смотреть модели",
      consult: "Консультация",
      flagship: "Флагман",
      home_h1: "Оборудование для нефтегазохимической отрасли",
      home_lead: "Средства измерений, трубопроводная арматура и внутренние контактные устройства — с разрешительной документацией.",
      adv_1_t: "Поставки под ключ",
      adv_1_p: "Измерения, арматура и ВКУ с пакетом документов.",
      adv_2_t: "Разрешительные документы",
      adv_2_p: "Декларации, сертификаты и свидетельства типа СИ.",
      adv_3_t: "Москва и Казань",
      adv_3_p: "Два офиса — удобно для проектов по всей стране.",
      home_eyebrow: "Наши продукты",
      home_dirs_h2: "Основные направления поставляемого оборудования",
      home_dirs_p: "Выберите раздел каталога.",
      home_flstv_h3: "Вихревые расходомеры FLSTV",
      home_flstv_p: "Серии FK60 и FK62 — с компенсацией температуры и давления, в том числе с Bluetooth.",
      home_flow: "Расходомеры",
      home_level: "Уровнемеры",
      home_valves: "Запорно-регулирующая арматура",
      home_vku: "Внутренние контактные устройства",
      about_eyebrow: "О компании",
      about_h2: "ООО «АКМАН»",
      about_p: "Поставляем средства измерений, трубопроводную арматуру и внутренние контактные устройства для объектов нефтегазохимической отрасли. Официальный дистрибьютор зарубежных производителей в РФ и странах Таможенного союза.",
      consult_h2: "Подберём оборудование под задачу объекта",
      consult_p: "Отправьте запрос технико-коммерческого предложения — ответим с расчётом и документацией.",
      contacts_h1: "Контакты",
      contacts_banner: "Офисы в Москве и Казани · запрос коммерческого предложения",
      offices_eyebrow: "Офисы",
      offices_h2: "Москва и Казань",
      offices_p: "Свяжитесь с нами по телефону или e-mail.",
      moscow: "Москва",
      kazan: "Казань",
      tkp_eyebrow: "Запрос",
      tkp_h2: "Запрос коммерческого предложения",
      tkp_p: "Заполните форму и приложите опросный лист — запрос уйдёт на yyyykira@gmail.com вместе с файлами.",
      interested: "Интересует:",
      label_name: "Имя *",
      label_company: "Компания",
      label_phone: "Телефон *",
      label_email: "E-mail *",
      label_category: "Направление оборудования *",
      label_product: "Интересующее оборудование",
      label_sheet: "Опросный лист",
      label_files: "Прикрепить документы *",
      ph_name: "Как к вам обращаться",
      ph_company: "Название организации",
      ph_phone: "+7 …",
      ph_email: "mail@company.ru",
      ph_product: "Например: FLSTV FK60",
      opt_choose: "Выберите направление",
      opt_si: "Средства измерений",
      opt_valves: "Арматура трубопроводная",
      opt_vku: "Внутренние контактные устройства (ВКУ)",
      sheet_hint: "Выберите направление. Если есть свой опросный лист — приложите его ниже. Если нет — скачайте бланк (когда будет доступен) и заполните.",
      files_hint: "Опросный лист, ТЗ или чертежи.",
      download_sheet: "Скачать бланк опросного листа",
      send_tkp: "Отправить запрос ТКП",
      map_eyebrow: "На карте",
      map_h2: "Как нас найти",
      yandex: "Яндекс.Карты →",
      company_h1: "О компании",
      company_banner: "Технологическое оборудование для нефтегазохимической отрасли",
      company_p1: "ООО «АКМАН» поставляет технологическое оборудование для нефтегазохимической отрасли: средства измерений, запорно-регулирующую арматуру и внутренние контактные устройства колонного оборудования.",
      company_p2: "Мы работаем как официальный дистрибьютор зарубежных производителей на территории РФ и стран Таможенного союза. К поставкам сопровождаем разрешительную документацию — декларации, сертификаты и свидетельства об утверждении типа СИ.",
      company_p3: "Офисы в Москве и Казани помогают вести проекты по всей стране: от подбора оборудования и запроса коммерческого предложения до сопровождения поставки.",
      products_h1: "Наши продукты",
      products_banner: "Основные направления поставляемого оборудования",
      products_si: "Средства измерений",
      products_valves: "Арматура трубопроводная",
      products_vku: "Внутренние контактные устройства (ВКУ)",
      go: "Перейти",
      docs_h1: "Документы",
      docs_banner: "Разрешительные документы — просмотр на сайте (скачивание отключено)",
      view_doc: "Смотреть",
      only_view: "Только просмотр · ООО «АКМАН»",
      sent_ok: "Запрос ТКП отправлен. Мы свяжемся с вами.",
      sent_title: "Отправлено",
      error_title: "Ошибка",
      error_send: "Не удалось отправить запрос. Попробуйте ещё раз или напишите на почту.",
      error_local: "Откройте сайт через веб-сервер (или демо на GitHub Pages). Из файла на диске форма не работает.",
      error_filesize: "Суммарный размер файлов не должен превышать 10 МБ.",
      modal_ok: "Понятно",
      sending: "Отправляем запрос ТКП…",
      attach_needed: "Прикрепите опросный лист или другой документ.",
      sheet_pick: "Выберите направление. Если есть свой опросный лист — приложите его ниже. Если нет — скачайте бланк (когда будет доступен) и заполните.",
      sheet_ready: "Скачайте бланк или приложите свой файл.",
      sheet_wait: "Приложите свой опросный лист. Бланк компании появится здесь после публикации форм.",
      more_details: "Подробнее",
      open: "Открыть",
      consult_task_h2: "Подберём оборудование под вашу задачу",
      consult_task_p: "Опишите параметры — подготовим технико-коммерческое предложение.",
      search_aria: "Поиск по сайту",
      search_ph: "Поиск по сайту…",
      search_empty: "Ничего не найдено",
      search_hint: "Начните вводить название",
      docs_tablist: "Разделы документов",
      docs_tab_decl: "Декларации",
      docs_tab_cert: "Сертификаты",
      docs_tab_type: "Тип продукции",
      docs_tab_rus: "РусХлорСерт",
      docs_tab_si: "Тип СИ",
      docs_panel_decl: "Декларации о соответствии",
      docs_panel_cert: "Сертификаты соответствия",
      docs_panel_type: "Сертификаты на тип продукции",
      docs_panel_rus: "Сертификаты РусХлорСерт",
      docs_panel_si: "Свидетельства об утверждении типа СИ",
      lb_view: "Просмотр документа",
      lb_close: "Закрыть",
      lb_zoom: "Масштаб",
      lb_out: "Отдалить",
      lb_in: "Приблизить",
      lb_reset: "Сброс",
      lb_reset_aria: "Сбросить масштаб",
      available_req: "Доступно по запросу",
      specs_title: "Технические характеристики",
      bc_home: "Главная",
      request_quote: "Запросить коммерческое предложение",
    },
    en: {
      lang_btn: "RU",
      lang_aria: "Switch to Russian",
      nav_company: "About",
      nav_products: "Our products",
      nav_instruments: "Measuring instruments",
      nav_valves: "Pipeline valves",
      nav_internals: "Tower internals",
      nav_documents: "Documents",
      nav_contacts: "Contacts",
      nav_menu: "Menu",
      home_aria: "AKMAN — home",
      footer_about: "Supplier of process equipment for the oil, gas and petrochemical industry.",
      footer_sections: "Sections",
      footer_contacts: "Contacts",
      footer_cities: "Moscow / Kazan",
      footer_copy: "© 2017–2026 AKMAN LLC, official website",
      cta_tkp: "Request a quotation",
      cta_products: "Our products",
      cta_more: "Learn more",
      cta_docs: "Documents",
      cta_call: "Call",
      cta_request: "Request",
      cta_view: "View →",
      cta_models: "View models",
      consult: "Consultation",
      flagship: "Flagship",
      home_h1: "Equipment for the oil, gas & petrochemical industry",
      home_lead: "Measuring instruments, pipeline valves and tower internals — with conformity documents.",
      adv_1_t: "Turnkey supply",
      adv_1_p: "Instrumentation, valves and internals with a full document pack.",
      adv_2_t: "Conformity documents",
      adv_2_p: "Declarations, certificates and type approvals for measuring instruments.",
      adv_3_t: "Moscow & Kazan",
      adv_3_p: "Two offices — convenient for projects across the country.",
      home_eyebrow: "Our products",
      home_dirs_h2: "Main product lines",
      home_dirs_p: "Choose a catalog section.",
      home_flstv_h3: "FLSTV vortex flowmeters",
      home_flstv_p: "FK60 and FK62 series — with temperature and pressure compensation, including Bluetooth.",
      home_flow: "Flowmeters",
      home_level: "Level gauges",
      home_valves: "Control & shut-off valves",
      home_vku: "Tower internals",
      about_eyebrow: "About",
      about_h2: "AKMAN LLC",
      about_p: "We supply measuring instruments, pipeline valves and tower internals for oil, gas and petrochemical facilities. Official distributor of foreign manufacturers in Russia and the Customs Union.",
      consult_h2: "We will select equipment for your facility",
      consult_p: "Send a request for a technical and commercial quotation — we will reply with a calculation and documents.",
      contacts_h1: "Contacts",
      contacts_banner: "Offices in Moscow and Kazan · request a quotation",
      offices_eyebrow: "Offices",
      offices_h2: "Moscow & Kazan",
      offices_p: "Contact us by phone or e-mail.",
      moscow: "Moscow",
      kazan: "Kazan",
      tkp_eyebrow: "Request",
      tkp_h2: "Request a quotation",
      tkp_p: "Fill in the form and attach a questionnaire — the request will be sent to yyyykira@gmail.com with your files.",
      interested: "Interested in:",
      label_name: "Name *",
      label_company: "Company",
      label_phone: "Phone *",
      label_email: "E-mail *",
      label_category: "Equipment direction *",
      label_product: "Equipment of interest",
      label_sheet: "Questionnaire",
      label_files: "Attach documents *",
      ph_name: "How should we address you",
      ph_company: "Company name",
      ph_phone: "+7 …",
      ph_email: "mail@company.ru",
      ph_product: "E.g. FLSTV FK60",
      opt_choose: "Select a direction",
      opt_si: "Measuring instruments",
      opt_valves: "Pipeline valves",
      opt_vku: "Tower internals",
      sheet_hint: "Select a direction. If you have your own questionnaire — attach it below. Otherwise download our form when available.",
      files_hint: "Questionnaire, specs or drawings.",
      download_sheet: "Download questionnaire form",
      send_tkp: "Send quotation request",
      map_eyebrow: "On the map",
      map_h2: "How to find us",
      yandex: "Yandex Maps →",
      company_h1: "About the company",
      company_banner: "Process equipment for the oil, gas and petrochemical industry",
      company_p1: "AKMAN LLC supplies process equipment for the oil, gas and petrochemical industry: measuring instruments, control and shut-off valves, and column internals.",
      company_p2: "We act as an official distributor of foreign manufacturers in Russia and the Customs Union. Supplies are accompanied by conformity documents — declarations, certificates and measuring instrument type approvals.",
      company_p3: "Offices in Moscow and Kazan help run projects nationwide: from equipment selection and quotation requests to delivery support.",
      products_h1: "Our products",
      products_banner: "Main product lines we supply",
      products_si: "Measuring instruments",
      products_valves: "Pipeline valves",
      products_vku: "Tower internals",
      go: "Open",
      docs_h1: "Documents",
      docs_banner: "Conformity documents — view on the website (download disabled)",
      view_doc: "View",
      only_view: "View only · AKMAN LLC",
      sent_ok: "Quotation request sent. We will contact you.",
      sent_title: "Sent",
      error_title: "Error",
      error_send: "Could not send the request. Please try again or email us.",
      error_local: "Open the site via a web server (or the GitHub Pages demo). The form does not work from a local HTML file.",
      error_filesize: "Total file size must not exceed 10 MB.",
      modal_ok: "OK",
      sending: "Sending quotation request…",
      attach_needed: "Please attach a questionnaire or another document.",
      sheet_pick: "Select a direction. If you have your own questionnaire — attach it below. Otherwise download our form when available.",
      sheet_ready: "Download the form or attach your own file.",
      sheet_wait: "Attach your own questionnaire. Our company form will appear here after publication.",
      more_details: "Details",
      open: "Open",
      consult_task_h2: "We will select equipment for your task",
      consult_task_p: "Describe the parameters — we will prepare a technical and commercial quotation.",
      search_aria: "Search the site",
      search_ph: "Search the site…",
      search_empty: "No results found",
      search_hint: "Start typing a product name",
      docs_tablist: "Document sections",
      docs_tab_decl: "Declarations",
      docs_tab_cert: "Certificates",
      docs_tab_type: "Product type",
      docs_tab_rus: "RusKhlorSert",
      docs_tab_si: "MI type",
      docs_panel_decl: "Declarations of conformity",
      docs_panel_cert: "Certificates of conformity",
      docs_panel_type: "Product type certificates",
      docs_panel_rus: "RusKhlorSert certificates",
      docs_panel_si: "Measuring instrument type approval certificates",
      lb_view: "Document viewer",
      lb_close: "Close",
      lb_zoom: "Zoom",
      lb_out: "Zoom out",
      lb_in: "Zoom in",
      lb_reset: "Reset",
      lb_reset_aria: "Reset zoom",
      available_req: "Available on request",
      specs_title: "Technical specifications",
      bc_home: "Home",
      request_quote: "Request a quotation",
    },
  };

  function getLang() {
    const v = localStorage.getItem(KEY);
    return v === "en" ? "en" : DEFAULT;
  }

  function setLang(lang) {
    const next = lang === "en" ? "en" : DEFAULT;
    localStorage.setItem(KEY, next);
    document.documentElement.lang = next;
    apply();
    window.dispatchEvent(new CustomEvent("akman:lang", { detail: { lang: next } }));
    return next;
  }

  function t(key) {
    const lang = getLang();
    return (DICT[lang] && DICT[lang][key]) || (DICT.ru && DICT.ru[key]) || key;
  }

  function applyNode(el) {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const val = t(key);
    const attr = el.getAttribute("data-i18n-attr");
    if (attr) {
      el.setAttribute(attr, val);
      return;
    }
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = val;
      return;
    }
    if (el.tagName === "OPTION") {
      el.textContent = val;
      return;
    }
    el.textContent = val;
  }

  function phraseMap() {
    return window.AkmanPhrases || {};
  }

  function translateText(ru) {
    if (!ru) return ru;
    const map = phraseMap();
    if (getLang() !== "en") return ru;
    if (map[ru]) return map[ru];
    // titles like "Name — ТР ТС …"
    const dash = ru.indexOf(" — ");
    if (dash > 0) {
      const left = ru.slice(0, dash);
      const right = ru.slice(dash);
      if (map[left]) return map[left] + right;
    }
    return ru;
  }

  function applyPhrases() {
    const lang = getLang();
    const map = phraseMap();
    if (!Object.keys(map).length) return;

    const roots = document.querySelectorAll(
      "main, #lightbox, .breadcrumb, .page-banner, .product-card, .product-hero, .specs, .consult-band, .doc-tabs, .doc-panel, .product-card-request, .card-actions, .on-request-note"
    );
    const sel =
      "h1, h2, h3, h4, p, strong, th, td, a, span, em, button.doc-tab, .doc-panel-title, label";

    roots.forEach((root) => {
      root.querySelectorAll(sel).forEach((el) => {
        if (el.closest("[data-i18n]")) return;
        if (el.closest(".site-header") || el.closest(".site-footer")) return;
        if (el.closest("script") || el.closest("style")) return;
        if (el.children.length > 0) return;
        const text = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (!text || text.length > 220) return;
        if (!el.dataset.ruText) el.dataset.ruText = text;
        const ru = el.dataset.ruText;
        el.textContent = lang === "en" ? translateText(ru) : ru;
      });
    });

    document.querySelectorAll("[data-title]").forEach((el) => {
      if (!el.dataset.titleRu) el.dataset.titleRu = el.getAttribute("data-title") || "";
      const ru = el.dataset.titleRu;
      el.setAttribute("data-title", lang === "en" ? translateText(ru) : ru);
    });

    document.querySelectorAll("img[alt]").forEach((el) => {
      if (el.closest(".site-header") || el.closest(".site-footer")) return;
      const alt = el.getAttribute("alt") || "";
      if (!alt) return;
      if (!el.dataset.altRu) el.dataset.altRu = alt;
      const ru = el.dataset.altRu;
      el.setAttribute("alt", lang === "en" ? translateText(ru) : ru);
    });

    document.querySelectorAll("[aria-label]").forEach((el) => {
      if (el.hasAttribute("data-i18n")) return;
      const label = el.getAttribute("aria-label") || "";
      if (!label || !/[А-Яа-яЁё]/.test(label)) return;
      if (!el.dataset.ariaRu) el.dataset.ariaRu = label;
      const ru = el.dataset.ariaRu;
      el.setAttribute("aria-label", lang === "en" ? translateText(ru) : ru);
    });

    // document title: "Name — АКМАН"
    const titleEl = document.querySelector("title");
    if (titleEl) {
      if (!titleEl.dataset.ruText) titleEl.dataset.ruText = titleEl.textContent || "";
      const ruTitle = titleEl.dataset.ruText;
      if (lang === "en") {
        const parts = ruTitle.split(" — ");
        if (parts.length >= 2) {
          const left = translateText(parts[0]);
          titleEl.textContent = left + " — AKMAN";
        } else {
          titleEl.textContent = translateText(ruTitle);
        }
      } else {
        titleEl.textContent = ruTitle;
      }
    }
  }

  function apply() {
    const lang = getLang();
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(applyNode);
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
    });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    document.querySelectorAll(".lang-toggle").forEach((btn) => {
      btn.textContent = t("lang_btn");
      btn.setAttribute("aria-label", t("lang_aria"));
    });
    applyPhrases();
  }

  function toggle() {
    setLang(getLang() === "en" ? "ru" : "en");
  }

  window.AkmanI18n = { getLang, setLang, toggle, t, apply, DICT };

  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.lang = getLang();
    apply();
  });
})();
