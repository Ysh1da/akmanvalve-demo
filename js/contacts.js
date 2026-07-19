/* Contacts: inquiry banner + KP form */
(function () {
  const params = new URLSearchParams(location.search);
  const productParam = params.get("product");
  const productInput = document.getElementById("kp-product");
  const banner = document.getElementById("inquiry-banner");
  const label = document.getElementById("inquiry-product");

  if (productParam) {
    if (productInput) productInput.value = productParam;
    if (banner && label) {
      label.textContent = productParam;
      banner.classList.remove("hidden");
    }
  }

  const form = document.getElementById("kp-form");
  if (!form) return;

  const status = document.getElementById("kp-status");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (document.getElementById("kp-name").value || "").trim();
    const company = (document.getElementById("kp-company").value || "").trim();
    const phone = (document.getElementById("kp-phone").value || "").trim();
    const email = (document.getElementById("kp-email").value || "").trim();
    const product = (document.getElementById("kp-product").value || "").trim();
    const message = (document.getElementById("kp-message").value || "").trim();

    if (!name || !phone) {
      if (status) {
        status.classList.remove("hidden");
        status.textContent = "Укажите имя и телефон.";
      }
      return;
    }

    const subject = encodeURIComponent(
      "Запрос КП" + (product ? ": " + product : "") + " — " + name
    );
    const lines = [
      "Здравствуйте!",
      "",
      "Прошу подготовить коммерческое предложение.",
      "",
      "Имя: " + name,
      company ? "Компания: " + company : "",
      "Телефон: " + phone,
      email ? "E-mail: " + email : "",
      product ? "Продукция: " + product : "",
      message ? "Комментарий:\n" + message : "",
      "",
      "С уважением,",
      name,
    ].filter(Boolean);

    const body = encodeURIComponent(lines.join("\n"));
    window.location.href = "mailto:mail@akmanvalve.ru?subject=" + subject + "&body=" + body;

    if (status) {
      status.classList.remove("hidden");
      status.textContent = "Открывается почтовый клиент… Если этого не произошло, напишите на mail@akmanvalve.ru";
    }
  });
})();
