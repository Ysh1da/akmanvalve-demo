/* Document section tabs */
(function () {
  const tabs = document.querySelectorAll("[data-doc-tab]");
  const panels = document.querySelectorAll("[data-doc-panel]");
  if (!tabs.length || !panels.length) return;

  function activate(id) {
    tabs.forEach((t) => {
      const on = t.getAttribute("data-doc-tab") === id;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach((p) => {
      const on = p.getAttribute("data-doc-panel") === id;
      p.classList.toggle("is-active", on);
      p.hidden = !on;
    });
  }

  tabs.forEach((t) => {
    t.addEventListener("click", () => activate(t.getAttribute("data-doc-tab")));
  });

  activate(tabs[0].getAttribute("data-doc-tab"));
})();
