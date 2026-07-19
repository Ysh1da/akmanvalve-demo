#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate static HTML pages for AKMAN site from catalog.json"""

import json
import os
import html
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(ROOT, "data", "catalog.json"), encoding="utf-8") as f:
    CATALOG = json.load(f)

PRODUCTS_DIR = os.path.join(ROOT, "products")
os.makedirs(PRODUCTS_DIR, exist_ok=True)


def esc(s):
    return html.escape(str(s or ""), quote=True)


def asset(path, depth=0):
    """Prefix relative asset path by page depth."""
    if not path:
        return ""
    if path.startswith(("http://", "https://", "data:")):
        return path
    prefix = "../" * depth
    return prefix + path.lstrip("./")


def page_shell(title, body, depth=0, active="", description=""):
    prefix = "../" * depth
    desc = description or "ООО АКМАН — поставщик технологического оборудования для нефтегазовой и нефтехимической промышленности"
    return f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{esc(title)} — АКМАН</title>
  <meta name="description" content="{esc(desc)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{prefix}css/styles.css">
</head>
<body data-active="{esc(active)}" data-depth="{depth}">
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


def write(path, content):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full) if os.path.dirname(full) else ROOT, exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print("wrote", path)


# ---------- Index ----------
slides = CATALOG["heroSlides"]
slide_tiles = "\n".join(
    f"""          <a class="cat-tile reveal" href="{esc(s['href'])}">
            <img src="{esc(s['image'])}" alt="{esc(s['title'])}">
            <span>{esc(s['title'])}</span>
          </a>"""
    for s in slides
)

index_body = f"""
    <section class="hero">
      <div class="hero-bg" aria-hidden="true"></div>
      <div class="container hero-content">
        <p class="hero-brand">AKMAN</p>
        <h1>Технологическое оборудование для нефтегаза и нефтехимии</h1>
        <p>Официальный дистрибьютор зарубежных производителей на территории РФ и стран Таможенного Союза.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="products.html">Каталог продукции</a>
          <a class="btn btn-outline" href="contacts.html">Связаться с нами</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">Продукция</span>
          <h2>Ключевые направления</h2>
          <p>Средства измерений, трубопроводная арматура и внутренние контактные устройства для промышленных объектов.</p>
        </div>
        <div class="grid-2">
{slide_tiles}
        </div>
      </div>
    </section>

    <section class="section section-muted">
      <div class="container about-split">
        <div class="reveal">
          <span class="eyebrow">О компании</span>
          <h2>ООО «АКМАН»</h2>
          <p>{esc(CATALOG['company']['about'])}</p>
          <a class="btn btn-blue" href="company.html">Подробнее</a>
        </div>
        <div class="reveal">
          <img src="{esc(CATALOG['company']['aboutImage'])}" alt="Промышленный объект">
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">Документы</span>
          <h2>Разрешительная документация</h2>
          <p>Декларации и сертификаты соответствия, свидетельства об утверждении типа СИ.</p>
        </div>
        <a class="btn btn-blue reveal" href="documents.html">Смотреть документы</a>
      </div>
    </section>
"""
write("index.html", page_shell("Главная", index_body, 0, "home"))

# ---------- Company ----------
company_body = f"""
    <section class="page-banner">
      <div class="container">
        <h1>О компании</h1>
        <p>Поставщик технологического оборудования для нефтегазовой и нефтехимической промышленности</p>
      </div>
    </section>
    <section class="section">
      <div class="container about-split">
        <div class="reveal">
          <h2>ООО «АКМАН»</h2>
          <p>{esc(CATALOG['company']['about'])}</p>
          <p>Мы поставляем средства измерений, запорно-регулирующую арматуру и внутренние контактные устройства колонного оборудования.</p>
          <div class="hero-actions" style="margin-top:1.5rem">
            <a class="btn btn-blue" href="products.html">Продукция</a>
            <a class="btn btn-outline" style="color:var(--blue-800);border-color:var(--blue-800)" href="contacts.html">Контакты</a>
          </div>
        </div>
        <div class="reveal">
          <img src="{esc(CATALOG['company']['aboutImage'])}" alt="АКМАН">
        </div>
      </div>
    </section>
"""
write("company.html", page_shell("О компании", company_body, 0, "company"))

# ---------- Contacts ----------
offices_html = []
for o in CATALOG["company"]["offices"]:
    offices_html.append(f"""
        <article class="contact-card reveal">
          <h3>{esc(o['title'])}</h3>
          <dl>
            <dt>Адрес</dt>
            <dd>{esc(o['address'])}</dd>
            <dt>Время работы</dt>
            <dd>{esc(o['hours']).replace(chr(10), '<br>')}</dd>
            <dt>Для связи</dt>
            <dd><a href="tel:{esc(o['phone'].replace(' ', '').replace('—','-'))}">{esc(o['phone'])}</a><br>
            <a href="mailto:{esc(o['email'])}">{esc(o['email'])}</a></dd>
          </dl>
        </article>""")

contacts_body = f"""
    <section class="page-banner">
      <div class="container">
        <h1>Контакты</h1>
        <p>Свяжитесь с нами в Москве или Казани</p>
      </div>
    </section>
    <section class="section section-muted">
      <div class="container grid-2">
{''.join(offices_html)}
      </div>
    </section>
"""
write("contacts.html", page_shell("Контакты", contacts_body, 0, "contacts"))

# ---------- Documents ----------
doc_sections = []
for sec in CATALOG["documents"]["sections"]:
    items = "\n".join(
        f"""          <div class="doc-item">
            <strong>{esc(it['name'])}</strong>
            <span>{esc(it.get('std',''))}</span>
          </div>"""
        for it in sec["items"]
    )
    doc_sections.append(f"""
        <div class="doc-section reveal">
          <h3>{esc(sec['title'])}</h3>
          <div class="doc-list">
{items}
          </div>
        </div>""")

gallery = "\n".join(
    f'          <a href="{esc(img)}" target="_blank" rel="noopener"><img src="{esc(img)}" alt="Документ"></a>'
    for img in CATALOG["documents"]["images"][:24]
)

documents_body = f"""
    <section class="page-banner">
      <div class="container">
        <h1>Документы</h1>
        <p>Разрешительные документы на продукцию</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
{''.join(doc_sections)}
        <div class="reveal">
          <h3 style="margin-top:2rem">Сканы документов</h3>
          <div class="doc-gallery">
{gallery}
          </div>
        </div>
      </div>
    </section>
"""
write("documents.html", page_shell("Документы", documents_body, 0, "documents"))

# ---------- Products root ----------
cat_cards = []
cat_images = {
    "cami": "assets/images/b182b10a204b.png",
    "soacv": "assets/images/1071a158f6d3.png",
    "icp": "assets/images/182a24ce0eb3.png",
}
for cat in CATALOG["categories"]:
    img = cat_images.get(cat["id"], slides[0]["image"])
    cat_cards.append(f"""
        <a class="product-card reveal" href="{esc(cat['href'])}">
          <div class="product-card-media"><img src="{esc(img)}" alt="{esc(cat['title'])}"></div>
          <div class="product-card-body">
            <h3>{esc(cat['title'])}</h3>
            <span class="link-more">Перейти</span>
          </div>
        </a>""")

products_body = f"""
    <section class="page-banner">
      <div class="container">
        <h1>Продукция</h1>
        <p>Три основных направления поставок оборудования</p>
      </div>
    </section>
    <section class="section">
      <div class="container grid-3">
{''.join(cat_cards)}
      </div>
      <div class="container" style="margin-top:2.5rem">
        <div id="custom-products-root"></div>
      </div>
    </section>
"""
write("products.html", page_shell("Продукция", products_body, 0, "products"))


def cards_from_items(items, depth=1):
    out = []
    for it in items:
        href = it.get("href")
        imgs = it.get("images") or []
        img = imgs[0] if imgs else ("../assets/images/b182b10a204b.png" if depth else "assets/images/b182b10a204b.png")
        # fix depth for asset
        if not img.startswith("../") and depth:
            img = asset(img, depth) if not img.startswith("http") else img
        title = it.get("title") or it.get("name", "")
        sub = it.get("subtitle") or it.get("series") or ""
        if href:
            link = asset(href, 0) if href.startswith("products/") else href
            # when already in products/, strip products/
            if depth and href.startswith("products/"):
                link = href.replace("products/", "")
            out.append(f"""
        <a class="product-card reveal" href="{esc(link)}">
          <div class="product-card-media"><img src="{esc(img)}" alt="{esc(title)}"></div>
          <div class="product-card-body">
            <h3>{esc(title)}</h3>
            {f'<p>{esc(sub)}</p>' if sub else ''}
            <span class="link-more">Подробнее</span>
          </div>
        </a>""")
        else:
            out.append(f"""
        <div class="product-card reveal">
          <div class="product-card-media"><img src="{esc(img)}" alt="{esc(title)}"></div>
          <div class="product-card-body">
            <h3>{esc(title)}</h3>
            {f'<p>{esc(sub)}</p>' if sub else ''}
            <p style="font-size:0.85rem;color:var(--steel-light)">По запросу</p>
          </div>
        </div>""")
    return "\n".join(out)


def category_page(filename, title, subtitle, items, crumbs):
    crumb_html = " <span>/</span> ".join(
        f'<a href="{esc(c[1])}">{esc(c[0])}</a>' if c[1] else f"<strong>{esc(c[0])}</strong>"
        for c in crumbs
    )
    body = f"""
    <section class="page-banner">
      <div class="container">
        <h1>{esc(title)}</h1>
        <p>{esc(subtitle)}</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <nav class="breadcrumb">{crumb_html}</nav>
        <div class="grid-3">
{cards_from_items(items, depth=1)}
        </div>
      </div>
    </section>
"""
    write(f"products/{filename}", page_shell(title, body, 1, "products"))


# Instruments
cami = CATALOG["categories"][0]
category_page(
    "instruments.html",
    "Средства измерений",
    "Расходомеры, ротаметры и уровнемеры",
    cami["children"],
    [("Главная", "../index.html"), ("Продукция", "../products.html"), ("Средства измерений", None)],
)

# Flowmeters
fms = cami["children"][0]
category_page(
    "flowmeters.html",
    "Расходомеры",
    "Вихревые, электромагнитные, ультразвуковые и массовые",
    fms["children"],
    [("Главная", "../index.html"), ("Продукция", "../products.html"), ("Средства измерений", "instruments.html"), ("Расходомеры", None)],
)

# Vortex
fmsv = fms["children"][0]
category_page(
    "vortex-flowmeters.html",
    "Вихревые расходомеры",
    "Серия FLSTV",
    fmsv["products"],
    [("Главная", "../index.html"), ("Продукция", "../products.html"), ("Расходомеры", "flowmeters.html"), ("Вихревые", None)],
)

# Rotameters
rms = cami["children"][1]
category_page(
    "rotameters.html",
    "Ротаметры",
    "Серии F56 и F57",
    rms["children"],
    [("Главная", "../index.html"), ("Продукция", "../products.html"), ("Средства измерений", "instruments.html"), ("Ротаметры", None)],
)

# Level gauges
lgs = cami["children"][2]
category_page(
    "level-gauges.html",
    "Уровнемеры",
    "Радарные и микроволновые",
    lgs["children"],
    [("Главная", "../index.html"), ("Продукция", "../products.html"), ("Средства измерений", "instruments.html"), ("Уровнемеры", None)],
)

# Valves
soacv = CATALOG["categories"][1]
category_page(
    "valves.html",
    "Арматура трубопроводная",
    "Регулирующая и запорная арматура",
    soacv["children"],
    [("Главная", "../index.html"), ("Продукция", "../products.html"), ("Арматура", None)],
)

# Control valves
allcv = soacv["children"][0]
category_page(
    "control-valves.html",
    "Клапаны регулирующие",
    "Серии SV100, SV200, SV300",
    allcv["children"],
    [("Главная", "../index.html"), ("Продукция", "../products.html"), ("Арматура", "valves.html"), ("Клапаны регулирующие", None)],
)

# Internals
icp = CATALOG["categories"][2]
category_page(
    "internals.html",
    "Внутренние контактные устройства (ВКУ)",
    "Насадки, тарелки и устройства колонн",
    icp["children"],
    [("Главная", "../index.html"), ("Продукция", "../products.html"), ("ВКУ", None)],
)

# Tower packings
icptn = icp["children"][0]
category_page(
    "tower-packings.html",
    "Насадки башенные",
    "Регулярные и хаотичные насадки",
    icptn["children"],
    [("Главная", "../index.html"), ("ВКУ", "internals.html"), ("Насадки башенные", None)],
)

# Structured packings
icptnpr = icptn["children"][0]
category_page(
    "structured-packings.html",
    "Насадки регулярные",
    "1–3 поколения",
    icptnpr["children"],
    [("Главная", "../index.html"), ("Насадки", "tower-packings.html"), ("Регулярные", None)],
)

# Other ICP category leaves without deep children
for child in icp["children"][1:]:
    fname = child["href"].replace("products/", "") if child.get("href") else None
    if not fname:
        continue
    texts = CATALOG.get("pages", {}).get("/" + child["id"], {}).get("texts", [])
    # filter titles
    items = []
    # parse children from page texts - use simple list from remaining text after title
    page = CATALOG.get("pages", {}).get("/" + child["id"], {})
    raw = page.get("texts", [])
    # skip until after main title words
    skip_until = child["title"]
    started = False
    buf = []
    for t in raw:
        if not started:
            if t in child["title"] or child["title"].startswith(t):
                started = True
            continue
        if t:
            buf.append(t)
    # group consecutive short lines into titles - simpler: show as text blocks
    # Just create placeholder cards from known structure in original site
    known = {
        "icppdc": ["Тарелки клапанные", "Тарелки ситчатые", "Тарелки колпачковые"],
        "icptipwa": [
            "Распределители жидкости",
            "Сборники жидкости",
            "Опоры насадочные",
            "Ограничители насадок",
        ],
        "icpisp": ["Газожидкостные сепараторы", "Жидкостные сепараторы/коалесцеры"],
        "icprip": [
            "Распределители жидкости",
            "Опорные решетки",
            "Катализаторные корзины",
        ],
    }
    items = [{"title": t, "href": None} for t in known.get(child["id"], buf[:8] or [child["title"]])]
    category_page(
        fname,
        child["title"],
        "Продукция направления",
        items,
        [("Главная", "../index.html"), ("ВКУ", "internals.html"), (child["title"], None)],
    )


# Detail product pages with specs / content
def product_detail(filename, title, subtitle, images, specs=None, extra_html="", crumbs=None):
    crumbs = crumbs or []
    crumb_html = " <span>/</span> ".join(
        f'<a href="{esc(c[1])}">{esc(c[0])}</a>' if c[1] else f"<strong>{esc(c[0])}</strong>"
        for c in crumbs
    )
    imgs = [asset(i, 1) for i in images] if images else [asset("assets/images/b182b10a204b.png", 1)]
    main = imgs[0]
    thumbs = "\n".join(
        f'<button type="button" data-full="{esc(im)}" class="{"active" if i==0 else ""}"><img src="{esc(im)}" alt=""></button>'
        for i, im in enumerate(imgs)
    )
    specs_rows = ""
    if specs:
        specs_rows = "\n".join(
            f"<tr><th>{esc(s['name'])}</th><td>{esc(s['value'])}</td></tr>" for s in specs
        )
        specs_block = f"""
        <div class="reveal" style="margin-top:2.5rem">
          <h2>Технические характеристики</h2>
          <table class="specs">{specs_rows}</table>
        </div>"""
    else:
        specs_block = extra_html

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
            {f'<p>{esc(subtitle)}</p>' if subtitle else ''}
            <a class="btn btn-blue" href="../contacts.html">Запросить коммерческое предложение</a>
          </div>
        </div>
        {specs_block}
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
    write(f"products/{filename}", page_shell(title, body, 1, "products"))


# FLSTV products
for prod in fmsv["products"]:
    fname = prod["href"].replace("products/", "")
    product_detail(
        fname,
        prod["title"],
        prod.get("subtitle", ""),
        prod.get("images", []),
        prod.get("specs"),
        crumbs=[
            ("Главная", "../index.html"),
            ("Вихревые", "vortex-flowmeters.html"),
            (prod["title"].split("FLSTV")[-1].strip() or prod["title"], None),
        ],
    )


def content_from_page(path_key):
    page = CATALOG.get("pages", {}).get(path_key, {})
    texts = page.get("texts", [])
    images = page.get("images", [])
    # Build a readable description: skip title-like first lines, keep bullet-ish content
    lines = []
    for t in texts:
        if t.upper() == t and len(t) < 60:
            continue
        lines.append(t)
    # group into HTML
    html_parts = []
    bullets = []
    for t in lines:
        if t.startswith("-") or t.startswith("–"):
            bullets.append(t.lstrip("-– ").strip())
        else:
            if bullets:
                html_parts.append("<ul>" + "".join(f"<li>{esc(b)}</li>" for b in bullets) + "</ul>")
                bullets = []
            html_parts.append(f"<p>{esc(t)}</p>")
    if bullets:
        html_parts.append("<ul>" + "".join(f"<li>{esc(b)}</li>" for b in bullets) + "</ul>")
    return images, "\n".join(html_parts)


# Valve detail pages
valve_pages = [
    ("cv-2way.html", "Клапаны регулирующие 2-х ходовые", "Серия SV100", "/cv2w", "control-valves.html"),
    ("cv-angle.html", "Клапаны регулирующие угловые", "Серия SV200", "/cva", "control-valves.html"),
    ("cv-3way.html", "Клапаны регулирующие 3-х ходовые", "Серия SV300", "/cv3w", "control-valves.html"),
    ("globe-valves.html", "Клапаны (вентили)", "", "/somvgl", "valves.html"),
    ("pressure-regulators.html", "Регуляторы давления", "", "/somvprv", "valves.html"),
    ("ball-valves.html", "Краны шаровые", "", "/somvba", "valves.html"),
    ("butterfly-valves.html", "Затворы дисковые", "", "/somvbf", "valves.html"),
    ("gate-valves.html", "Задвижки", "", "/somvga", "valves.html"),
    ("check-valves.html", "Клапаны обратные", "", "/somvch", "valves.html"),
]

for fname, title, sub, key, parent in valve_pages:
    images, content = content_from_page(key)
    # Try to build specs from alternating pairs for regulator etc.
    page_texts = CATALOG.get("pages", {}).get(key, {}).get("texts", [])
    extra = f'<div class="reveal" style="margin-top:2rem"><h2>Описание</h2>{content}</div>'
    product_detail(
        fname,
        title,
        sub,
        images,
        None,
        extra,
        crumbs=[
            ("Главная", "../index.html"),
            ("Арматура", "valves.html"),
            (title, None),
        ],
    )

# Packings detail
for fname, title, key in [
    ("packings-gen1.html", "Насадки регулярные 1-го поколения", "/icptnpr1"),
    ("packings-gen2.html", "Насадки регулярные 2-го поколения", "/icptnpr2"),
    ("packings-gen3.html", "Насадки регулярные 3-го поколения", "/icptnpr3"),
]:
    images, content = content_from_page(key)
    product_detail(
        fname,
        title,
        "",
        images,
        None,
        f'<div class="reveal" style="margin-top:2rem"><h2>Типы</h2>{content}</div>',
        crumbs=[
            ("Главная", "../index.html"),
            ("Регулярные", "structured-packings.html"),
            (title, None),
        ],
    )

# Admin page
admin_body = """
    <section class="page-banner">
      <div class="container">
        <h1>Управление продукцией</h1>
        <p>Скрытый раздел. Доступ только по паролю. Работает онлайн и офлайн.</p>
      </div>
    </section>
    <section class="section">
      <div class="container">
        <div id="admin-login" class="admin-wrap">
          <h2>Вход</h2>
          <p>Введите пароль администратора</p>
          <label for="admin-pass">Пароль</label>
          <input type="password" id="admin-pass" autocomplete="current-password">
          <div class="admin-actions">
            <button type="button" class="btn btn-blue" id="admin-login-btn">Войти</button>
          </div>
          <div id="admin-login-msg" class="admin-msg hidden"></div>
        </div>

        <div id="admin-panel" class="admin-wrap hidden">
          <h2>Добавить продукцию</h2>
          <p>Данные сохраняются в браузере (localStorage) и доступны офлайн. Можно выгрузить JSON для публикации на сервер.</p>
          <form id="product-form">
            <label for="p-title">Название *</label>
            <input id="p-title" required>

            <label for="p-category">Категория</label>
            <select id="p-category">
              <option value="cami">Средства измерений</option>
              <option value="soacv">Арматура трубопроводная</option>
              <option value="icp">ВКУ</option>
              <option value="other">Другое</option>
            </select>

            <label for="p-subtitle">Краткое описание</label>
            <textarea id="p-subtitle"></textarea>

            <label for="p-specs">Характеристики (каждая строка: Название | Значение)</label>
            <textarea id="p-specs" placeholder="Диаметр, мм | 15 ~ 150"></textarea>

            <label for="p-image">Изображение (файл)</label>
            <input type="file" id="p-image" accept="image/*">

            <label for="p-image-url">или путь/URL изображения</label>
            <input id="p-image-url" placeholder="assets/images/...">

            <div class="admin-actions">
              <button type="submit" class="btn btn-blue">Сохранить</button>
              <button type="button" class="btn btn-outline" style="color:var(--blue-800);border-color:var(--blue-800)" id="export-btn">Скачать JSON</button>
              <button type="button" class="btn btn-outline" style="color:var(--blue-800);border-color:var(--blue-800)" id="import-btn">Импорт JSON</button>
              <input type="file" id="import-file" accept="application/json" class="hidden">
              <button type="button" class="btn btn-outline" style="color:#8a3030;border-color:#8a3030" id="logout-btn">Выйти</button>
            </div>
          </form>
          <div id="admin-msg" class="admin-msg hidden"></div>
          <h3 style="margin-top:2rem">Добавленные позиции</h3>
          <div id="admin-list"></div>
        </div>
      </div>
    </section>
    <script src="js/admin.js"></script>
"""
write("admin.html", page_shell("Админ", admin_body, 0, ""))
# hide admin from search engines
admin_path = os.path.join(ROOT, "admin.html")
with open(admin_path, encoding="utf-8") as f:
    admin_html = f.read()
if "noindex" not in admin_html:
    admin_html = admin_html.replace(
        '<meta name="viewport"',
        '<meta name="robots" content="noindex, nofollow">\n  <meta name="viewport"',
        1,
    )
    with open(admin_path, "w", encoding="utf-8") as f:
        f.write(admin_html)

print("Done generating site")
