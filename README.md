# TEDUstore

A standalone TED University merchandise concept, hosted at [radiotedu.com/tedustore/](https://radiotedu.com/tedustore/).

**This is an example store. All products, prices, fulfillment options, checkout receipts and payouts are illustrative. No payment is taken and no real order is created.**

## The experience

- Six original generated mockups: hoodie, university tee, canvas tote, cap, mug and a RadioTEDU collaboration tee.
- Editorial product photography, TEDU navy and collegiate typography, with RadioTEDU red in the collaboration.
- Responsive English/Turkish storefront; category filters, sorting, search and saved items.
- Product details and size selection; cart quantities, removal, browser persistence and the demo code `TEDU10`.
- Simulated pickup/shipping, sample contact details, a fixed display card, acknowledgement and demo receipt.
- Merchant payout preview: gross amount, illustrative fee, net payout and an explicit **Not transferred** status.
- Keyboard accessible dialogs, Escape and close buttons, visible focus, reduced motion and small-screen scrolling.

## Run locally

Node.js 20 or newer. The website has no runtime dependencies.

```bash
npm install
npm start
```

Open `http://127.0.0.1:4176`. Serve the site over HTTP; ES modules are not intended to run from `file://`.

```bash
npm run check
npm run build
```

The build copies the static website into `dist/`. It does not compile or modify the RadioTEDU website.

## Review

```bash
npx playwright install chromium
npm run review
npm run quality
```

The review exercises desktop/mobile layouts, filters, search, sizes, saved products, discounts, persistence, form errors, receipt, payout, dialog layering and the Turkish interface. Screenshots and the structured result are written to `review/`.

Optional environment variables:

- `TEDUSTORE_CHROMIUM`: path to an existing Chromium executable.
- `TEDUSTORE_REVIEW_URL`: review a hosted deployment instead of starting the local server, for example `https://radiotedu.com/tedustore/`.

Review uses Chromium with responsive viewports. It is not a claim of testing every physical device or browser. See [the delivery review](docs/DELIVERY-REVIEW.md).

## Project structure

```text
public/               Static website and optimized web assets
  catalog.js          Bilingual products and demo prices
  i18n.js             English/Turkish interface copy
  app.js              Browser-only store state and interaction
  styles.css          Responsive design and motion
  web.config          IIS settings restricted to this subtree
assets/originals/     Full-resolution generated merchandise images
scripts/              Local server, build, review and new-only deployment
docs/                 Research, provenance, image briefs and review evidence
DESIGN.md             Design direction and purpose of visual choices
```

The original repository README is preserved in `docs/original-repository-readme.md`.

## Payment and data boundaries

There is **no backend, database, account system, email service, analytics, payment SDK or banking connection**. The UI never asks for a card number, expiry or security code. It displays a fixed demonstration card ending in 4242.

Contact fields are kept in page memory and cleared when checkout closes or finishes. Prefer **Use demo details**. Cart product IDs, validated sizes/quantities, saved IDs, language and coupon status use the namespaced browser key `tedustore-concept-v1`. A demo receipt stays in page memory and can be cleared. No checkout data is submitted.

The payout fee assumption of **2.9% + ₺4.95** is an arithmetic example, not a provider quote. The preview cannot transfer funds.

On IIS, the child CSP blocks network connections (`connect-src 'none'`) and form submissions (`form-action 'none'`). Assets and JavaScript are self-hosted.

## Isolated deployment

The production path is **only** `C:\inetpub\wwwroot\tedustore`.

```bash
npm run build
node scripts/deploy-new.mjs --new-only
```

This Windows deployment helper refuses to overwrite an existing directory. It backs up the parent IIS config, records hashes of protected existing files, copies the static build to the new subtree, compares the protected hashes and performs read-only main-site/ERP/Bilet HTTP checks. Local backups and receipts are excluded from Git.

It does not edit parent IIS rules, WordPress, ERP, Bilet, any other project or any database. The child config clears inherited WordPress rewrite rules within `/tedustore` only. Future releases need a separately reviewed, backed-up update procedure rather than overriding this safety check.

## Research and assets

The direction was informed by ODTÜDEN, The Harvard Shop, Stanford and Oxford Saïd stores. See [research and source links](docs/RESEARCH.md), [image generation briefs](docs/imagegen-prompts.md) and [asset provenance](docs/asset-provenance.json).

The TED University and RadioTEDU logos remain genuine supplied brand assets. Merchandise pictures are generated concept mockups; they are not manufacturing specifications or actual catalogue stock. TEDUstore's typographic wordmark is a concept treatment.

Albert Sans is distributed under the [SIL Open Font License 1.1](public/assets/fonts/OFL.txt). Georgia uses the visitor's installed system font. University and RadioTEDU trademarks remain with their respective owners. No blanket license for the project or branded assets is asserted.
