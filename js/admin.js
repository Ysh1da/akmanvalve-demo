/* Hidden admin: password gate + product CRUD in localStorage (online/offline) */
(function () {
  const SESSION_KEY = "akman_admin_ok";
  // Password: AkmanAdmin2026!
  const KNOWN = { hash: null };

  const PLAIN_FALLBACK = "AkmanAdmin2026!";

  async function sha256(text) {
    if (!window.crypto || !crypto.subtle) return null;
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async function ensureKnownHash() {
    if (!KNOWN.hash) {
      KNOWN.hash = (await sha256(PLAIN_FALLBACK)) || "plain";
    }
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

  function renderList() {
    const listEl = document.getElementById("admin-list");
    if (!listEl || !window.AkmanCatalog) return;
    const list = AkmanCatalog.getCustomProducts();
    if (!list.length) {
      listEl.innerHTML = "<p>Пока нет добавленных позиций.</p>";
      return;
    }
    listEl.innerHTML = list
      .map(
        (p) => `
      <div class="doc-item" style="margin-bottom:0.5rem">
        <div>
          <strong>${escapeHtml(p.title)}</strong>
          <div style="font-size:0.85rem;color:var(--muted)">${escapeHtml(p.category || "")} · ${escapeHtml(p.createdAt || "")}</div>
        </div>
        <button type="button" class="btn btn-outline" style="color:#8a3030;border-color:#8a3030;padding:0.4rem 0.8rem" data-del="${escapeHtml(p.id)}">Удалить</button>
      </div>`
      )
      .join("");

    listEl.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        AkmanCatalog.removeProduct(btn.getAttribute("data-del"));
        renderList();
      });
    });
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function toggleUI() {
    const login = document.getElementById("admin-login");
    const panel = document.getElementById("admin-panel");
    if (isAuthed()) {
      login.classList.add("hidden");
      panel.classList.remove("hidden");
      renderList();
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
      } else {
        show(msg, "Неверный пароль");
      }
    });

    document.getElementById("admin-pass").addEventListener("keydown", (e) => {
      if (e.key === "Enter") document.getElementById("admin-login-btn").click();
    });

    document.getElementById("logout-btn").addEventListener("click", () => {
      setAuthed(false);
      toggleUI();
    });

    document.getElementById("product-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = document.getElementById("admin-msg");
      const title = document.getElementById("p-title").value.trim();
      const category = document.getElementById("p-category").value;
      const subtitle = document.getElementById("p-subtitle").value.trim();
      const specsRaw = document.getElementById("p-specs").value.trim();
      const imageUrl = document.getElementById("p-image-url").value.trim();
      const file = document.getElementById("p-image").files[0];

      let image = imageUrl;
      if (file) image = await fileToDataURL(file);

      const specs = specsRaw
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [name, ...rest] = line.split("|");
          return { name: name.trim(), value: rest.join("|").trim() };
        });

      AkmanCatalog.addProduct({ title, category, subtitle, specs, image });
      e.target.reset();
      show(msg, "Продукция сохранена. Отображается в разделе «Продукция» (онлайн и офлайн).");
      renderList();
    });

    document.getElementById("export-btn").addEventListener("click", () => {
      const blob = new Blob([AkmanCatalog.exportJSON()], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "akman-custom-products.json";
      a.click();
      URL.revokeObjectURL(a.href);
    });

    document.getElementById("import-btn").addEventListener("click", () => {
      document.getElementById("import-file").click();
    });

    document.getElementById("import-file").addEventListener("change", async (e) => {
      const file = e.target.files[0];
      const msg = document.getElementById("admin-msg");
      if (!file) return;
      try {
        AkmanCatalog.importJSON(await file.text());
        show(msg, "Импорт выполнен");
        renderList();
      } catch (err) {
        show(msg, "Ошибка импорта: " + err.message);
      }
    });
  });
})();
