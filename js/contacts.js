/* Contacts: ТКП form — AJAX + modal */
(function () {
  const ENDPOINT = "https://formsubmit.co/ajax/yyyykira@gmail.com";
  const params = new URLSearchParams(location.search);
  const productParam = params.get("product");
  const productInput = document.getElementById("kp-product");
  const banner = document.getElementById("inquiry-banner");
  const label = document.getElementById("inquiry-product");
  const status = document.getElementById("kp-status");
  const form = document.getElementById("kp-form");
  const category = document.getElementById("kp-category");
  const dl = document.getElementById("questionnaire-download");
  const hint = document.getElementById("questionnaire-hint");
  const filesInput = document.getElementById("kp-files");
  const submitBtn = form && form.querySelector('button[type="submit"]');
  const t = (k) => (window.AkmanI18n ? window.AkmanI18n.t(k) : k);

  const FORMS = {
    "Средства измерений": {
      href: "assets/forms/opros-si.pdf",
      ready: false,
      labelKey: "opt_si",
    },
    "Арматура трубопроводная": {
      href: "assets/forms/opros-armatura.pdf",
      ready: false,
      labelKey: "opt_valves",
    },
    ВКУ: {
      href: "assets/forms/opros-vku.pdf",
      ready: false,
      labelKey: "opt_vku",
    },
  };

  function ensureModal() {
    let root = document.getElementById("form-modal");
    if (root) return root;
    root = document.createElement("div");
    root.id = "form-modal";
    root.className = "form-modal hidden";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.innerHTML = `
      <div class="form-modal-backdrop" data-close></div>
      <div class="form-modal-card">
        <button type="button" class="form-modal-close" data-close aria-label="Close">&times;</button>
        <div class="form-modal-icon" aria-hidden="true"></div>
        <h3 class="form-modal-title"></h3>
        <p class="form-modal-text"></p>
        <button type="button" class="btn btn-blue form-modal-ok" data-close>OK</button>
      </div>
    `;
    document.body.appendChild(root);
    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-close]")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !root.classList.contains("hidden")) closeModal();
    });
    return root;
  }

  function openModal(type, title, text) {
    const root = ensureModal();
    root.classList.remove("hidden", "is-success", "is-error", "is-info");
    root.classList.add(type === "success" ? "is-success" : type === "error" ? "is-error" : "is-info");
    root.querySelector(".form-modal-title").textContent = title;
    root.querySelector(".form-modal-text").textContent = text;
    root.querySelector(".form-modal-ok").textContent = t("modal_ok");
    root.querySelector(".form-modal-icon").textContent = type === "success" ? "✓" : type === "error" ? "!" : "i";
    document.body.classList.add("modal-open");
    root.querySelector(".form-modal-ok").focus();
  }

  function closeModal() {
    const root = document.getElementById("form-modal");
    if (!root) return;
    root.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }

  if (productParam) {
    if (productInput) productInput.value = productParam;
    if (banner && label) {
      label.textContent = productParam;
      banner.classList.remove("hidden");
    }
  }

  if (params.get("sent") === "1") {
    openModal("success", t("sent_title"), t("sent_ok"));
  }

  function updateQuestionnaire() {
    if (!category || !dl || !hint) return;
    const key = category.value;
    const meta = FORMS[key];

    if (!key) {
      dl.classList.add("hidden");
      dl.removeAttribute("href");
      hint.textContent = t("sheet_pick");
      return;
    }

    if (meta && meta.ready) {
      dl.classList.remove("hidden");
      dl.href = meta.href;
      dl.textContent = t("download_sheet");
      hint.textContent = t("sheet_ready");
    } else {
      dl.classList.add("hidden");
      dl.removeAttribute("href");
      hint.textContent = t("sheet_wait");
    }
  }

  if (category) {
    category.addEventListener("change", updateQuestionnaire);
    updateQuestionnaire();
  }

  window.addEventListener("akman:lang", updateQuestionnaire);

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (filesInput && (!filesInput.files || !filesInput.files.length)) {
      openModal("error", t("error_title"), t("attach_needed"));
      if (status) {
        status.classList.remove("hidden");
        status.textContent = t("attach_needed");
      }
      return;
    }

    if (location.protocol === "file:") {
      openModal("error", t("error_title"), t("error_local"));
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (status) {
      status.classList.remove("hidden");
      status.textContent = t("sending");
    }

    const data = new FormData(form);
    data.delete("_next");

    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      let payload = null;
      try {
        payload = await res.json();
      } catch (_) {
        payload = null;
      }

      if (!res.ok) {
        const msg =
          (payload && (payload.message || payload.error)) ||
          t("error_send");
        throw new Error(msg);
      }

      form.reset();
      updateQuestionnaire();
      if (status) {
        status.classList.add("hidden");
        status.textContent = "";
      }
      openModal("success", t("sent_title"), t("sent_ok"));
    } catch (err) {
      const msg = (err && err.message) || t("error_send");
      if (status) {
        status.classList.remove("hidden");
        status.textContent = msg;
      }
      openModal("error", t("error_title"), msg);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();
