#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Refresh product CTA blocks — dark consult-band."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PRODUCTS = ROOT / "products"

CTA = """
    <section class="consult-band product-cta">
      <div class="container consult-inner">
        <div class="consult-text">
          <span class="eyebrow">Консультация</span>
          <h2>Подберём оборудование под вашу задачу</h2>
          <p>Опишите параметры — подготовим коммерческое предложение.</p>
        </div>
        <div class="consult-actions">
          <a class="btn btn-primary" href="../contacts.html#inquiry">Оставить заявку</a>
          <a class="consult-link" href="tel:+74957903250">+7 495 790-32-50</a>
        </div>
      </div>
    </section>
"""

CTA_RE = re.compile(
    r'\s*<section class="(?:section )?consult-(?:section|band) product-cta">[\s\S]*?</section>\s*',
    re.M,
)

for path in PRODUCTS.glob("*.html"):
    text = path.read_text(encoding="utf-8")
    text = CTA_RE.sub("\n", text, count=1)
    text = text.replace("</main>", CTA + "\n  </main>")
    text = re.sub(r"styles\.css(\?v=\d+)?", "styles.css?v=12", text)
    path.write_text(text, encoding="utf-8")
    print("cta:", path.name)

p = ROOT / "products.html"
if p.exists():
    t = p.read_text(encoding="utf-8")
    t = CTA_RE.sub("\n", t, count=1)
    cta_root = CTA.replace("../contacts.html", "contacts.html")
    t = t.replace("</main>", cta_root + "\n  </main>")
    t = re.sub(r"styles\.css(\?v=\d+)?", "styles.css?v=12", t)
    p.write_text(t, encoding="utf-8")
    print("cta: products.html")

print("done")
