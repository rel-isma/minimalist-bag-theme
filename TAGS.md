# Atelier Vane catalog tags

Tags are lowercase ASCII words separated by hyphens. They contain no spaces or colon prefixes. Category, color, material, style, and merchandising are documentation groups, not literal prefixes in a tag.

| Group | Allowed tags | Use |
| --- | --- | --- |
| Category | `shoulder-bag`, `crossbody-bag`, `tote-bag`, `mini-bag`, `wallet`, `accessory` | Exactly one per product; powers six automated collections. |
| Color | `black`, `bone`, `cognac`, `taupe`, `olive` | One for each offered Color value. Native filtering uses the Color option, not these product-level tags. |
| Material | `material-smooth`, `material-pebbled` | Exactly one; placeholders describing the demo surface treatment, not verified material composition. |
| Style | `everyday`, `work`, `evening`, `travel` | One or more editorial groupings. |
| Merchandising | `new-arrival`, `featured` | Optional; powers New arrivals, Featured, and the future New badge. These are demo assignments, not sales-rank claims. |
| Demo | `demo` | Mandatory on every demo product; enables bulk deletion. Never use on real products. |

There are no `bestseller`, `limited`, `low-stock`, customer-count, or scarcity tags. Sale badges will derive from an actual compare-at price higher than price, not from tags. Sold-out badges will derive from Shopify availability. Demo variants have inventory tracking disabled; no fake quantity values are set.

Color option values use sentence case: **Black**, **Bone**, **Cognac**, **Taupe**, **Olive**. Tag membership reflects all offered colors, so a Black product tag does not indicate which variant is selected. Size options currently exercise **Standard/Wide** on Line tote bag and **Standard/Long** on Reach shoulder strap; these are illustrative sizes with no verified dimensions.

## Automated collection rules

Each collection has one exact tag rule. No `demo` rule is added so that real replacement products can use the same collections after the demo catalog is deleted.

| Handle | Product tag equals |
| --- | --- |
| `shoulder-bags` | `shoulder-bag` |
| `crossbody-bags` | `crossbody-bag` |
| `tote-bags` | `tote-bag` |
| `mini-and-clutch-bags` | `mini-bag` |
| `wallets-and-cardholders` | `wallet` |
| `accessories` | `accessory` |
| `new-arrivals` | `new-arrival` |
| `featured` | `featured` |

Use Shopify Search & Discovery’s native Availability, Price, Product type, and Color-option filters. A tag-chip navigation row is intentionally excluded to avoid competing URL/filter states.
