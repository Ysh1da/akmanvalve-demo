#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Rebuild documents with correct scan mapping + polish site."""

import hashlib
import html
import json
import os
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
IMG = ROOT / "assets" / "images"
IMG.mkdir(parents=True, exist_ok=True)

# Exact mapping from original site DOM (image URL + title + std)
DOCS = [
    {
        "section": "Декларации о соответствии",
        "items": [
            ("Расходомеры-счетчики вихревые FLSTV", "ТР ТС 020/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/e0df6b49-3a1f-4c2d-850a-f70c1e2f2684/e0df6b49-3a1f-4c2d-850a-f70c1e2f2684-6174859.jpeg"),
            ("Клапаны регулирующие серий SV100, SV200, SV300", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/bca25ab7-1c3b-475d-aba5-6a8e9344583d/bca25ab7-1c3b-475d-aba5-6a8e9344583d-6494901.jpeg"),
            ("Клапаны регулирующие серий SV100, SV200, SV300", "ТР ТС 032/2013",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/60f86711-69d1-4af1-bf3b-516caa8a595a/60f86711-69d1-4af1-bf3b-516caa8a595a-14779136.jpeg"),
            ("Арматура промышленная трубопроводная", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/60f86711-69d1-4af1-bf3b-516caa8a595a/60f86711-69d1-4af1-bf3b-516caa8a595a-14779136.jpeg"),
            ("Конденсатоотводчики", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/60f86711-69d1-4af1-bf3b-516caa8a595a/60f86711-69d1-4af1-bf3b-516caa8a595a-14779136.jpeg"),
            ("Арматура промышленная трубопроводная", "ТР ТС 032/2013",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/60f86711-69d1-4af1-bf3b-516caa8a595a/60f86711-69d1-4af1-bf3b-516caa8a595a-14779136.jpeg"),
        ],
    },
    {
        "section": "Сертификаты соответствия",
        "items": [
            ("Расходомеры-счетчики вихревые FLSTV", "ТР ТС 012/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/45e23812-aaf2-4941-b9ba-aa133453c9ce/45e23812-aaf2-4941-b9ba-aa133453c9ce-6494939.jpeg"),
            ("Клапаны регулирующие серий SV100, SV200, SV300", "ТР ТС 032/2013",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/025db649-1e4a-4595-9c7b-bb494f30f2be/025db649-1e4a-4595-9c7b-bb494f30f2be-6852551.png"),
            ("Клапаны регулирующие серий SV100, SV200, SV300", "ТР ТС 012/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/8e4d8dec-efd5-4a13-938f-d534e1675318/8e4d8dec-efd5-4a13-938f-d534e1675318-14780130.jpeg"),
            ("Арматура промышленная трубопроводная", "ТР ТС 032/2013",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/ab15656f-9afb-4c79-9a3a-9997fedcafc4/ab15656f-9afb-4c79-9a3a-9997fedcafc4-14780161.jpeg"),
            ("Затворы дисковые, задвижки", "ТР ТС 012/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/8fdefad9-cba1-4019-8c44-e7c72b634e54/8fdefad9-cba1-4019-8c44-e7c72b634e54-15611770.jpeg"),
            ("Клапаны (вентили), клапаны обратные", "ТР ТС 012/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/1e4e6b29-4d6e-48ce-8c02-9218901e7730/1e4e6b29-4d6e-48ce-8c02-9218901e7730-14780165.jpeg"),
            ("Краны шаровые, краны пробковые", "ТР ТС 012/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/aa871730-118d-40f8-b3d0-b4f073097137/aa871730-118d-40f8-b3d0-b4f073097137-15611772.jpeg"),
            ("Регуляторы давления", "ТР ТС 012/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/7323084a-85b0-4d83-810f-32a69f3eec66/7323084a-85b0-4d83-810f-32a69f3eec66-14780167.jpeg"),
            ("Конденсатоотводчики", "ТР ТС 012/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/e4814cd0-457a-42cd-b26e-7ba6908f19e8/e4814cd0-457a-42cd-b26e-7ba6908f19e8-15611771.jpeg"),
        ],
    },
    {
        "section": "Сертификаты на тип продукции",
        "items": [
            ("Клапаны регулирующие", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/6c785105-915c-4783-bdee-ef54da3bedae/6c785105-915c-4783-bdee-ef54da3bedae-6494965.jpeg"),
            ("Задвижки", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/356aecc1-0cc1-44bd-bb1f-e0e34820f138/356aecc1-0cc1-44bd-bb1f-e0e34820f138-14780181.jpeg"),
            ("Клапаны обратные", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/c95014c6-e90e-40bf-bf07-e715bd86abd3/c95014c6-e90e-40bf-bf07-e715bd86abd3-15611773.jpeg"),
            ("Клапаны (вентили)", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/aa8317c2-0ef7-4a04-a933-9e2c16f8a308/aa8317c2-0ef7-4a04-a933-9e2c16f8a308-14780191.jpeg"),
            ("Краны шаровые", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/06ccb26b-e008-499d-b372-bf3c542f3002/06ccb26b-e008-499d-b372-bf3c542f3002-14780201.jpeg"),
            ("Затворы дисковые", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/a79f5e68-30e1-43a8-affd-09c90f040ac0/a79f5e68-30e1-43a8-affd-09c90f040ac0-14780202.jpeg"),
            ("Регуляторы давления", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/5b748b99-8f62-4e0e-8a54-2159672cea71/5b748b99-8f62-4e0e-8a54-2159672cea71-14780365.jpeg"),
            ("Краны пробковые", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/0898d156-1f61-4f3b-8960-c3104110a87a/0898d156-1f61-4f3b-8960-c3104110a87a-14780395.jpeg"),
            ("Конденсатоотводчики", "ТР ТС 010/2011",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/0306ad9b-4913-49e3-835c-c721d6d8f190/0306ad9b-4913-49e3-835c-c721d6d8f190-14780258.jpeg"),
        ],
    },
    {
        "section": "Сертификаты РусХлорСерт",
        "items": [
            ("Клапаны регулирующие", "",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/cb3ece70-e718-4e5e-b391-d9cbff0da996/cb3ece70-e718-4e5e-b391-d9cbff0da996-8594742.png"),
        ],
    },
    {
        "section": "Свидетельства об утверждении типа СИ",
        "items": [
            ("Расходомеры-счетчики вихревые FLSTV", "",
             "https://90f1661d-2ff4-4f29-b07c-0e47453ca691.selstorage.ru/site786435/3b0f673b-27d0-4263-856d-db66b8165a3e/3b0f673b-27d0-4263-856d-db66b8165a3e-8594713.jpeg"),
        ],
    },
]


def esc(s):
    return html.escape(str(s or ""), quote=True)


def local_name(url):
    h = hashlib.md5(url.encode()).hexdigest()[:12]
    ext = ".png" if url.lower().endswith(".png") else ".jpeg"
    return f"doc-{h}{ext}"


def download(url):
    name = local_name(url)
    dest = IMG / name
    if dest.exists() and dest.stat().st_size > 1000:
        return f"assets/images/{name}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    data = urllib.request.urlopen(req, timeout=40).read()
    dest.write_bytes(data)
    print("saved", name, len(data))
    time.sleep(0.15)
    return f"assets/images/{name}"


# Download all unique scans
url_to_local = {}
for sec in DOCS:
    for name, std, url in sec["items"]:
        if url not in url_to_local:
            url_to_local[url] = download(url)

# Build documents.html
sections_html = []
for sec in DOCS:
    rows = []
    for name, std, url in sec["items"]:
        img = url_to_local[url]
        rows.append(f"""
          <a class="doc-card" href="{esc(img)}" data-lightbox="{esc(img)}" data-title="{esc(name)}{' — ' + esc(std) if std else ''}">
            <span class="doc-thumb"><img src="{esc(img)}" alt="{esc(name)}"></span>
            <span class="doc-card-body">
              <strong>{esc(name)}</strong>
              {f'<span class="doc-std">{esc(std)}</span>' if std else ''}
              <em>Открыть скан</em>
            </span>
          </a>""")
    sections_html.append(f"""
        <div class="doc-section">
          <h3>{esc(sec['section'])}</h3>
          <div class="doc-grid">
{''.join(rows)}
          </div>
        </div>""")

documents = f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Документы — АКМАН</title>
  <meta name="description" content="Разрешительные документы ООО АКМАН">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css?v=8">
</head>
<body data-active="documents" data-depth="0">
  <div id="site-header"></div>
  <main>
    <section class="page-banner">
      <div class="container">
        <h1>Документы</h1>
        <p>Разрешительные документы — нажмите на карточку, чтобы открыть скан</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
{''.join(sections_html)}
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
</body>
</html>
"""
(ROOT / "documents.html").write_text(documents, encoding="utf-8")
print("documents.html written with", sum(len(s["items"]) for s in DOCS), "items")

# Save mapping for reference
(ROOT / "data" / "documents_map.json").write_text(
    json.dumps(
        [
            {"section": s["section"], "items": [{"name": n, "std": st, "image": url_to_local[u]} for n, st, u in s["items"]]}
            for s in DOCS
        ],
        ensure_ascii=False,
        indent=2,
    ),
    encoding="utf-8",
)
print("done")
