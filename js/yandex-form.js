/* Yandex Forms embed. Set the public form URL in CONFIGURED_URL below. */
(function () {
  // Публичная ссылка Яндекс Формы, например: "https://forms.yandex.ru/u/abcdef123456/"
  const CONFIGURED_URL = "";

  function validUrl(value) {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "https:" && /forms\.yandex\.(ru|com)$/i.test(parsed.hostname);
    } catch (_) {
      return false;
    }
  }

  window.AkmanYandexForm = { isValidUrl: validUrl };

  // Show which product the visitor came from (?product=...)
  const banner = document.getElementById("inquiry-banner");
  const productLabel = document.getElementById("inquiry-product");
  const product = new URLSearchParams(location.search).get("product");
  if (banner && productLabel && product) {
    productLabel.textContent = product;
    banner.classList.remove("hidden");
  }

  const root = document.getElementById("yandex-form-root");
  if (!root) return;

  if (validUrl(CONFIGURED_URL)) {
    const frame = document.createElement("iframe");
    frame.className = "yandex-form-frame";
    frame.src = CONFIGURED_URL;
    frame.title = "Форма запроса ТКП";
    frame.loading = "lazy";
    frame.setAttribute("allowfullscreen", "");
    root.replaceChildren(frame);
  }
})();
