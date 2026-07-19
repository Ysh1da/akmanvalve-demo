#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Extract background images and build structured catalog from scraped pages."""

import json
import os
import re
import hashlib
import time
import urllib.request
from urllib.parse import urlparse

OUT = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(OUT, "assets", "images")
DATA_DIR = os.path.join(OUT, "data")
os.makedirs(IMG_DIR, exist_ok=True)

PAGES = [
    "/goods", "/cami", "/soacv", "/icp", "/fms", "/rms", "/lgs",
    "/fmsv", "/allcv", "/icptn", "/icppdc", "/icptipwa", "/icpisp", "/icprip",
    "/icptnpr",
]


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", "replace")


def img_name(url):
    h = hashlib.md5(url.encode()).hexdigest()[:12]
    ext = os.path.splitext(urlparse(url).path)[1].lower() or ".jpg"
    if ext not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
        ext = ".jpg"
    return f"{h}{ext}"


def download(url):
    if "selstorage" not in url and "site786435" not in url:
        return None
    name = img_name(url)
    dest = os.path.join(IMG_DIR, name)
    if os.path.exists(dest) and os.path.getsize(dest) > 100:
        return f"assets/images/{name}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as r:
            data = r.read()
        with open(dest, "wb") as f:
            f.write(data)
        print("saved", name, len(data))
        return f"assets/images/{name}"
    except Exception as e:
        print("fail", url, e)
        return None


def extract_urls(html):
    urls = set()
    for m in re.findall(r"https?://[^\s\"'<>)\\]+", html):
        if "selstorage.ru" in m and any(m.lower().endswith(e) for e in (".png", ".jpg", ".jpeg", ".webp", ".gif")):
            urls.add(m.rstrip(".,;)"))
        # also without extension in path but with image id pattern
        if "selstorage.ru" in m and "/site786435/" in m:
            urls.add(m.rstrip(".,;)"))
    return urls


def main():
    all_urls = set()
    for path in PAGES:
        url = "https://akmanvalve.ru" + path
        print("scan", url)
        try:
            html = fetch(url)
            found = extract_urls(html)
            print(" ", len(found), "urls")
            all_urls |= found
        except Exception as e:
            print(" err", e)
        time.sleep(0.2)

    mapping = {}
    for u in sorted(all_urls):
        local = download(u)
        if local:
            mapping[u] = local

    with open(os.path.join(DATA_DIR, "extra_images.json"), "w", encoding="utf-8") as f:
        json.dump(mapping, f, ensure_ascii=False, indent=2)
    print("extra images:", len(mapping))


if __name__ == "__main__":
    main()
