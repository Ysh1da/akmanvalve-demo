/* Contacts: ТКП form — classic POST (attachments) + modal */
(function () {
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
  const nextInput = document.getElementById("kp-next");
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

  if (nextInput) {
    const base = location.href.split("#")[0].split("?")[0];
    nextInput.value = base + "?sent=1#inquiry";
  }

  if (productParam) {
    if (productInput) productInput.value = productParam;
    if (banner && label) {
      const setProductLabel = () => {
        const phrases = window.AkmanPhrases || {};
        const lang = window.AkmanI18n ? window.AkmanI18n.getLang() : "ru";
        label.textContent =
          lang === "en" && phrases[productParam] ? phrases[productParam] : productParam;
      };
      setProductLabel();
      banner.classList.remove("hidden");
      window.addEventListener("akman:lang", setProductLabel);
    }
  }

  if (params.get("sent") === "1") {
    openModal("success", t("sent_title"), t("sent_ok"));
    if (status) {
      status.classList.remove("hidden");
      status.textContent = t("sent_ok");
    }
    if (window.history && window.history.replaceState) {
      const clean = location.pathname + location.hash;
      window.history.replaceState({}, "", clean || location.pathname);
    }
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

  const folderInput = document.getElementById("kp-folder");
  const fileList = document.getElementById("kp-file-list");
  let fileBag = [];

  function syncFilesToInput() {
    if (!filesInput || typeof DataTransfer === "undefined") return;
    const dt = new DataTransfer();
    fileBag.forEach((f) => dt.items.add(f));
    filesInput.files = dt.files;
    renderFileList();
  }

  function addFiles(list) {
    const incoming = Array.from(list || []);
    incoming.forEach((f) => {
      const key = `${f.name}|${f.size}|${f.lastModified}`;
      if (!fileBag.some((x) => `${x.name}|${x.size}|${x.lastModified}` === key)) {
        fileBag.push(f);
      }
    });
    syncFilesToInput();
  }

  function renderFileList() {
    if (!fileList) return;
    if (!fileBag.length) {
      fileList.hidden = true;
      fileList.innerHTML = "";
      return;
    }
    fileList.hidden = false;
    const totalMb = (fileBag.reduce((s, f) => s + (f.size || 0), 0) / (1024 * 1024)).toFixed(2);
    fileList.innerHTML =
      `<li class="file-list-head">${t("files_selected")} ${fileBag.length} · ${totalMb} MB` +
      ` <button type="button" class="file-clear" id="kp-files-clear">${t("files_clear")}</button></li>` +
      fileBag
        .map(
          (f, i) =>
            `<li><span>${f.webkitRelativePath || f.name}</span>` +
            `<button type="button" data-remove="${i}" aria-label="Remove">×</button></li>`
        )
        .join("");
    const clearBtn = document.getElementById("kp-files-clear");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        fileBag = [];
        syncFilesToInput();
      });
    }
    fileList.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-remove"));
        fileBag.splice(idx, 1);
        syncFilesToInput();
      });
    });
  }

  if (filesInput) {
    filesInput.addEventListener("change", () => {
      addFiles(filesInput.files);
    });
  }
  if (folderInput) {
    folderInput.addEventListener("change", () => {
      addFiles(folderInput.files);
      folderInput.value = "";
    });
  }

  // FormSubmit AJAX drops file attachments — use classic multipart POST.
  form.addEventListener("submit", (e) => {
    if (location.protocol === "file:") {
      e.preventDefault();
      openModal("error", t("error_title"), t("error_local"));
      return;
    }

    if (!fileBag.length && filesInput && filesInput.files && filesInput.files.length) {
      fileBag = Array.from(filesInput.files);
    }

    if (!fileBag.length) {
      e.preventDefault();
      openModal("error", t("error_title"), t("attach_needed"));
      if (status) {
        status.classList.remove("hidden");
        status.textContent = t("attach_needed");
      }
      return;
    }

    syncFilesToInput();

    let total = 0;
    fileBag.forEach((f) => {
      total += f.size || 0;
    });
    if (total > 10 * 1024 * 1024) {
      e.preventDefault();
      openModal("error", t("error_title"), t("error_filesize"));
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (status) {
      status.classList.remove("hidden");
      status.textContent = t("sending");
    }
  });
})();
