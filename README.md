# Atelier Veyne — theme and Catalog Studio

Shopify theme plus a local React dashboard for preparing the products already saved in CJdropshipping, preserving supplier variants/SKUs, and reviewing Shopify listing or content changes.

## Continue on another computer

Install **Node.js 22.12 or newer** and Git, then:

```sh
git clone git@github.com:rel-isma/minimalist-bag-theme.git
cd minimalist-bag-theme
npm ci
cp .env.example .env
```

Fill `.env` locally with your CJ API key and the installed Shopify app's client ID/secret. Alternatively, copy your existing `.env` privately from the previous computer. Credentials never belong in GitHub or chat. The app is intentionally restricted to `s35my0-uu.myshopify.com` and USD.

**To retain the existing drafts and branded images**, also transfer the private workspace archive from the previous computer's `backups/` directory. From the new checkout's root:

```sh
tar -xzf /path/to/atelier-private-workspace-YYYYMMDD-HHMMSS.tar.gz
npm run build
npm start
```

Open **http://127.0.0.1:4310**. In Studio, refresh connections before making store changes. Expired quotes/plans need a fresh review; resume a pending native CJ listing instead of submitting a duplicate. Starting the server does not automatically publish products.

GitHub contains the code, not your private product library. Without restoring the archive, Studio starts with an empty local catalog; use **Fetch my CJ products** to import saved products again. Fetching does not recover earlier local edits or generated images.

## What belongs where

- `assets`, `config`, `layout`, `locales`, `sections`, `snippets`, `templates`: Shopify theme.
- `studio/`: React source, local server, integrations and tests. See [Studio instructions](studio/README.md).
- `products/shopify-client.mjs` and `products/image-selection.mjs`: shared runtime helpers.
- Product folders, original/generated photos, drafts, uploads, account snapshots and job journals: private local workspace, excluded from Git.
- `.env`: private credentials, excluded from both Git and backups. `.env.example` contains blank setup fields only.
- `backups/`: private migration archives, excluded from Git and theme uploads.

To create another private transfer archive, stop Studio first and run:

```sh
npm run backup:private
```

This requires Python 3. It verifies the archive and excludes authentication tokens and credential files. Transfer the archive and `.env` privately, then keep the old computer's copy until the restored workspace is verified.

## Development and checks

```sh
npm test
npm run build
```

For UI development, run `npm start` and `npm run dev` in separate terminals. Unit tests use local fixtures and mocks; they do not publish products. `studio/test-server.mjs` is an optional HTTP integration check requiring the restored private product workspace.

## Shopify theme

Package only `assets`, `config`, `layout`, `locales`, `sections`, `snippets` and `templates` at the ZIP root. Upload it through **Online Store → Themes** as a draft. `.shopifyignore` keeps Studio, credentials, product records, backups and development files out of CLI theme uploads.

Products, collections, menus, discounts, markets and policies live in Shopify separately; uploading a theme does not recreate them. The branded theme remains a draft until explicitly published.

Current launch handoff: [final launch review](products/store-organization/FINAL-LAUNCH-REVIEW.md). Remaining supplier measurements: [confirmation requests](products/finish-launch/SUPPLIER-CONFIRMATION-NEEDED.md).
