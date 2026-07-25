/* Lightbox for documents — view only + zoom/pan */
(function () {
  const box = document.getElementById("lightbox");
  if (!box) return;

  const stage = box.querySelector(".lightbox-stage") || box;
  const img = box.querySelector(".lightbox-img") || box.querySelector("img");
  const caption = box.querySelector(".lightbox-caption");
  const closeBtn = box.querySelector(".lightbox-close");
  const zoomInBtn = box.querySelector("[data-zoom='in']");
  const zoomOutBtn = box.querySelector("[data-zoom='out']");
  const zoomResetBtn = box.querySelector("[data-zoom='reset']");
  const zoomLabel = box.querySelector(".lightbox-zoom-label");

  const MIN = 1;
  const MAX = 2.6;
  const STEP = 0.2;

  let scale = 1;
  let tx = 0;
  let ty = 0;
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let originTx = 0;
  let originTy = 0;

  function applyTransform() {
    img.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    if (zoomLabel) zoomLabel.textContent = Math.round(scale * 100) + "%";
    stage.classList.toggle("is-zoomed", scale > 1.01);
  }

  function setZoom(next) {
    scale = Math.min(MAX, Math.max(MIN, next));
    if (scale <= 1.01) {
      scale = 1;
      tx = 0;
      ty = 0;
    }
    applyTransform();
  }

  function open(src, title) {
    scale = 1;
    tx = 0;
    ty = 0;
    img.src = src;
    img.alt = title || "Документ";
    img.setAttribute("draggable", "false");
    if (caption) caption.textContent = title || "";
    applyTransform();
    box.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function close() {
    box.classList.add("hidden");
    img.src = "";
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-lightbox]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      open(el.getAttribute("data-lightbox"), el.getAttribute("data-title") || "");
    });
  });

  ["contextmenu", "dragstart"].forEach((evt) => {
    box.addEventListener(evt, (e) => e.preventDefault());
  });
  document.querySelectorAll(".doc-card img, .doc-sheet img").forEach((el) => {
    el.setAttribute("draggable", "false");
    el.addEventListener("contextmenu", (e) => e.preventDefault());
    el.addEventListener("dragstart", (e) => e.preventDefault());
  });

  if (zoomInBtn) zoomInBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setZoom(scale + STEP);
  });
  if (zoomOutBtn) zoomOutBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setZoom(scale - STEP);
  });
  if (zoomResetBtn) zoomResetBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    setZoom(1);
  });

  stage.addEventListener(
    "wheel",
    (e) => {
      if (box.classList.contains("hidden")) return;
      e.preventDefault();
      const dir = e.deltaY < 0 ? 1 : -1;
      setZoom(scale + dir * STEP);
    },
    { passive: false }
  );

  stage.addEventListener("pointerdown", (e) => {
    if (scale <= 1.01) return;
    if (e.target.closest("button")) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    originTx = tx;
    originTy = ty;
    stage.setPointerCapture(e.pointerId);
    stage.classList.add("is-dragging");
  });

  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    tx = originTx + (e.clientX - startX);
    ty = originTy + (e.clientY - startY);
    applyTransform();
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove("is-dragging");
    try {
      stage.releasePointerCapture(e.pointerId);
    } catch (_) {}
  }

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  if (closeBtn) closeBtn.addEventListener("click", close);
  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });
  document.addEventListener("keydown", (e) => {
    if (box.classList.contains("hidden")) return;
    if (e.key === "Escape") close();
    if (e.key === "+" || e.key === "=") setZoom(scale + STEP);
    if (e.key === "-" || e.key === "_") setZoom(scale - STEP);
    if (e.key === "0") setZoom(1);
  });
})();
