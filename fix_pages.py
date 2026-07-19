#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix product specs parsing, documents links, homepage, contacts map."""

import json
import os
import html
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(ROOT, "data", "pages.json"), encoding="utf-8") as f:
    PAGES = json.load(f)
with open(os.path.join(ROOT, "data", "catalog.json"), encoding="utf-8") as f:
    CATALOG = json.load(f)


def esc(s):
    return html.escape(str(s or ""), quote=True)


KNOWN_LABELS = {
    "Рабочая среда",
    "Диаметр номинальный для жидкости, мм",
    "Диаметр номинальный для газа и пара, мм",
    "Диаметр номинальный для газа, мм",
    "Диаметр номинальный, мм",
    "Давление номинальное, МПа",
    "Давление номинальное",
    "Температура рабочей среды, ℃",
    "Температура окружающей среды, ℃",
    "Тип присоединения",
    "Материал",
    "Материалы корпуса",
    "Диапазон расхода жидкости, м/с",
    "Диапазон расхода газа, м/с",
    "Диапазон расхода пара, м/с",
    "Пределы допускаемой относительной погрешности измерений объемного расхода и объема жидкости, %",
    "Пределы допускаемой относительной погрешности измерений объемного расхода и объема газа и пара, %",
    "Число Рейнольдса",
    "Маркировка взрывозащиты",
    "Питание",
    "Выходной сигнал",
    "Конструкция клапана",
    "Тип клапана",
    "Тип затвора",
    "Тип крана",
    "Тип задвижки",
    "Класс герметичности",
    "Управление",
    "Тип управления",
    "Для продукции",
    "Серия",
}


def page_images(path):
    imgs = []
    for im in PAGES.get(path, {}).get("images", []):
        src = im["src"]
        if src.endswith("a9b33a8775c0.png"):
            continue
        if src not in imgs:
            imgs.append(src)
    return imgs


def texts_to_specs(path):
    """Parse scraped page texts into clean name/value specs."""
    texts = PAGES.get(path, {}).get("texts", [])
    # drop nav noise
    skip = {
        "О компании", "Продукты", "Документы", "Контакты",
        "Средства измерений", "Арматура трубопроводная", "ВКУ",
        "Технические характеристики",
    }
    cleaned = [t for t in texts if t not in skip]
    # drop title-like ALL CAPS / page title first lines only
    while cleaned:
        head = cleaned[0]
        if head.isupper() and len(head) < 80:
            cleaned.pop(0)
            continue
        if head in (
            "Клапаны (вентили)", "Регуляторы давления", "Краны шаровые",
            "Затворы дисковые", "Задвижки", "Клапаны обратные",
            "Клапаны регулирующие 2-х ходовые", "Клапаны регулирующие угловые",
            "Клапаны регулирующие 3-х ходовые",
            "Насадки регулярные 1-го поколения",
            "Насадки регулярные 2-го поколения",
            "Насадки регулярные 3-го поколения",
        ):
            cleaned.pop(0)
            continue
        break

    # find start after characteristics header already removed
    specs = []
    i = 0
    while i < len(cleaned):
        t = cleaned[i]
        is_label = (
            t in KNOWN_LABELS
            or t.endswith(", мм")
            or t.endswith(", МПа")
            or t.endswith(", %")
            or t.endswith(", ℃")
            or t.startswith("Тип ")
            or t.startswith("Класс ")
            or t.startswith("Материал")
            or t.startswith("Диаметр")
            or t.startswith("Давление")
            or t.startswith("Управление")
            or t.startswith("Конструкция")
            or t.startswith("Серия")
        )
        # skip orphan lowercase single words that aren't values after label
        if is_label:
            vals = []
            j = i + 1
            while j < len(cleaned):
                nxt = cleaned[j]
                nxt_is_label = (
                    nxt in KNOWN_LABELS
                    or nxt.endswith(", мм")
                    or nxt.endswith(", МПа")
                    or nxt.startswith("Тип ")
                    or nxt.startswith("Класс ")
                    or nxt.startswith("Материал")
                    or nxt.startswith("Диаметр")
                    or nxt.startswith("Давление")
                    or nxt.startswith("Управление")
                    or nxt.startswith("Конструкция")
                )
                if nxt_is_label:
                    break
                vals.append(nxt.lstrip("-–• ").rstrip(";."))
                j += 1
            value = "; ".join(v for v in vals if v)
            if value:
                specs.append({"name": t, "value": value})
            i = j
            continue
        i += 1
    return specs


def specs_table_html(specs):
    if not specs:
        return ""
    rows = "\n".join(
        f"<tr><th>{esc(s['name'])}</th><td>{esc(s['value'])}</td></tr>" for s in specs
    )
    return f"""
        <div class="reveal" style="margin-top:2.5rem">
          <h2>Технические характеристики</h2>
          <div class="specs-wrap">
            <table class="specs">{rows}</table>
          </div>
        </div>"""


def product_shell(title, body, depth=1):
    prefix = "../" * depth
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)} — АКМАН</title>
  <meta name="description" content="ООО АКМАН — поставщик технологического оборудования для нефтегазовой и нефтехимической промышленности">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{prefix}css/styles.css">
</head>
<body data-active="products" data-depth="{depth}">
  <div id="site-header"></div>
  <main>
{body}
  </main>
  <div id="site-footer"></div>
  <script src="{prefix}js/main.js"></script>
  <script src="{prefix}js/catalog.js"></script>
</body>
</html>
"""


def write_product_detail(fname, title, subtitle, path_key, crumbs):
    images = page_images(path_key)
    specs = texts_to_specs(path_key)
    if not images:
        images = ["assets/images/b182b10a204b.png"]
    imgs = ["../" + i if not i.startswith("../") else i for i in images]
    main = imgs[0]
    thumbs = "\n".join(
        f'<button type="button" data-full="{esc(im)}" class="{"active" if idx==0 else ""}"><img src="{esc(im)}" alt=""></button>'
        for idx, im in enumerate(imgs)
    )
    crumb_html = " <span>/</span> ".join(
        f'<a href="{esc(c[1])}">{esc(c[0])}</a>' if c[1] else f"<strong>{esc(c[0])}</strong>"
        for c in crumbs
    )
    body = f"""
    <section class="section">
      <div class="container">
        <nav class="breadcrumb">{crumb_html}</nav>
        <div class="product-hero">
          <div class="gallery reveal">
            <div class="gallery-main"><img id="gallery-main-img" src="{esc(main)}" alt="{esc(title)}"></div>
            <div class="gallery-thumbs">{thumbs}</div>
          </div>
          <div class="reveal">
            <span class="eyebrow">Продукция</span>
            <h1>{esc(title)}</h1>
            {f'<p class="lead">{esc(subtitle)}</p>' if subtitle else ''}
            <a class="btn btn-blue" href="../contacts.html">Запросить коммерческое предложение</a>
          </div>
        </div>
        {specs_table_html(specs)}
      </div>
    </section>
    <script>
      document.querySelectorAll('.gallery-thumbs button').forEach(btn => {{
        btn.addEventListener('click', () => {{
          document.getElementById('gallery-main-img').src = btn.dataset.full;
          document.querySelectorAll('.gallery-thumbs button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }});
      }});
    </script>
"""
    out = os.path.join(ROOT, "products", fname)
    with open(out, "w", encoding="utf-8") as f:
        f.write(product_shell(title, body))
    print("fixed", fname, "specs:", len(specs))


# Fix valve / packing detail pages
valve_pages = [
    ("globe-valves.html", "Клапаны (вентили)", "", "/somvgl"),
    ("pressure-regulators.html", "Регуляторы давления", "", "/somvprv"),
    ("ball-valves.html", "Краны шаровые", "", "/somvba"),
    ("butterfly-valves.html", "Затворы дисковые", "", "/somvbf"),
    ("gate-valves.html", "Задвижки", "", "/somvga"),
    ("check-valves.html", "Клапаны обратные", "", "/somvch"),
    ("cv-2way.html", "Клапаны регулирующие 2-х ходовые", "Серия SV100", "/cv2w"),
    ("cv-angle.html", "Клапаны регулирующие угловые", "Серия SV200", "/cva"),
    ("cv-3way.html", "Клапаны регулирующие 3-х ходовые", "Серия SV300", "/cv3w"),
    ("packings-gen1.html", "Насадки регулярные 1-го поколения", "", "/icptnpr1"),
    ("packings-gen2.html", "Насадки регулярные 2-го поколения", "", "/icptnpr2"),
    ("packings-gen3.html", "Насадки регулярные 3-го поколения", "", "/icptnpr3"),
]

for fname, title, sub, key in valve_pages:
    write_product_detail(
        fname,
        title,
        sub,
        key,
        [("Главная", "../index.html"), ("Арматура", "valves.html"), (title, None)]
        if "packing" not in fname
        else [("Главная", "../index.html"), ("Регулярные", "structured-packings.html"), (title, None)],
    )

# --- Documents with clickable images ---
doc_imgs = page_images("/documents")
# unique preserve order
seen = set()
unique_imgs = []
for im in doc_imgs:
    if im not in seen:
        seen.add(im)
        unique_imgs.append(im)

# Build flat list of items with images assigned in order
sections = CATALOG["documents"]["sections"]
flat = []
for sec in sections:
    for it in sec["items"]:
        flat.append({**it, "section": sec["title"]})

# assign images cyclically if fewer
for i, it in enumerate(flat):
    it["image"] = unique_imgs[i % len(unique_imgs)] if unique_imgs else None

# regroup
from collections import OrderedDict
grouped = OrderedDict()
for it in flat:
    grouped.setdefault(it["section"], []).append(it)

doc_sections_html = []
for title, items in grouped.items():
    rows = []
    for it in items:
        href = it["image"] or "#"
        rows.append(f"""
          <a class="doc-item" href="{esc(href)}" data-lightbox="{esc(href)}" data-title="{esc(it['name'])}">
            <span class="doc-item-main">
              <strong>{esc(it['name'])}</strong>
              <em>Открыть документ</em>
            </span>
            <span class="doc-std">{esc(it.get('std',''))}</span>
          </a>""")
    doc_sections_html.append(f"""
        <div class="doc-section reveal">
          <h3>{esc(title)}</h3>
          <div class="doc-list">
{''.join(rows)}
          </div>
        </div>""")

gallery = "\n".join(
    f'          <a href="{esc(img)}" data-lightbox="{esc(img)}" data-title="Документ"><img src="{esc(img)}" alt="Документ"></a>'
    for img in unique_imgs[:24]
)

documents_html = f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Документы — АКМАН</title>
  <meta name="description" content="Разрешительные документы ООО АКМАН">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body data-active="documents" data-depth="0">
  <div id="site-header"></div>
  <main>
    <section class="page-banner">
      <div class="container">
        <h1>Документы</h1>
        <p>Разрешительные документы на продукцию — нажмите на название, чтобы открыть скан</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
{''.join(doc_sections_html)}
        <div class="reveal">
          <h3 style="margin-top:2rem">Сканы документов</h3>
          <div class="doc-gallery">
{gallery}
          </div>
        </div>
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
with open(os.path.join(ROOT, "documents.html"), "w", encoding="utf-8") as f:
    f.write(documents_html)
print("documents updated")

# --- Contacts with Yandex maps ---
contacts_html = """<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Контакты — АКМАН</title>
  <meta name="description" content="Контакты ООО АКМАН — Москва и Казань">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body data-active="contacts" data-depth="0">
  <div id="site-header"></div>
  <main>
    <section class="page-banner">
      <div class="container">
        <h1>Контакты</h1>
        <p>Свяжитесь с нами в Москве или Казани</p>
      </div>
    </section>
    <section class="section section-muted">
      <div class="container grid-2">
        <article class="contact-card reveal">
          <h3>Москва</h3>
          <dl>
            <dt>Адрес</dt>
            <dd>129347, г. Москва, ул. Холмогорская, д. 2, корп. 3</dd>
            <dt>Время работы</dt>
            <dd>Пн—Пт: 09:00—18:00<br>Сб, Вс: выходной</dd>
            <dt>Для связи</dt>
            <dd><a href="tel:+74957903250">+7 495 790-32-50</a><br>
            <a href="mailto:mail@akmanvalve.ru">mail@akmanvalve.ru</a></dd>
          </dl>
        </article>
        <article class="contact-card reveal">
          <h3>Обособленное подразделение в г. Казань</h3>
          <dl>
            <dt>Адрес</dt>
            <dd>420064, г. Казань, ул. Баки Урманче, д. 5, пом. 8001, оф. 2</dd>
            <dt>Время работы</dt>
            <dd>Пн—Пт: 09:00—18:00<br>Сб, Вс: выходной</dd>
            <dt>Для связи</dt>
            <dd><a href="tel:+74957903250">+7 495 790-32-50</a><br>
            <a href="mailto:mail@akmanvalve.ru">mail@akmanvalve.ru</a></dd>
          </dl>
        </article>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">На карте</span>
          <h2>Как нас найти</h2>
        </div>
        <div class="maps-grid reveal">
          <div class="map-block">
            <h3>Москва</h3>
            <div class="map-frame">
              <iframe title="Карта — офис Москва"
                src="https://yandex.ru/map-widget/v1/?ll=37.6825%2C55.8865&z=16&l=map&pt=37.6825,55.8865,pm2blm&text=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0%2C%20%D1%83%D0%BB.%20%D0%A5%D0%BE%D0%BB%D0%BC%D0%BE%D0%B3%D0%BE%D1%80%D1%81%D0%BA%D0%B0%D1%8F%2C%202%20%D0%BA3"
                allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
          <div class="map-block">
            <h3>Казань</h3>
            <div class="map-frame">
              <iframe title="Карта — офис Казань"
                src="https://yandex.ru/map-widget/v1/?ll=49.1064%2C55.7441&z=16&l=map&pt=49.1064,55.7441,pm2blm&text=%D0%9A%D0%B0%D0%B7%D0%B0%D0%BD%D1%8C%2C%20%D1%83%D0%BB.%20%D0%91%D0%B0%D0%BA%D0%B8%20%D0%A3%D1%80%D0%BC%D0%B0%D0%BD%D1%87%D0%B5%2C%205"
                allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  <div id="site-footer"></div>
  <script src="js/main.js"></script>
  <script src="js/catalog.js"></script>
</body>
</html>
"""
with open(os.path.join(ROOT, "contacts.html"), "w", encoding="utf-8") as f:
    f.write(contacts_html)
print("contacts updated")

# --- Homepage ---
index_html = """<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Главная — АКМАН</title>
  <meta name="description" content="ООО АКМАН — поставщик технологического оборудования для нефтегазовой и нефтехимической промышленности">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
</head>
<body data-active="home" data-depth="0">
  <div id="site-header"></div>
  <main>
    <section class="hero hero-fresh">
      <div class="hero-media" aria-hidden="true">
        <img src="assets/images/6274efb1b0cd.png" alt="">
      </div>
      <div class="hero-veil" aria-hidden="true"></div>
      <div class="container hero-content">
        <p class="hero-brand">AKMAN</p>
        <h1>Оборудование для нефтегаза и нефтехимии</h1>
        <p>Официальный дистрибьютор зарубежных производителей на территории РФ и стран Таможенного Союза.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="products.html">Каталог продукции</a>
          <a class="btn btn-outline" href="contacts.html">Связаться с нами</a>
        </div>
      </div>
    </section>

    <section class="section home-cats">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">Продукция</span>
          <h2>Ключевые направления</h2>
          <p>Средства измерений, трубопроводная арматура и внутренние контактные устройства.</p>
        </div>
        <div class="home-cat-grid">
          <a class="home-cat reveal" href="products/flowmeters.html">
            <div class="home-cat-img"><img src="assets/images/b182b10a204b.png" alt="Расходомеры"></div>
            <div class="home-cat-body">
              <h3>Расходомеры</h3>
              <span>Смотреть →</span>
            </div>
          </a>
          <a class="home-cat reveal" href="products/level-gauges.html">
            <div class="home-cat-img"><img src="assets/images/84ee50937786.png" alt="Уровнемеры"></div>
            <div class="home-cat-body">
              <h3>Уровнемеры</h3>
              <span>Смотреть →</span>
            </div>
          </a>
          <a class="home-cat reveal" href="products/valves.html">
            <div class="home-cat-img"><img src="assets/images/1071a158f6d3.png" alt="Арматура"></div>
            <div class="home-cat-body">
              <h3>Запорно-регулирующая арматура</h3>
              <span>Смотреть →</span>
            </div>
          </a>
          <a class="home-cat reveal" href="products/internals.html">
            <div class="home-cat-img"><img src="assets/images/182a24ce0eb3.png" alt="ВКУ"></div>
            <div class="home-cat-body">
              <h3>Внутренние контактные устройства</h3>
              <span>Смотреть →</span>
            </div>
          </a>
        </div>
      </div>
    </section>

    <section class="section about-band">
      <div class="container about-split">
        <div class="reveal">
          <span class="eyebrow">О компании</span>
          <h2>ООО «АКМАН»</h2>
          <p>Поставщик технологического оборудования для нефтегазовой и нефтехимической промышленности. Официальный дистрибьютор зарубежных производителей на территории РФ и стран Таможенного Союза.</p>
          <div class="hero-actions">
            <a class="btn btn-blue" href="company.html">О компании</a>
            <a class="btn btn-ghost" href="documents.html">Документы</a>
          </div>
        </div>
        <div class="reveal about-photo">
          <img src="assets/images/6274efb1b0cd.png" alt="Промышленный объект">
        </div>
      </div>
    </section>

    <section class="section cta-band">
      <div class="container cta-inner reveal">
        <div>
          <h2>Нужна консультация по оборудованию?</h2>
          <p>Подберём решение под задачу вашего объекта.</p>
        </div>
        <a class="btn btn-primary" href="contacts.html">Связаться</a>
      </div>
    </section>
  </main>
  <div id="site-footer"></div>
  <script src="js/main.js"></script>
  <script src="js/catalog.js"></script>
</body>
</html>
"""
with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
    f.write(index_html)
print("index updated")
print("done")
