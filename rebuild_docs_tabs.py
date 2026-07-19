#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rebuild documents.html with tabbed sections."""

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
docs = json.loads((ROOT / "data" / "documents_map.json").read_text(encoding="utf-8"))


def esc(s):
    return html.escape(str(s or ""), quote=True)


def slug(title):
    mapping = {
        "Декларации о соответствии": "declarations",
        "Сертификаты соответствия": "certificates",
        "Сертификаты на тип продукции": "type-certs",
        "Сертификаты РусХлорСерт": "ruschlor",
        "Свидетельства об утверждении типа СИ": "type-si",
    }
    return mapping.get(title, "sec-" + str(abs(hash(title)) % 10000))


tabs = []
panels = []
for i, sec in enumerate(docs):
    sid = slug(sec["section"])
    short = {
        "declarations": "Декларации",
        "certificates": "Сертификаты",
        "type-certs": "Тип продукции",
        "ruschlor": "РусХлорСерт",
        "type-si": "Тип СИ",
    }.get(sid, sec["section"])
    tabs.append(
        f'<button type="button" class="doc-tab" role="tab" data-doc-tab="{sid}" aria-selected="false">{esc(short)}</button>'
    )
    cards = []
    for it in sec["items"]:
        title = it["name"]
        std = it.get("std") or ""
        img = it["image"]
        full = title + (f" — {std}" if std else "")
        cards.append(f"""
          <a class="doc-card" href="{esc(img)}" data-lightbox="{esc(img)}" data-title="{esc(full)}">
            <span class="doc-thumb"><img src="{esc(img)}" alt="{esc(title)}" loading="lazy"></span>
            <span class="doc-card-body">
              <strong>{esc(title)}</strong>
              {f'<span class="doc-std">{esc(std)}</span>' if std else ''}
              <em>Открыть скан</em>
            </span>
          </a>""")
    panels.append(f"""
        <div class="doc-panel" data-doc-panel="{sid}" role="tabpanel" hidden>
          <h3 class="doc-panel-title">{esc(sec['section'])}</h3>
          <div class="doc-grid">
{''.join(cards)}
          </div>
        </div>""")

page = f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Документы — АКМАН</title>
  <meta name="description" content="Разрешительные документы ООО АКМАН">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css?v=10">
</head>
<body data-active="documents" data-depth="0">
  <div id="site-header"></div>
  <main>
    <section class="page-banner">
      <div class="container">
        <h1>Документы</h1>
        <p>Разрешительные документы — выберите раздел и откройте скан</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="doc-tabs" role="tablist" aria-label="Разделы документов">
{''.join(tabs)}
        </div>
{''.join(panels)}
      </div>
    </section>
  </main>
  <div id="lightbox" class="lightbox hidden" role="dialog" aria-modal="true">
    <button type="button" class="lightbox-close" aria-label="Закрыть">&times;</button>
    <img src="" alt="">
    <p class="lightbox-caption"></p>
  </div>
  <div id="site-footer"></div>
  <script src="js/main.js"></script>
  <script src="js/catalog.js"></script>
  <script src="js/lightbox.js"></script>
  <script src="js/docs-tabs.js"></script>
</body>
</html>
"""
(ROOT / "documents.html").write_text(page, encoding="utf-8")
print("documents with tabs:", len(docs), "sections")
