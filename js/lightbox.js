/* Lightbox for documents */
(function () {
  const box = document.getElementById("lightbox");
  if (!box) return;
  const img = box.querySelector("img");
  const caption = box.querySelector(".lightbox-caption");
  const closeBtn = box.querySelector(".lightbox-close");

  function open(src, title) {
    img.src = src;
    img.alt = title || "Документ";
    caption.textContent = title || "";
    box.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function close() {
    box.classList.add("hidden");
    img.src = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-lightbox]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      open(el.getAttribute("data-lightbox"), el.getAttribute("data-title") || "");
    });
  });

  closeBtn.addEventListener("click", close);
  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
