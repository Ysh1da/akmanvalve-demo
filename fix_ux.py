#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Fix on-request cards, maps, CTA, hero background."""

import os
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
PRODUCTS = ROOT / "products"


def fix_on_request_cards(html: str, depth: int = 1) -> str:
    """Turn static 'По запросу' cards into inquiry links with CTA."""
    contacts = "../contacts.html" if depth else "contacts.html"

    def repl(m):
        block = m.group(0)
        # extract title from <h3>...</h3>
        hm = re.search(r"<h3>(.*?)</h3>", block, re.S)
        title = re.sub(r"\s+", " ", hm.group(1).strip()) if hm else "продукцию"
        q = quote(title)
        href = f"{contacts}?product={q}#inquiry"
        # convert outer div to article with actions
        new = block
        new = new.replace(
            '<p style="font-size:0.85rem;color:var(--steel-light)">По запросу</p>',
            f'''<p class="on-request-note">Доступно по запросу</p>
            <div class="card-actions">
              <a class="btn btn-blue btn-sm" href="{href}">Запросить</a>
              <a class="btn btn-ghost btn-sm" href="tel:+74957903250">Позвонить</a>
            </div>''',
        )
        # add class for styling
        new = new.replace('class="product-card reveal"', 'class="product-card product-card-request reveal"', 1)
        return new

    # Match product-card divs that contain "По запросу"
    pattern = re.compile(
        r'<div class="product-card reveal">[\s\S]*?По запросу[\s\S]*?</div>\s*</div>',
        re.M,
    )
    return pattern.sub(repl, html)


# Fix all product HTML files
for path in PRODUCTS.glob("*.html"):
    text = path.read_text(encoding="utf-8")
    if "По запросу" not in text:
        continue
    # skip specs tables that mention по запросу in values
    if '<p style="font-size:0.85rem;color:var(--steel-light)">По запросу</p>' not in text:
        continue
    fixed = fix_on_request_cards(text, depth=1)
    # cache bust css
    fixed = re.sub(r"styles\.css(\?v=\d+)?", "styles.css?v=7", fixed)
    path.write_text(fixed, encoding="utf-8")
    print("fixed cards:", path.name)

# --- Contacts with marked maps ---
# Use search mode + explicit placemark; add open-in-maps links
moscow_q = "Москва, ул. Холмогорская, д. 2, корп. 3"
kazan_q = "Казань, ул. Баки Урманче, д. 5"
# Coordinates (approx offices)
# Moscow Holmogorskaya 2k3 ~ 55.8872, 37.6838
# Kazan Baki Urmanche 5 ~ 55.7435, 49.1820 (southern Kazan)
moscow_ll = "37.71925,55.88238"
kazan_ll = "49.17657,55.73185"

contacts = f"""<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Контакты — АКМАН</title>
  <meta name="description" content="Контакты ООО АКМАН — Москва и Казань">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css?v=7">
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

    <section class="section section-muted" id="inquiry">
      <div class="container">
        <div id="inquiry-banner" class="inquiry-banner hidden">
          <p>Запрос по продукции: <strong id="inquiry-product"></strong></p>
          <a class="btn btn-blue btn-sm" id="inquiry-mail" href="mailto:mail@akmanvalve.ru">Написать на mail@akmanvalve.ru</a>
        </div>
        <div class="grid-2">
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
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-head reveal">
          <span class="eyebrow">На карте</span>
          <h2>Как нас найти</h2>
          <p>Метки показывают расположение офисов АКМАН</p>
        </div>
        <div class="maps-grid reveal">
          <div class="map-block">
            <div class="map-head">
              <h3>Москва</h3>
              <a class="map-ext" href="https://yandex.ru/maps/?text={quote(moscow_q)}&z=17" target="_blank" rel="noopener">Открыть в Яндекс.Картах →</a>
            </div>
            <p class="map-pin-label">📍 ул. Холмогорская, д. 2, корп. 3</p>
            <div class="map-frame">
              <iframe title="Офис АКМАН в Москве"
                src="https://yandex.ru/map-widget/v1/?ll={moscow_ll.replace(',', '%2C')}&z=17&pt={moscow_ll.replace(',', '%2C')}%2Cpm2rdm&l=map"
                allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
          <div class="map-block">
            <div class="map-head">
              <h3>Казань</h3>
              <a class="map-ext" href="https://yandex.ru/maps/?text={quote(kazan_q)}&z=17" target="_blank" rel="noopener">Открыть в Яндекс.Картах →</a>
            </div>
            <p class="map-pin-label">📍 ул. Баки Урманче, д. 5</p>
            <div class="map-frame">
              <iframe title="Офис АКМАН в Казани"
                src="https://yandex.ru/map-widget/v1/?ll={kazan_ll.replace(',', '%2C')}&z=17&pt={kazan_ll.replace(',', '%2C')}%2Cpm2rdm&l=map"
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
  <script src="js/contacts.js"></script>
</body>
</html>
"""
(ROOT / "contacts.html").write_text(contacts, encoding="utf-8")
print("contacts updated")

# --- Index: new hero + restyled CTA ---
index = """<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Главная — АКМАН</title>
  <meta name="description" content="ООО АКМАН — поставщик технологического оборудования для нефтегазовой и нефтехимической промышленности">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css?v=7">
</head>
<body data-active="home" data-depth="0">
  <div id="site-header"></div>
  <main>
    <section class="hero hero-fresh">
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
          <div class="hero-actions" style="opacity:1;animation:none">
            <a class="btn btn-blue" href="company.html">О компании</a>
            <a class="btn btn-ghost" href="documents.html">Документы</a>
          </div>
        </div>
        <div class="reveal about-photo">
          <img src="assets/images/hero-plant.jpg" alt="Промышленный объект">
        </div>
      </div>
    </section>

    <section class="section consult-section">
      <div class="container">
        <div class="consult-card reveal">
          <div class="consult-text">
            <span class="eyebrow">Консультация</span>
            <h2>Подберём оборудование под задачу вашего объекта</h2>
            <p>Расскажите о параметрах среды и объекте — подготовим коммерческое предложение.</p>
          </div>
          <div class="consult-actions">
            <a class="btn btn-blue" href="contacts.html">Связаться</a>
            <a class="btn btn-ghost" href="mailto:mail@akmanvalve.ru">mail@akmanvalve.ru</a>
            <a class="btn btn-ghost" href="tel:+74957903250">+7 495 790-32-50</a>
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
(ROOT / "index.html").write_text(index, encoding="utf-8")
print("index updated")
print("done")
