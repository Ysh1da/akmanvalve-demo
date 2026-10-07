/* Certificates are view-only: blobs are decoded into a canvas, never offered as a file. */
(function () {
  const depth = Number(document.body.dataset.depth || 0);
  const prefix = "../".repeat(depth);
  const vault = window.AkmanDocs || { key: "", files: {} };
  const keyBytes = new TextEncoder().encode(vault.key || "");

  function decode(raw) {
    const out = new Uint8Array(raw);
    if (!keyBytes.length) return out;
    for (let i = 0; i < out.length; i++) out[i] ^= keyBytes[i % keyBytes.length];
    return out;
  }

  async function paintProtected(canvas, id) {
    const file = vault.files[String(id)];
    if (!file) return;
    const response = await fetch(prefix + "assets/docs/" + file);
    if (!response.ok) throw new Error("doc");
    const bytes = decode(new Uint8Array(await response.arrayBuffer()));
    const type = bytes[0] === 0x89 ? "image/png" : "image/jpeg";
    const bitmap = await createImageBitmap(new Blob([bytes], { type }));
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0);
    bitmap.close();
  }

  document.querySelectorAll(".doc-card[data-doc-id]").forEach((card) => {
    const wrap = card.querySelector(".doc-thumb, .doc-sheet");
    if (!wrap) return;
    wrap.querySelectorAll("img").forEach((img) => img.remove());
    let canvas = wrap.querySelector("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.setAttribute("aria-hidden", "true");
      wrap.appendChild(canvas);
    }
    paintProtected(canvas, card.getAttribute("data-doc-id")).catch(() => {});
  });

  const box = document.getElementById("lightbox");
  if (!box) return;

  const stage = box.querySelector(".lightbox-stage") || box;
  const shield = box.querySelector(".lightbox-shield");
  let img = box.querySelector(".lightbox-img");
  if (!img || img.tagName !== "CANVAS") return;

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

  function open(id, title) {
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
    paintProtected(img, id).catch(() => {});
    if (caption) caption.textContent = title || "";
    if (!box.open && typeof box.showModal === "function") box.showModal();
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (box.open) box.close();
    const ctx = img.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, img.width || 0, img.height || 0);
    scale = 1;
    tx = 0;
    ty = 0;
    applyTransform();
    document.body.style.overflow = "";
  }

  document.querySelectorAll("[data-doc-id]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      open(el.getAttribute("data-doc-id"), el.getAttribute("data-title") || "");
    });
  });

  document.addEventListener(
    "contextmenu",
    (e) => {
      if (e.target.closest(".doc-card, .lightbox, .doc-thumb")) e.preventDefault();
    },
    true
  );
  document.addEventListener(
    "dragstart",
    (e) => {
      if (e.target.closest(".doc-card, .lightbox, .doc-thumb")) e.preventDefault();
    },
    true
  );

  [zoomInBtn, zoomOutBtn, zoomResetBtn].forEach((btn, index) => {
    if (!btn) return;
    const delta = index === 0 ? -STEP : index === 1 ? STEP : null;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      setZoom(delta === null ? 1 : scale + delta);
    });
  });

  const pointerRoot = shield || stage;
  pointerRoot.addEventListener(
    "wheel",
    (e) => {
      if (!isOpen()) return;
      e.preventDefault();
      setZoom(scale + (e.deltaY < 0 ? STEP : -STEP));
    },
    { passive: false }
  );

  pointerRoot.addEventListener("pointerdown", (e) => {
    if (!isOpen() || scale <= 1.01) return;
    if (e.target.closest("button")) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    originTx = tx;
    originTy = ty;
    pointerRoot.setPointerCapture(e.pointerId);
    stage.classList.add("is-dragging");
  });

  pointerRoot.addEventListener("pointermove", (e) => {
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
      pointerRoot.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }

  pointerRoot.addEventListener("pointerup", endDrag);
  pointerRoot.addEventListener("pointercancel", endDrag);

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
