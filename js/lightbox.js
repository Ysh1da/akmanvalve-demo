/* Lightbox for documents — view only, native <dialog> */
(function () {
  function decodeDoc(value) {
    if (!value) return "";
    if (/^assets\//.test(value) || /^\.\.\//.test(value)) return value;
    try {
      const bytes = Uint8Array.from(atob(value), (ch) => ch.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch {
      return value;
    }
  }

  function docSrc(el) {
    return decodeDoc(el.getAttribute("data-doc") || el.getAttribute("data-lightbox") || "");
  }

  function paintCanvas(canvas, src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.decoding = "async";
      image.onload = () => {
        const w = image.naturalWidth || 900;
        const h = image.naturalHeight || 1270;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, w, h);
        resolve();
      };
      image.onerror = reject;
      image.src = src;
    });
  }

  document.querySelectorAll(".doc-card[data-lightbox], .doc-card[data-doc]").forEach((card) => {
    const wrap = card.querySelector(".doc-thumb, .doc-sheet");
    if (!wrap) return;
    const src = docSrc(card);
    wrap.querySelectorAll("img").forEach((img) => img.remove());
    let canvas = wrap.querySelector("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      wrap.appendChild(canvas);
    }
    if (src) paintCanvas(canvas, src).catch(() => {});
    wrap.addEventListener("contextmenu", (e) => e.preventDefault());
  });

  const box = document.getElementById("lightbox");
  if (!box) return;

  const stage = box.querySelector(".lightbox-stage") || box;
  let img = box.querySelector(".lightbox-img") || box.querySelector("canvas") || box.querySelector("img");
  if (img && img.tagName !== "CANVAS") {
    const canvas = document.createElement("canvas");
    canvas.className = img.className || "lightbox-img";
    img.replaceWith(canvas);
    img = canvas;
  }
  img.classList.add("lightbox-img");
  img.setAttribute("aria-hidden", "true");

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

  function isOpen() {
    return Boolean(box.open);
  }

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
    applyTransform();
    paintCanvas(img, src).catch(() => {});
    if (caption) caption.textContent = title || "";
    if (!box.open && typeof box.showModal === "function") box.showModal();
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (box.open) box.close();
    const ctx = img.getContext && img.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, img.width || 0, img.height || 0);
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-lightbox], [data-doc]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const src = docSrc(el);
      if (!src) return;
      open(src, el.getAttribute("data-title") || "");
    });
  });

  ["contextmenu", "dragstart"].forEach((evt) => {
    box.addEventListener(evt, (e) => e.preventDefault());
    document.addEventListener(evt, (e) => {
      if (e.target.closest(".doc-card, .lightbox")) e.preventDefault();
    });
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
      if (!isOpen()) return;
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
    } catch {
      /* already released */
    }
  }

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);

  if (closeBtn) closeBtn.addEventListener("click", close);
  box.addEventListener("click", (e) => {
    if (e.target === box) close();
  });
  box.addEventListener("close", () => {
    document.body.style.overflow = "";
  });
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "+" || e.key === "=") setZoom(scale + STEP);
    if (e.key === "-" || e.key === "_") setZoom(scale - STEP);
    if (e.key === "0") setZoom(1);
  });
})();
