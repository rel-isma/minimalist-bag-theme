# Catalog Studio

Local React product preparation for Atelier Veyne. See the [root setup and migration instructions](../README.md) before moving computers.

## Run

Use Node.js 22.12 or newer. Copy `.env.example` to `.env`, add credentials locally, then run:

```sh
npm ci
npm run build
npm start
```

Open http://127.0.0.1:4310. For UI development, run `npm run dev` in another terminal while the backend is running. The server binds to the local computer; do not expose it publicly.

## Workflow

1. The cloned repository contains the existing product workspace; fetch newly saved CJ account products as needed. Refresh connections to read current Shopify listings and native CJ links.
2. Edit title, description, theme material/dimensions/care fields, images, variant prices, color swatches and SEO. Preserve original CJ IDs, SKUs and variant references. Use one to eight gallery/variant photos and leave unknown specifications empty.
3. Approve content, check shipping for every intended destination, and review supplier cost separately from customer checkout charges. Country preferences do not automatically configure Shopify markets or order-routing rules.
4. Review the frozen listing/update/connection plan, then confirm the external change. New listings use CJ's native listing API so fulfillment links can be verified. Content updates preserve the existing Shopify product and variant identities.
5. Follow Activity. Resume a pending listing after a partial failure; do not submit another listing while its outcome is uncertain. Refresh connections to verify native links and CJ inventory-management status.

CJ connections, inventory management, Shopify markets and checkout rates are separate checks. Studio configures Shopify tracking and the verified CJ location but does not invent stock. CJ-managed synchronization can continue while your computer is off once CJ confirms management. New listings may become Active through CJ; the review discloses this. Studio does not publish Shopify themes.

## Shipping

Add destination countries and check all variants for each destination. Only supplier methods returned for every variant are selectable. Quotes expire; changed warehouse/variant settings invalidate them. A saved supplier country choice is a local preparation preference, not a live routing rule.

Checkout rate edits use a 15-minute, single-use review plan and fresh profile fingerprint. They require an explicit shared-profile acknowledgment and readback verification. Existing province coverage is preserved. Complex shared-country, conditional or carrier-calculated rates must be edited in Shopify admin.

The app requires installed Shopify permissions appropriate to each operation: product/file/publication writes, theme reads, inventory/location access, and `read_shipping`, `write_shipping`, `read_markets` for the shipping workspace. Add/release scopes and approve app updates in Shopify; chat approval cannot grant scopes. Credentials remain server-side in the ignored root `.env`.

## Files and recovery

- `products/<id>/source/`: original supplier records and product images.
- `products/<id>/prepared/`: earlier prepared content and branded image candidates.
- `studio/.state/drafts/`: editable local product drafts.
- `studio/.state/uploads/`: your replacement images.
- `studio/.state/plans/` and `jobs/`: frozen reviewed plans and job history.
- `studio/.state/snapshot.json`: last live account check; use Refresh for current data.
- `studio/.state/published-media/`: media ID/hash mapping for reuse on subsequent edits.

Product records, drafts, uploads and recovery state are included in Git so cloning restores the workspace. Credentials and authentication tokens remain excluded. Restrict repository access to authorized collaborators. The theme ZIP contains only theme files.

The local server has no automatic publishing on startup. Interrupted jobs are marked for manual verification. Partial writes are recorded, not automatically rolled back; refresh and inspect before retrying. Existing native listings can be resumed by listing record without creating another product. Shopify file hosting and gallery detachment can leave unused files in Shopify Files after a failure; they are not automatically deleted.

The theme uses merchant-owned `custom.material`, `custom.dimensions`, `custom.care`, `custom.cj_product_id` and `custom.color_swatches`. The app reuses matching definitions and creates missing ones before writing values. This namespace intentionally remains shared with the existing theme and merchant tools.

## Checks

```sh
npm test
npm run build
```

These use local mocks/fixtures and do not publish products. The optional `node studio/test-server.mjs` additionally checks HTTP access protection and draft persistence using the restored private catalog. Browser screenshots, account-specific scripts and historical result files are retained with the workspace; some optional browser scripts require the original local QA tools.

The theme shares merchant-owned `custom.material`, `custom.dimensions`, `custom.care`, `custom.cj_product_id` and `custom.color_swatches`. Product editing, pricing and shipping changes require a fresh review; transferring files does not grant approval to replay old operations.
