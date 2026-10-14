#!/usr/bin/env python3
"""Build a portable, local catalog review document from the seed manifests."""
import html
import json
from pathlib import Path

root = Path(__file__).parent
catalog = json.loads((root / 'catalog.json').read_text())
collections = json.loads((root / 'collections.json').read_text())
esc = html.escape
cards = []
for product in catalog['products']:
    pictures = ''.join(f'<a href="images/{esc(image["file"])}"><img src="images/{esc(image["file"])}" alt="{esc(image["alt"])}" width="1120" height="1400" loading="lazy"></a>' for image in product['images'])
    colors = ', '.join(product['options'][0]['values'])
    variants = ''.join(f'<tr><td>{esc(variant["color"])}{(" / " + esc(variant["size"])) if variant["size"] else ""}</td><td>{esc(variant["sku"])}</td><td>{variant["weightGrams"]} g</td></tr>' for variant in product['variants'])
    price = product['variants'][0]['price']
    comparison = product['variants'][0]['compareAtPrice']
    compare = f' <s class="text-muted">${comparison}</s> (demo comparison)' if comparison else ''
    cards.append(f'''<article class="review-card-local" data-category="{product['categoryTag']}">
      <div class="photo-pair">{pictures}</div>
      <p class="eyebrow">{esc(product['productType'])}</p><h2>{esc(product['title'])}</h2>
      <p>${price}{compare}</p><p class="text-muted">{esc(colors)} · {len(product['variants'])} variants</p>
      <details><summary>Read demo copy and variant details</summary><p>{esc(product['description'])}</p>
      <p class="text-muted">Tags: {esc(', '.join(product['tags']))}</p>
      <div class="table-wrap"><table><caption>Illustrative variants; weights require verification</caption><thead><tr><th>Variant</th><th>SKU</th><th>Demo weight</th></tr></thead><tbody>{variants}</tbody></table></div></details>
    </article>''')
options = ''.join(f'<option value="{c["ruleSet"]["rules"][0]["condition"]}">{esc(c["title"])}</option>' for c in collections[:6])
document = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Atelier Vane — Demo catalog review</title>
<link rel="stylesheet" href="../assets/base.css"><style>
body { overflow-x: visible; } main { padding-block: var(--space-7); }
header { margin-bottom: var(--space-6); } header p { max-width: var(--prose-max); margin-block: var(--space-3); }
h1 { font-size: var(--font-h2); } .review-controls { margin-bottom: var(--space-6); max-width: 30rem; }
.review-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: var(--space-6); }
.review-card-local { min-width: 0; border-bottom: var(--border-hairline); padding-bottom: var(--space-5); }
.photo-pair { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: var(--space-2); margin-bottom: var(--space-4); }
.photo-pair img { width:100%; aspect-ratio:4/5; object-fit:cover; } .photo-pair a { display:block; }
.review-card-local h2 { font-size:var(--font-h3); margin-block:var(--space-2); }
details { margin-top:var(--space-3); } summary { cursor:pointer; min-height:44px; display:flex; align-items:center; text-decoration:underline; text-underline-offset:3px; }
details p { margin-top:var(--space-3); } .table-wrap { overflow-x:auto; margin-top:var(--space-3); }
table { width:100%; border-collapse:collapse; font-size:var(--font-label); } th,td { text-align:left; padding:var(--space-2); border-bottom:var(--border-hairline); } caption { text-align:left; }
[hidden] { display:none !important; } footer { margin-top:var(--space-7); }
@media(max-width:749px) { .review-grid { grid-template-columns:minmax(0,1fr); } main { padding-block:var(--space-5); } }
</style></head><body><a class="skip-to-content" href="#ReviewMain">Skip to catalog</a><main class="container" id="ReviewMain"><header>
<p class="eyebrow">Atelier Vane · Stage (a) review</p><h1>A considered collection.</h1>
<p>22 demo products across six categories. These AI images show each product’s first listed color. All product details, materials, weights, sizes, and prices are illustrative and must be replaced before sale.</p>
<p class="text-muted">This is a local review document. The Shopify storefront layouts will be updated in subsequent stages.</p></header>
<div class="review-controls"><label class="form-label" for="CategoryReview">Review a category</label><select class="form-input" id="CategoryReview"><option value="">All categories</option>''' + options + '''</select><p id="ReviewCount" role="status" aria-live="polite">22 products shown</p></div><div class="review-grid">''' + '\n'.join(cards) + '''</div><footer><a class="btn btn--secondary" href="README.md">Seed setup guide</a></footer></main>
<script>document.getElementById('CategoryReview').addEventListener('change', function () { var count = 0; document.querySelectorAll('[data-category]').forEach(function (card) { card.hidden = Boolean(this.value && card.dataset.category !== this.value); if (!card.hidden) count++; }, this); document.getElementById('ReviewCount').textContent = count + ' products shown'; });</script></body></html>'''
(root / 'catalog-preview.html').write_text(document)
print('Built seed/catalog-preview.html.')
