/* Admin: catalog tree CRUD */
(function () {
  const SESSION_KEY = "akman_admin_ok";
  const PLAIN_FALLBACK = "AkmanAdmin2026!";
  const KNOWN = { hash: null };
  let catalogCache = null;
  let editingBuiltin = false;

  async function sha256(text) {
    if (!window.crypto || !crypto.subtle) return null;
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function ensureKnownHash() {
    if (!KNOWN.hash) KNOWN.hash = (await sha256(PLAIN_FALLBACK)) || "plain";
    return KNOWN.hash;
  }

  async function checkPassword(pass) {
    if (pass === PLAIN_FALLBACK) return true;
    const hash = await sha256(pass);
    return hash && hash === KNOWN.hash;
  }

  function show(el, text) {
    el.classList.remove("hidden");
    el.textContent = text;
  }

  function hide(el) {
    el.classList.add("hidden");
    el.textContent = "";
  }

  function isAuthed() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  function setAuthed(v) {
    if (v) sessionStorage.setItem(SESSION_KEY, "1");
    else sessionStorage.removeItem(SESSION_KEY);
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function specsToText(specs) {
    return (specs || []).map((s) => (s.name || "") + " | " + (s.value || "")).join("\n");
  }

  function textToSpecs(raw) {
    return String(raw || "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, ...rest] = line.split("|");
        return { name: name.trim(), value: rest.join("|").trim() };
      });
  }

  async function refresh() {
    catalogCache = await AkmanCatalog.getCatalog();
    fillParentSelect();
    renderTree();
  }

  function fillParentSelect(selected) {
    const sel = document.getElementById("e-parent");
    const kind = document.getElementById("e-kind").value;
    const cat = catalogCache;
    const opts = [];

    if (kind === "section") {
      opts.push(`<option value="">— верхний уровень —</option>`);
      sel.disabled = true;
    } else {
      sel.disabled = false;
      cat.sections.forEach((s) => {
        opts.push(`<option value="${escapeHtml(s.id)}">Раздел: ${escapeHtml(s.title)}</option>`);
      });
      cat.nodes
        .filter((n) => n.kind === "folder")
        .forEach((n) => {
          const parent = cat.sections.find((s) => s.id === n.parentId);
          const label = (parent ? parent.title + " → " : "") + n.title;
          opts.push(`<option value="${escapeHtml(n.id)}">Подкаталог: ${escapeHtml(label)}</option>`);
        });
    }
    sel.innerHTML = opts.join("");
    if (selected) sel.value = selected;
  }

  function renderTree() {
    const root = document.getElementById("admin-tree");
    const cat = catalogCache;
    if (!cat.sections.length) {
      root.innerHTML = "<p>Каталог пуст.</p>";
      return;
    }

    root.innerHTML = cat.sections
      .map((section) => {
        const kids = AkmanCatalog.childrenOf(section.id, cat);
        return `
        <div class="admin-tree-section">
          <div class="admin-tree-row" data-edit-section="${escapeHtml(section.id)}">
            <div>
              <strong>${escapeHtml(section.title)}</strong>
              <span class="admin-badge">${section.builtin ? "базовый" : "свой"}</span>
              ${section.subtitle ? `<div class="admin-muted">${escapeHtml(section.subtitle)}</div>` : ""}
            </div>
            <div class="admin-row-actions">
              <button type="button" class="btn btn-outline btn-xs" data-edit-section="${escapeHtml(section.id)}">Изменить</button>
              <button type="button" class="btn btn-outline btn-xs btn-danger" data-del="${escapeHtml(section.id)}">${section.builtin ? "Скрыть" : "Удалить"}</button>
            </div>
          </div>
          <div class="admin-tree-children">
            ${kids
              .map((node) => {
                const nested = node.kind === "folder" ? AkmanCatalog.childrenOf(node.id, cat) : [];
                return `
                <div class="admin-tree-node">
                  <div class="admin-tree-row">
                    <div>
                      <strong>${escapeHtml(node.title)}</strong>
                      <span class="admin-badge">${node.kind === "folder" ? "подкаталог" : "товар"}</span>
                      <span class="admin-badge">${node.builtin ? "базовый" : "свой"}</span>
                    </div>
                    <div class="admin-row-actions">
                      <button type="button" class="btn btn-outline btn-xs" data-edit-node="${escapeHtml(node.id)}">Изменить</button>
                      <button type="button" class="btn btn-outline btn-xs btn-danger" data-del="${escapeHtml(node.id)}">${node.builtin ? "Скрыть" : "Удалить"}</button>
                    </div>
                  </div>
                  ${
                    nested.length
                      ? `<div class="admin-tree-nested">${nested
                          .map(
                            (child) => `
                        <div class="admin-tree-row admin-tree-row-nested">
                          <div>
                            <strong>${escapeHtml(child.title)}</strong>
                            <span class="admin-badge">${child.kind === "folder" ? "подкаталог" : "товар"}</span>
                            <span class="admin-badge">${child.builtin ? "базовый" : "свой"}</span>
                          </div>
                          <div class="admin-row-actions">
                            <button type="button" class="btn btn-outline btn-xs" data-edit-node="${escapeHtml(child.id)}">Изменить</button>
                            <button type="button" class="btn btn-outline btn-xs btn-danger" data-del="${escapeHtml(child.id)}">${child.builtin ? "Скрыть" : "Удалить"}</button>
                          </div>
                        </div>`
                          )
                          .join("")}</div>`
                      : ""
                  }
                </div>`;
              })
              .join("") || '<p class="admin-muted">Пока пусто — добавьте подкаталог или товар.</p>'}
          </div>
        </div>`;
      })
      .join("");

    root.querySelectorAll("[data-edit-section]").forEach((btn) => {
      btn.addEventListener("click", () => loadSection(btn.getAttribute("data-edit-section")));
    });
    root.querySelectorAll("[data-edit-node]").forEach((btn) => {
      btn.addEventListener("click", () => loadNode(btn.getAttribute("data-edit-node")));
    });
    root.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-del");
        if (!confirm("Удалить или скрыть этот элемент?")) return;
        AkmanCatalog.removeEntry(id);
        resetForm();
        await refresh();
        show(document.getElementById("admin-msg"), "Готово.");
      });
    });
  }

  function loadSection(id) {
    const s = catalogCache.sections.find((x) => x.id === id);
    if (!s) return;
    editingBuiltin = !!s.builtin;
    document.getElementById("form-heading").textContent = editingBuiltin
      ? "Базовый раздел (копия для правки)"
      : "Изменить раздел";
    document.getElementById("e-id").value = s.builtin ? "" : s.id;
    document.getElementById("e-kind").value = "section";
    fillParentSelect("");
    document.getElementById("e-title").value = s.title || "";
    document.getElementById("e-subtitle").value = s.subtitle || "";
    document.getElementById("e-specs").value = "";
    document.getElementById("e-image-url").value = s.image || "";
    document.getElementById("e-image").value = "";
    document.getElementById("specs-wrap").classList.add("hidden");
    document.getElementById("delete-btn").classList.toggle("hidden", !!s.builtin && !s.id);
    if (!s.builtin) document.getElementById("delete-btn").classList.remove("hidden");
    // if builtin, saving creates override section with same id? Better create editable copy with same id in local store
    if (s.builtin) {
      document.getElementById("e-id").value = s.id; // override by id in local
    }
    syncKindUI();
  }

  function loadNode(id) {
    const n = catalogCache.nodes.find((x) => x.id === id);
    if (!n) return;
    editingBuiltin = !!n.builtin;
    document.getElementById("form-heading").textContent = n.builtin
      ? "Базовый элемент (правка создаст свою копию)"
      : "Изменить элемент";
    document.getElementById("e-id").value = n.id;
    document.getElementById("e-kind").value = n.kind === "folder" ? "folder" : "product";
    fillParentSelect(n.parentId);
    document.getElementById("e-title").value = n.title || "";
    document.getElementById("e-subtitle").value = n.subtitle || "";
    document.getElementById("e-specs").value = specsToText(n.specs);
    document.getElementById("e-image-url").value = n.image || "";
    document.getElementById("e-image").value = "";
    document.getElementById("delete-btn").classList.remove("hidden");
    syncKindUI();
  }

  function resetForm() {
    editingBuiltin = false;
    document.getElementById("form-heading").textContent = "Добавить / изменить";
    document.getElementById("entry-form").reset();
    document.getElementById("e-id").value = "";
    document.getElementById("e-kind").value = "product";
    document.getElementById("delete-btn").classList.add("hidden");
    fillParentSelect();
    syncKindUI();
  }

  function syncKindUI() {
    const kind = document.getElementById("e-kind").value;
    document.getElementById("specs-wrap").classList.toggle("hidden", kind !== "product");
    fillParentSelect(document.getElementById("e-parent").value);
    const parentLabel = document.querySelector("label[for='e-parent']");
    if (parentLabel) {
      parentLabel.textContent =
        kind === "section" ? "Родитель (не нужен)" : kind === "folder" ? "В какой раздел / подкаталог" : "Куда добавить товар";
    }
  }

  function toggleUI() {
    const login = document.getElementById("admin-login");
    const panel = document.getElementById("admin-panel");
    if (isAuthed()) {
      login.classList.add("hidden");
      panel.classList.remove("hidden");
      refresh();
    } else {
      login.classList.remove("hidden");
      panel.classList.add("hidden");
    }
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await ensureKnownHash();
    toggleUI();

    document.getElementById("admin-login-btn").addEventListener("click", async () => {
      const pass = document.getElementById("admin-pass").value || "";
      const msg = document.getElementById("admin-login-msg");
      if (await checkPassword(pass)) {
        setAuthed(true);
        hide(msg);
        toggleUI();
      } else show(msg, "Неверный пароль");
    });

    document.getElementById("admin-pass").addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("admin-login-btn").click();
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
      setAuthed(false);
      toggleUI();
    });

    document.getElementById("e-kind").addEventListener("change", syncKindUI);
    document.getElementById("reset-btn").addEventListener("click", resetForm);

    document.getElementById("delete-btn").addEventListener("click", async () => {
      const id = document.getElementById("e-id").value;
      if (!id) return;
      if (!confirm("Удалить элемент?")) return;
      AkmanCatalog.removeEntry(id);
      resetForm();
      await refresh();
      show(document.getElementById("admin-msg"), "Удалено.");
    });

    document.getElementById("entry-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = document.getElementById("admin-msg");
      const kind = document.getElementById("e-kind").value;
      const id = document.getElementById("e-id").value.trim();
      const title = document.getElementById("e-title").value.trim();
      const subtitle = document.getElementById("e-subtitle").value.trim();
      const parentId = document.getElementById("e-parent").value;
      const imageUrl = document.getElementById("e-image-url").value.trim();
      const file = document.getElementById("e-image").files[0];
      let image = imageUrl;
      if (file) image = await fileToDataURL(file);

      if (kind === "section") {
        AkmanCatalog.saveSection({
          id: id || undefined,
          title,
          subtitle,
          image,
          order: 50,
        });
      } else {
        if (!parentId) {
          show(msg, "Выберите родителя для подкаталога или товара.");
          return;
        }
        AkmanCatalog.saveNode({
          id: id || undefined,
          parentId,
          kind,
          title,
          subtitle,
          image,
          specs: kind === "product" ? textToSpecs(document.getElementById("e-specs").value) : [],
        });
      }

      resetForm();
      await refresh();
      show(msg, "Сохранено. Откройте нужный раздел каталога на сайте.");
    });

    document.getElementById("export-btn").addEventListener("click", () => {
      const blob = new Blob([AkmanCatalog.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "catalog.json";
      a.click();
      URL.revokeObjectURL(a.href);
      show(document.getElementById("admin-msg"), "Скачан catalog.json — замените assets/catalog/catalog.json и задеплойте.");
    });

    document.getElementById("import-btn").addEventListener("click", () => {
      document.getElementById("import-file").click();
    });

    document.getElementById("import-file").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        AkmanCatalog.importJSON(await file.text());
        await refresh();
        show(document.getElementById("admin-msg"), "Импорт выполнен.");
      } catch (err) {
        show(document.getElementById("admin-msg"), "Ошибка: " + err.message);
      }
    });
  });
})();
