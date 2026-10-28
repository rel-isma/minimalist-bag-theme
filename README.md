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

The repository includes the existing product data, original/branded images, research, Studio drafts, uploads and recovery journals. No separate product archive is required after cloning.

```sh
npm run build
npm start
```

Open **http://127.0.0.1:4310**. Refresh connections before making store changes. Credentials and authentication tokens are excluded: fill `.env` locally and reconnect. Expired quotes/plans need a fresh review; resume a pending native CJ listing instead of submitting a duplicate. Starting the server does not automatically publish products.

## Repository contents

- `assets`, `config`, `layout`, `locales`, `sections`, `snippets`, `templates`: Shopify theme.
- `studio/`: React source, server, integrations, tests, existing drafts/uploads and recovery records.
- `products/`: supplier records, prepared content, original/branded product images, research, workflow scripts and launch reports.
- `.env.example`: blank credential setup template. Real `.env`, authentication tokens, dependencies, local tool files, builds and duplicate backup archives are excluded.

Keep this repository restricted to people you authorize to access the store's product and operational records. The private archive in `backups/` remains an optional local backup; it is not needed to restore the catalog from GitHub.

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
