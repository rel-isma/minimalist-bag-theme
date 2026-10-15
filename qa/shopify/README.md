# Native development-store connection and upload verification

**Import update:** The owner approved Contact reuse and the two menu updates. The native import is now complete and read-only verification passed: 22 draft products/52 variants, 56 image records, eight collections, three new hidden pages plus unchanged existing Contact, and backed-up Main/Footer updates with Privacy Choices/account navigation preserved. See [IMPORT-REPORT.md](IMPORT-REPORT.md). The connection/preflight checkpoint below is retained as history; its pending-decision/no-import statements describe that earlier checkpoint.

Date: 2026-10-15. This records actual Shopify CLI/Admin API observations, not local fixture results. Native storefront E2E and visual parity remain unexecuted.

- Store: `atelier-vane-test.myshopify.com`.
- Uploaded theme: `atelier-vane-theme`, ID `189100065059`, role **unpublished**, processing false.
- The owner uploaded the candidate ZIP through admin and supplied the editor URL. A subsequent CLI pull downloaded the native files into `/tmp/atelier-native-upload-189100065059`, without replacing workspace files or pushing anything to Shopify.
- All **93 expected native files** are present, with no extra native files. **71 are byte-identical**. Shopify added generated-file comments/formatting to 22 JSON files; 20 preserve identical JSON content, and the other two omit only empty section-block objects/order lists in `templates/index.json` and `templates/product.json`. No unexplained content difference was found. [File evidence](upload-verification.json).
- An authenticated Admin API query confirmed `shop.plan.partnerDevelopment: true` and `currencyCode: USD`.
- An anonymous storefront request redirected to `/password`, where a password form was present. [Privacy observation](privacy-check.json). This does not prove the draft password page's appearance or successful authentication.
- Product preflight found no products. Existing content includes an empty Contact page using the contact template, Shopify's Your Privacy Choices page, one starter Home page collection, and main/footer/customer-account menus. [Preflight](import-preflight.json).
- The existing importer rejects unowned matching pages and default-menu replacement unless deliberately handled. The owner was asked whether to reuse Contact, preserve privacy/account content and back up/update only main/footer menus, or to import catalog only. **No resource mutation or catalog import has occurred at this checkpoint.**

## Authentication and tooling

Theme CLI login succeeded. Separate `shopify store auth` also succeeded for product/file/content/navigation read/write scopes. Shopify manages both sessions locally; no password, token, refresh token, browser storage state or signed image-upload target is recorded here.

`seed/cli-admin.mjs` adapts the existing seeder to `shopify store execute`, avoiding manual token handling. It defaults to read-only, requires an explicit mutation option, passes query/variables in private temporary files without a shell, removes its temporary directory, propagates API/user errors and does not retry ambiguous failures. Its tests use a fake process executor; a real read-only shop query also succeeded. No credential store was read or exported into this repository.

The credential-based importer remains supported. The adapter does not by itself resolve existing Contact/menu handling or publish products/pages/collections/themes. [Local seed plan](seed-plan.json) lists the prepared resources: 22 products/52 variants, eight collections, four page definitions, two menus and 56 images. The store already has Contact, so reuse would create only three new pages.

## Work identified at the pre-import checkpoint

1. Resolve the requested existing-content handling decision before modifying those resources.
2. Import the chosen seed route once; preserve merchant/system content and store a restoration record before updating starter navigation.
3. Make test catalog resources available on the password-protected development storefront and configure native filters, shipping/test discount and Bogus Gateway as required.
4. Authenticate the test browser to the private storefront and run the actual native E2E/editor and four-width parity matrices. No full native test passes are claimed here.

Items 1–2 have since been completed as recorded in the import report. Resource publication, test configuration and native browser/editor verification in items 3–4 remain pending.

The draft theme remains unpublished. No native theme code, merchant editor settings or store privacy configuration was changed during connection verification.
