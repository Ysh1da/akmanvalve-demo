#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Crawl akmanvalve.ru: extract pages, download images locally."""

import json
import os
import re
import hashlib
import time
import urllib.request
import urllib.error
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

BASE = "https://akmanvalve.ru"
OUT = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(OUT, "assets", "images")
DATA_DIR = os.path.join(OUT, "data")
os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

SEED = [
    "/",
    "/company",
    "/goods",
    "/documents",
    "/contacts",
    "/cami",
    "/soacv",
    "/icp",
    "/fms",
    "/rms",
    "/lgs",
    "/fmsv",
    "/allcv",
    "/cv2w",
    "/cva",
    "/cv3w",
    "/somvgl",
    "/somvprv",
    "/somvba",
    "/somvbf",
    "/somvga",
    "/somvch",
    "/icptn",
    "/icppdc",
    "/icptipwa",
    "/icpisp",
    "/icprip",
    "/flstvfk60",
    "/flstvfk60b",
    "/flstvfk62",
]

SKIP_EXT = (".css", ".js", ".svg", ".woff", ".woff2", ".ico")
SKIP_HOST = ("yandex", "google", "mc.", "tb.ru", "selcdn.net/tb/")


class LinkExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.images = []
        self.title = ""
        self._in_title = False
        self.texts = []
        self._capture = False
        self._skip_tags = {"script", "style", "noscript"}
        self._skip_depth = 0
        self.meta = {}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in self._skip_tags:
            self._skip_depth += 1
            return
        if tag == "title":
            self._in_title = True
        if tag == "a" and "href" in attrs:
            self.links.append(attrs["href"])
        if tag == "img" and "src" in attrs:
            self.images.append({"src": attrs["src"], "alt": attrs.get("alt", "")})
        if tag == "meta":
            name = attrs.get("name") or attrs.get("property") or ""
            if name and "content" in attrs:
                self.meta[name] = attrs["content"]

    def handle_endtag(self, tag):
        if tag in self._skip_tags and self._skip_depth:
            self._skip_depth -= 1
        if tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._skip_depth:
            return
        if self._in_title:
            self.title += data
        t = data.strip()
        if t:
            self.texts.append(t)


def fetch(url, retries=3):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=30) as r:
                return r.read()
        except Exception as e:
            print(f"  retry {i+1} {url}: {e}")
            time.sleep(1 + i)
    return None


def normalize_link(href, base=BASE):
    if not href or href.startswith(("#", "mailto:", "tel:", "javascript:")):
        return None
    full = urljoin(base, href)
    p = urlparse(full)
    if "akmanvalve.ru" not in p.netloc:
        return None
    path = p.path.rstrip("/") or "/"
    return path


def img_filename(url):
    h = hashlib.md5(url.encode()).hexdigest()[:12]
    path = urlparse(url).path
    ext = os.path.splitext(path)[1].lower() or ".jpg"
    if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
        ext = ".jpg"
    return f"{h}{ext}"


def download_image(url):
    if any(s in url for s in SKIP_HOST):
        return None
    if url.endswith(".svg"):
        return None
    name = img_filename(url)
    dest = os.path.join(IMG_DIR, name)
    if os.path.exists(dest) and os.path.getsize(dest) > 100:
        return f"assets/images/{name}"
    data = fetch(url)
    if not data or len(data) < 100:
        return None
    with open(dest, "wb") as f:
        f.write(data)
    print(f"  img saved: {name} ({len(data)} bytes)")
    return f"assets/images/{name}"


def clean_text(texts):
    skip = {
        "О компании",
        "Продукты",
        "Документы",
        "Контакты",
        "Средства измерений",
        "Арматура трубопроводная",
        "ВКУ",
    }
    footer_re = re.compile(r"©\s*2017")
    out = []
    for t in texts:
        if footer_re.search(t):
            continue
        if t in skip and len(out) == 0:
            continue
        out.append(t)
    # drop leading nav duplicates
    while out and out[0] in skip:
        out.pop(0)
    return out


def crawl():
    queue = list(SEED)
    seen = set()
    pages = {}
    all_images = {}

    while queue:
        path = queue.pop(0)
        if path in seen:
            continue
        seen.add(path)
        url = BASE + (path if path != "/" else "/")
        print(f"Fetching {url}")
        raw = fetch(url)
        if not raw:
            print(f"  FAILED {url}")
            continue
        try:
            html = raw.decode("utf-8", errors="replace")
        except Exception:
            continue

        parser = LinkExtractor()
        try:
            parser.feed(html)
        except Exception as e:
            print(f"  parse err: {e}")

        local_imgs = []
        for im in parser.images:
            src = urljoin(url, im["src"])
            if any(s in src for s in SKIP_HOST):
                continue
            local = download_image(src)
            if local:
                local_imgs.append({"src": local, "alt": im["alt"], "orig": src})
                all_images[src] = local

        for href in parser.links:
            n = normalize_link(href, url)
            if n and n not in seen:
                # skip file downloads that aren't pages
                if any(n.lower().endswith(e) for e in (".pdf", ".doc", ".docx", ".xls", ".xlsx", ".zip")):
                    continue
                queue.append(n)

        texts = clean_text(parser.texts)
        pages[path] = {
            "path": path,
            "url": url,
            "title": parser.title.strip(),
            "texts": texts,
            "images": local_imgs,
            "links": [normalize_link(h, url) for h in parser.links if normalize_link(h, url)],
        }
        time.sleep(0.3)

    with open(os.path.join(DATA_DIR, "pages.json"), "w", encoding="utf-8") as f:
        json.dump(pages, f, ensure_ascii=False, indent=2)
    with open(os.path.join(DATA_DIR, "images.json"), "w", encoding="utf-8") as f:
        json.dump(all_images, f, ensure_ascii=False, indent=2)
    print(f"\nDone: {len(pages)} pages, {len(all_images)} images")
    return pages


if __name__ == "__main__":
    crawl()
