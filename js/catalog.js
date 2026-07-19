/* Catalog helpers: merge base catalog with custom products from localStorage */
(function () {
  const STORAGE_KEY = "akman_custom_products_v1";

  function getCustomProducts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }

  function saveCustomProducts(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  window.AkmanCatalog = {
    STORAGE_KEY,
    getCustomProducts,
    saveCustomProducts,
    addProduct(product) {
      const list = getCustomProducts();
      product.id = product.id || "custom-" + Date.now();
      product.createdAt = new Date().toISOString();
      list.unshift(product);
      saveCustomProducts(list);
      return product;
    },
    removeProduct(id) {
      saveCustomProducts(getCustomProducts().filter((p) => p.id !== id));
    },
    exportJSON() {
      return JSON.stringify(getCustomProducts(), null, 2);
    },
    importJSON(text) {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("Ожидается массив продуктов");
      saveCustomProducts(data);
      return data;
    },
  };

  function renderCustomOnProductsPage() {
    const root = document.getElementById("custom-products-root");
    if (!root) return;
    const depth = Number(document.body.dataset.depth || 0);
    const prefix = "../".repeat(depth);
    const list = getCustomProducts();
    if (!list.length) return;

    const cards = list
      .map((p) => {
        const img = p.image || prefix + "assets/images/b182b10a204b.png";
        return `
        <article class="product-card reveal visible">
          <div class="product-card-media"><img src="${img}" alt="${escapeHtml(p.title)}"></div>
          <div class="product-card-body">
            <h3>${escapeHtml(p.title)}</h3>
            <p>${escapeHtml(p.subtitle || "")}</p>
          </div>
        </article>`;
      })
      .join("");

    root.innerHTML = `
      <div class="section-head">
        <span class="eyebrow">Дополнено</span>
        <h2>Дополнительная продукция</h2>
      </div>
      <div class="grid-3">${cards}</div>`;
  }

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  document.addEventListener("DOMContentLoaded", renderCustomOnProductsPage);
})();
