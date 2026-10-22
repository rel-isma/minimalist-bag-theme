# Atelier Veyne Shopify theme

This repository contains the Shopify theme only.

## Theme folders

- `assets/`: storefront styles, JavaScript and bundled images.
- `config/`: theme settings and their current values.
- `layout/`: storefront layouts.
- `locales/`: theme translations.
- `sections/`: editable storefront sections.
- `snippets/`: shared Liquid components.
- `templates/`: page templates.

## Install

Create a ZIP containing these theme folders at its root. In Shopify Admin, open **Online Store → Themes → Import → Upload ZIP file**. Upload as a draft, preview it, and use the theme editor to customize its settings and sections before publishing.

Products, collections, navigation, discounts and store policies are managed in Shopify separately; they are not created by uploading the theme. Connect collection/product pickers and menus in the theme editor. The pairing offer needs a matching Shopify discount rule; theme copy alone does not create a discount.

Some bundled editorial images are placeholders. Replace them and review product details, offers and policies for the real catalog before launch. Product details use the `custom.material`, `custom.dimensions` and `custom.care` metafields.

The Product Studio, local preview server, demo import tools, QA reports and Node dependencies have been removed. There is no `npm start` command in this theme-only repository.
