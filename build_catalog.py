#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build structured catalog.json from scraped pages.json"""

import json
import os
import re

OUT = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(OUT, "data", "pages.json"), encoding="utf-8") as f:
    pages = json.load(f)

NAV_SKIP = {
    "О компании", "Продукты", "Документы", "Контакты",
    "Средства измерений", "Арматура трубопроводная", "ВКУ",
    "Главная страница", "Продукция",
}


def page_images(path, skip_logo=True):
    p = pages.get(path, {})
    imgs = []
    for im in p.get("images", []):
        src = im["src"]
        # skip logo (shared on all pages)
        if skip_logo and src.endswith("a9b33a8775c0.png"):
            continue
        imgs.append(src)
    return imgs


def content_texts(path):
    texts = pages.get(path, {}).get("texts", [])
    # drop duplicated nav blocks
    cleaned = []
    for t in texts:
        if t in NAV_SKIP:
            continue
        cleaned.append(t)
    # also drop title duplicates at start matching page title keywords
    return cleaned


def parse_specs(texts):
    """Pair heading/value style specs from detail pages."""
    # Known label patterns for flowmeters etc.
    labels = []
    values = []
    # After "Технические характеристики" alternate label/value in many pages
    try:
        i = texts.index("Технические характеристики")
        rest = texts[i + 1 :]
    except ValueError:
        rest = texts

    # Heuristic: for FLSTV pages, labels are long descriptive
    specs = []
    # Try pairing consecutive items when odd ones look like labels
    known_labels = {
        "Рабочая среда",
        "Диаметр номинальный для жидкости, мм",
        "Диаметр номинальный для газа и пара, мм",
        "Диаметр номинальный для газа, мм",
        "Давление номинальное, МПа",
        "Температура рабочей среды, ℃",
        "Температура окружающей среды, ℃",
        "Тип присоединения",
        "Материал",
        "Диапазон расхода жидкости, м/с",
        "Диапазон расхода газа, м/с",
        "Диапазон расхода пара, м/с",
        "Пределы допускаемой относительной погрешности измерений объемного расхода и объема жидкости, %",
        "Пределы допускаемой относительной погрешности измерений объемного расхода и объема газа и пара, %",
        "Число Рейнольдса",
        "Маркировка взрывозащиты",
        "Питание",
        "Выходной сигнал",
        "Диаметр номинальный, мм",
        "Давление номинальное",
        "Тип присоединения",
    }
    i = 0
    while i < len(rest):
        t = rest[i]
        if t in known_labels or (i + 1 < len(rest) and len(t) > 15 and not t[0].isdigit()):
            # gather value until next label-like
            if i + 1 < len(rest):
                val_parts = [rest[i + 1]]
                j = i + 2
                while j < len(rest) and rest[j] not in known_labels and not (
                    len(rest[j]) > 20 and j + 1 < len(rest)
                ):
                    # stop if looks like next label
                    if rest[j] in known_labels:
                        break
                    # for multi-line values
                    if any(rest[j].startswith(p) for p in ("±", "Normal", "0Ex", "токовый", "протокол", "фланцевый")):
                        val_parts.append(rest[j])
                        j += 1
                        continue
                    if rest[j].startswith("-") or rest[j].startswith("±"):
                        val_parts.append(rest[j])
                        j += 1
                        continue
                    break
                specs.append({"name": t, "value": " ".join(val_parts)})
                i = j if j > i + 1 else i + 2
                continue
        i += 1
    return specs


# Manual structured catalog based on site structure
catalog = {
    "company": {
        "name": "ООО «АКМАН»",
        "short": "АКМАН",
        "about": 'ООО "АКМАН" — поставщик технологического оборудования для нефтегазовой и нефтехимической промышленности. Компания является официальным дистрибьютором зарубежных производителей технологического оборудования на территории РФ и стран Таможенного Союза.',
        "aboutImage": "assets/images/6274efb1b0cd.png",
        "logo": "assets/images/a9b33a8775c0.png",
        "phone": "+7 495 790-32-50",
        "email": "mail@akmanvalve.ru",
        "offices": [
            {
                "title": "Москва",
                "address": "129347, г. Москва, ул. Холмогорская, д. 2, корп. 3",
                "hours": "Пн—Пт: 09:00—18:00\nСб, Вс: выходной",
                "phone": "+7 495 790-32-50",
                "email": "mail@akmanvalve.ru",
            },
            {
                "title": "Обособленное подразделение в г. Казань",
                "address": "420064, г. Казань, ул. Баки Урманче, д. 5, пом. 8001, оф. 2",
                "hours": "Пн—Пт: 09:00—18:00\nСб, Вс: выходной",
                "phone": "+7 495 790-32-50",
                "email": "mail@akmanvalve.ru",
            },
        ],
    },
    "heroSlides": [
        {"title": "Расходомеры", "image": "assets/images/b182b10a204b.png", "href": "products/flowmeters.html"},
        {"title": "Уровнемеры", "image": "assets/images/84ee50937786.png", "href": "products/level-gauges.html"},
        {"title": "Запорно-регулирующая арматура", "image": "assets/images/1071a158f6d3.png", "href": "products/valves.html"},
        {"title": "Внутренние контактные устройства", "image": "assets/images/182a24ce0eb3.png", "href": "products/internals.html"},
    ],
    "categories": [
        {
            "id": "cami",
            "title": "Средства измерений",
            "href": "products/instruments.html",
            "children": [
                {
                    "id": "fms",
                    "title": "Расходомеры",
                    "href": "products/flowmeters.html",
                    "children": [
                        {
                            "id": "fmsv",
                            "title": "Вихревые",
                            "href": "products/vortex-flowmeters.html",
                            "products": [
                                {
                                    "id": "flstvfk60",
                                    "title": "Расходомеры-счетчики вихревые FLSTV FK60",
                                    "subtitle": "с компенсацией температуры и давления",
                                    "href": "products/flstv-fk60.html",
                                    "images": page_images("/flstvfk60"),
                                },
                                {
                                    "id": "flstvfk60b",
                                    "title": "Расходомеры-счетчики вихревые FLSTV FK60 (с Bluetooth)",
                                    "subtitle": "с компенсацией температуры и давления",
                                    "href": "products/flstv-fk60b.html",
                                    "images": page_images("/flstvfk60b"),
                                },
                                {
                                    "id": "flstvfk62",
                                    "title": "Расходомеры-счетчики вихревые FLSTV FK62",
                                    "subtitle": "",
                                    "href": "products/flstv-fk62.html",
                                    "images": page_images("/flstvfk62"),
                                },
                            ],
                        },
                        {"id": "em", "title": "Электромагнитные", "href": None},
                        {"id": "us", "title": "Ультразвуковые", "href": None},
                        {"id": "mc", "title": "Массовые кориолисовые", "href": None},
                        {"id": "mt", "title": "Массовые тепловые", "href": None},
                    ],
                },
                {
                    "id": "rms",
                    "title": "Ротаметры",
                    "href": "products/rotameters.html",
                    "children": [
                        {"id": "f56", "title": "Серия F56", "href": None},
                        {"id": "f57", "title": "Серия F57", "href": None},
                    ],
                },
                {
                    "id": "lgs",
                    "title": "Уровнемеры",
                    "href": "products/level-gauges.html",
                    "children": [
                        {
                            "id": "radar",
                            "title": "Радарные (с радиолокатором непрерывного излучения с частотной модуляцией)",
                            "href": None,
                        },
                        {"id": "mw", "title": "Микроволновые высокочастотные", "href": None},
                    ],
                },
            ],
        },
        {
            "id": "soacv",
            "title": "Арматура трубопроводная",
            "href": "products/valves.html",
            "children": [
                {
                    "id": "allcv",
                    "title": "Клапаны регулирующие",
                    "href": "products/control-valves.html",
                    "children": [
                        {
                            "id": "cv2w",
                            "title": "Клапаны регулирующие 2-х ходовые",
                            "series": "Серия SV100",
                            "href": "products/cv-2way.html",
                            "images": page_images("/cv2w"),
                        },
                        {
                            "id": "cva",
                            "title": "Клапаны регулирующие угловые",
                            "series": "Серия SV200",
                            "href": "products/cv-angle.html",
                            "images": page_images("/cva"),
                        },
                        {
                            "id": "cv3w",
                            "title": "Клапаны регулирующие 3-х ходовые",
                            "series": "Серия SV300",
                            "href": "products/cv-3way.html",
                            "images": page_images("/cv3w"),
                        },
                    ],
                },
                {
                    "id": "somvgl",
                    "title": "Клапаны (вентили)",
                    "href": "products/globe-valves.html",
                    "images": page_images("/somvgl"),
                },
                {
                    "id": "somvprv",
                    "title": "Регуляторы давления",
                    "href": "products/pressure-regulators.html",
                    "images": page_images("/somvprv"),
                },
                {
                    "id": "somvba",
                    "title": "Краны шаровые",
                    "href": "products/ball-valves.html",
                    "images": page_images("/somvba"),
                },
                {
                    "id": "somvbf",
                    "title": "Затворы дисковые",
                    "href": "products/butterfly-valves.html",
                    "images": page_images("/somvbf"),
                },
                {
                    "id": "somvga",
                    "title": "Задвижки",
                    "href": "products/gate-valves.html",
                    "images": page_images("/somvga"),
                },
                {
                    "id": "somvch",
                    "title": "Клапаны обратные",
                    "href": "products/check-valves.html",
                    "images": page_images("/somvch"),
                },
                {"id": "safety", "title": "Клапаны предохранительные", "href": None},
                {"id": "steamtrap", "title": "Конденсатоотводчики", "href": None},
                {"id": "spectacle", "title": "Заглушки поворотные", "href": None},
                {"id": "filters", "title": "Фильтры", "href": None},
            ],
        },
        {
            "id": "icp",
            "title": "Внутренние контактные устройства (ВКУ)",
            "href": "products/internals.html",
            "children": [
                {
                    "id": "icptn",
                    "title": "Насадки башенные",
                    "href": "products/tower-packings.html",
                    "children": [
                        {
                            "id": "icptnpr",
                            "title": "Насадки регулярные",
                            "href": "products/structured-packings.html",
                            "children": [
                                {
                                    "id": "icptnpr1",
                                    "title": "Насадки регулярные 1-го поколения",
                                    "href": "products/packings-gen1.html",
                                    "images": page_images("/icptnpr1"),
                                },
                                {
                                    "id": "icptnpr2",
                                    "title": "Насадки регулярные 2-го поколения",
                                    "href": "products/packings-gen2.html",
                                    "images": page_images("/icptnpr2"),
                                },
                                {
                                    "id": "icptnpr3",
                                    "title": "Насадки регулярные 3-го поколения",
                                    "href": "products/packings-gen3.html",
                                    "images": page_images("/icptnpr3"),
                                },
                            ],
                        },
                        {"id": "random", "title": "Насадки хаотичные", "href": None},
                    ],
                },
                {
                    "id": "icppdc",
                    "title": "Тарелки ректификационной колонны",
                    "href": "products/column-trays.html",
                },
                {
                    "id": "icptipwa",
                    "title": "Внутренние устройства башенные с насадкой",
                    "href": "products/packed-tower-internals.html",
                },
                {
                    "id": "icpisp",
                    "title": "Внутренние устройства разделения",
                    "href": "products/separation-internals.html",
                },
                {
                    "id": "icprip",
                    "title": "Внутренние устройства реактора",
                    "href": "products/reactor-internals.html",
                },
            ],
        },
    ],
}

# Attach detailed specs for product pages
for pid, path in [
    ("flstvfk60", "/flstvfk60"),
    ("flstvfk60b", "/flstvfk60b"),
    ("flstvfk62", "/flstvfk62"),
]:
    texts = content_texts(path)
    # find product in catalog and attach
    for cat in catalog["categories"]:
        for ch in cat.get("children", []):
            for sub in ch.get("children", []):
                for prod in sub.get("products", []):
                    if prod["id"] == pid:
                        prod["specs"] = parse_specs(texts)
                        prod["rawTexts"] = texts

# Attach detail content for valve pages
detail_map = {
    "cv2w": "/cv2w",
    "cva": "/cva",
    "cv3w": "/cv3w",
    "somvgl": "/somvgl",
    "somvprv": "/somvprv",
    "somvba": "/somvba",
    "somvbf": "/somvbf",
    "somvga": "/somvga",
    "somvch": "/somvch",
    "icptnpr1": "/icptnpr1",
    "icptnpr2": "/icptnpr2",
    "icptnpr3": "/icptnpr3",
}

for path, data in pages.items():
    if path in ("/", "/company", "/contacts", "/documents", "/goods"):
        continue
    catalog.setdefault("pages", {})[path] = {
        "title": data["title"],
        "texts": content_texts(path),
        "images": page_images(path),
    }

# Documents structure
doc_texts = content_texts("/documents")
catalog["documents"] = {
    "title": "Разрешительные документы",
    "images": page_images("/documents"),
    "sections": [
        {
            "title": "Декларации о соответствии",
            "items": [
                {"name": "Расходомеры-счетчики вихревые FLSTV", "std": "ТР ТС 020/2011"},
                {"name": "Клапаны регулирующие серий SV100, SV200, SV300", "std": "ТР ТС 010/2011"},
                {"name": "Клапаны регулирующие серий SV100, SV200, SV300", "std": "ТР ТС 032/2013"},
                {"name": "Арматура промышленная трубопроводная", "std": "ТР ТС 010/2011"},
                {"name": "Конденсатоотводчики", "std": "ТР ТС 010/2011"},
                {"name": "Арматура промышленная трубопроводная", "std": "ТР ТС 032/2013"},
            ],
        },
        {
            "title": "Сертификаты соответствия",
            "items": [
                {"name": "Расходомеры-счетчики вихревые FLSTV", "std": "ТР ТС 012/2011"},
                {"name": "Клапаны регулирующие серий SV100, SV200, SV300", "std": "ТР ТС 032/2013"},
                {"name": "Клапаны регулирующие серий SV100, SV200, SV300", "std": "ТР ТС 012/2011"},
                {"name": "Арматура промышленная трубопроводная", "std": "ТР ТС 032/2013"},
                {"name": "Затворы дисковые, задвижки", "std": "ТР ТС 012/2011"},
                {"name": "Клапаны (вентили), клапаны обратные", "std": "ТР ТС 012/2011"},
                {"name": "Краны шаровые, краны пробковые", "std": "ТР ТС 012/2011"},
                {"name": "Регуляторы давления", "std": "ТР ТС 012/2011"},
                {"name": "Конденсатоотводчики", "std": "ТР ТС 012/2011"},
            ],
        },
        {
            "title": "Сертификаты на тип продукции",
            "items": [
                {"name": "Клапаны регулирующие", "std": "ТР ТС 010/2011"},
                {"name": "Задвижки", "std": "ТР ТС 010/2011"},
                {"name": "Клапаны обратные", "std": "ТР ТС 010/2011"},
                {"name": "Клапаны (вентили)", "std": "ТР ТС 010/2011"},
                {"name": "Краны шаровые", "std": "ТР ТС 010/2011"},
                {"name": "Затворы дисковые", "std": "ТР ТС 010/2011"},
                {"name": "Регуляторы давления", "std": "ТР ТС 010/2011"},
                {"name": "Краны пробковые", "std": "ТР ТС 010/2011"},
                {"name": "Конденсатоотводчики", "std": "ТР ТС 010/2011"},
            ],
        },
        {
            "title": "Сертификаты РусХлорСерт",
            "items": [{"name": "Клапаны регулирующие", "std": ""}],
        },
        {
            "title": "Свидетельства об утверждении типа СИ",
            "items": [{"name": "Расходомеры-счетчики вихревые FLSTV", "std": ""}],
        },
    ],
}

out_path = os.path.join(OUT, "data", "catalog.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(catalog, f, ensure_ascii=False, indent=2)
print("Wrote", out_path)
