#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build packing type gallery pages from scraped names + images."""

import html
import json
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(ROOT, "data", "pages.json"), encoding="utf-8") as f:
    PAGES = json.load(f)

NAV = {
    "О компании", "Продукты", "Документы", "Контакты",
    "Средства измерений", "Арматура трубопроводная", "ВКУ",
}


def esc(s):
    return html.escape(str(s or ""), quote=True)


def page_images(path):
    imgs = []
    for im in PAGES.get(path, {}).get("images", []):
        src = im["src"]
        if src.endswith("a9b33a8775c0.png"):
            continue
        if src not in imgs:
            imgs.append(src)
    return imgs


def type_names(path):
    texts = PAGES.get(path, {}).get("texts", [])
    cleaned = [t for t in texts if t not in NAV and not t.isupper()]
    # drop first title-like
    while cleaned and ("поколен" in cleaned[0].lower() or "насадк" in cleaned[0].lower()):
        cleaned.pop(0)
        if cleaned and cleaned[0].startswith("("):
            continue
        break
    # merge name + (material) pairs
    names = []
    i = 0
    while i < len(cleaned):
        t = cleaned[i]
        if t.startswith("(") and names:
            names[-1] = names[-1] + " " + t
            i += 1
            continue
        if i + 1 < len(cleaned) and cleaned[i + 1].startswith("("):
            names.append(t + " " + cleaned[i + 1])
            i += 2
            continue
        names.append(t)
        i += 1
    return names


def write_packing(fname, title, path):
    imgs = page_images(path)
    names = type_names(path)
    # pair
    cards = []
    n = max(len(imgs), len(names))
    for i in range(n):
        name = names[i] if i < len(names) else f"Тип {i+1}"
        img = imgs[i] if i < len(imgs) else (imgs[0] if imgs else "assets/images/b182b10a204b.png")
        cards.append(f"""
        <article class="product-card reveal">
          <div class="product-card-media"><img src="../{esc(img)}" alt="{esc(name)}"></div>
          <div class="product-card-body"><h3>{esc(name)}</h3></div>
        </article>""")

    html_out = f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)} — АКМАН</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body data-active="products" data-depth="1">
  <div id="site-header"></div>
  <main>
    <section class="page-banner">
      <div class="container">
        <h1>{esc(title)}</h1>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <nav class="breadcrumb">
          <a href="../index.html">Главная</a> <span>/</span>
          <a href="structured-packings.html">Регулярные</a> <span>/</span>
          <strong>{esc(title)}</strong>
        </nav>
        <div class="grid-3">
{''.join(cards)}
        </div>
        <p style="margin-top:2rem"><a class="btn btn-blue" href="../contacts.html">Запросить коммерческое предложение</a></p>
      </div>
    </section>
  </main>
  <div id="site-footer"></div>
  <script src="../js/main.js"></script>
  <script src="../js/catalog.js"></script>
</body>
</html>
"""
    with open(os.path.join(ROOT, "products", fname), "w", encoding="utf-8") as f:
        f.write(html_out)
    print(fname, len(cards), "types")


write_packing("packings-gen1.html", "Насадки регулярные 1-го поколения", "/icptnpr1")
write_packing("packings-gen2.html", "Насадки регулярные 2-го поколения", "/icptnpr2")
write_packing("packings-gen3.html", "Насадки регулярные 3-го поколения", "/icptnpr3")
