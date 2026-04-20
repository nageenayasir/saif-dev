# Tribe Organics — Shopify Theme Security & Performance Report

**Prepared for:** Tribe Organics  
**Prepared by:** [Your Agency Name]  
**Date:** April 20, 2026  
**Project:** Theme Security Audit, Malware Removal & Performance Optimisation  

---

## 1. Executive Summary

During our technical audit of the live Shopify theme on tribe-organics.com, we discovered that the theme had been infected with **three separate layers of malware**. These infections were designed to:

1. **Execute arbitrary remote code** on every visitor's browser via a third-party server
2. **Intercept and manipulate page scripts** through obfuscated JavaScript
3. **Fake Google PageSpeed scores** — the site appeared fast in audits but was slow for real customers

We have removed all malware, applied safe performance improvements, and delivered a clean version of the theme that reflects the genuine state of the site's performance. This report covers everything we found, everything we did, and what we recommend doing next.

---

## 2. The Original Theme

The live theme is a customised version of Shopify's **Dawn v6.0.2**, built by a previous development agency (DGF). It is a feature-complete theme with:

- Custom brand fonts: Brice (headings), HypatiaSansPro (body), SuperiorTitle (display)
- Brand colours: dark green (#06211E), cream (#FAEEE9), dusty rose (#F3D9CF), gold (#AC853B)
- Subscription product integration (Recharge / Skio / Bold compatible)
- AJAX cart drawer with upsell support
- Swiper image gallery on product pages
- Sticky mobile add-to-cart button
- Lazy-loading performance system

The theme design and functionality are solid. The problem was entirely in the malware that had been injected into it.

---

## 3. Malware Found and Removed

### 3.1 Speedien — Remote Code Executor

**File:** `snippets/spdn.liquid`  
**Severity:** Critical

This snippet was loaded on every single page of the store. It created a hidden background process (Web Worker) that connected to an external server:

```
https://api.speedien.com/optimize/65feca921a6998193da7b31f27355e0c
```

Whatever JavaScript that server returned was immediately injected into the page and executed. The shop owner had no visibility or control over what code was being delivered — it could change at any time without touching any theme files. This is a full remote code execution vulnerability on every visitor's browser.

**What we did:** Removed the Speedien snippet entirely.

---

### 3.2 Fake Bootstrap — Obfuscated Malware Script

**Files:** `assets/bootstrap-26.0.88.js` + `snippets/dgf-bootstrap-26.0.88.liquid`  
**Severity:** Critical

A file named `bootstrap-26.0.88.js` was being loaded on every page. It was designed to look like the legitimate Bootstrap CSS framework — but Bootstrap does not have a version 26. The file's entire contents were a single obfuscated `eval()` call, a standard technique for hiding malicious code from inspection.

**What we did:** Deleted the file and removed the loader snippet.

---

### 3.3 Score Cloaking — Fake Core Web Vitals

**Files:** `assets/headAsyncLoad.js` + inline code in `layout/theme.liquid`  
**Severity:** Critical (deceptive)

This was the most sophisticated layer. Its purpose was to **make the site appear fast in Google PageSpeed Insights while remaining slow for real customers**.

Here is how it worked:

- When Google runs a speed audit, it uses a Linux-based server. The malware detected this by checking the visitor's platform string.
- If it detected Linux (Google's auditing server), it **disabled all JavaScript on the page**. A site with no JavaScript runs almost instantly — producing near-perfect speed scores.
- Real customers on Mac, Windows, iPhone, and Android were unaffected — they received the full, slow page.

There were two layers of this cloaking: one in a separate JS file (`headAsyncLoad.js`) and a backup version embedded directly inside the main theme layout file.

**What we did:** Deleted `headAsyncLoad.js`, removed the inline cloaking code from `layout/theme.liquid`, and removed the script tags that loaded both files.

---

### 3.4 Infected Backup Files

**Files:** `layout/theme_20260103.liquid`, `layout/theme_20251230.liquid`  
**Severity:** Medium

Two backup layout files were present in the theme. The January 2026 backup still contained active script tags loading the malware files. Although these backups were not the active layout, they posed a risk if accidentally activated.

**What we did:** Deleted both backup files.

---

## 4. Performance Fixes Applied

### 4.1 Deprecated Image Filter — 434 Updates Across 129 Files

Shopify deprecated the `img_url` filter in their Liquid templating engine. The replacement is `image_url`. Using deprecated APIs generates admin warnings and risks breaking on future Shopify platform updates.

We updated every instance across the theme — 434 replacements in 129 files — mapping each old size pattern to the correct modern equivalent.

### 4.2 Development Debug Code Removed

All `console.log` debug statements were removed from the custom JavaScript files. These were left over from development and had no purpose in production.

---

## 5. What We Did Not Change

We took a careful, conservative approach. The following were audited and confirmed legitimate — no changes were made:

- **Subscription integration** (Recharge/Skio/Bold) — all kept intact
- **Lazy loading system** (`custom-1.0.21.js`, `spdn2.liquid`) — legitimate performance feature, kept
- **All Globo Filter app files** — third-party app, untouched
- **Cart drawer, product page, all section/snippet logic** — design preserved exactly

The goal was to deliver the same theme the client recognises, with the malware removed and nothing else changed.

---

## 6. Complete Change Log

| Change | Details |
|---|---|
| Deleted: `bootstrap-26.0.88.js` | Fake Bootstrap, eval/packed malware |
| Deleted: `headAsyncLoad.js` | Lighthouse cloaking script |
| Deleted: `theme_20251230.liquid` | Stale backup layout |
| Deleted: `theme_20260103.liquid` | Backup layout with active malware tags |
| Emptied: `snippets/spdn.liquid` | Speedien remote code executor |
| Emptied: `snippets/dgf-bootstrap-26.0.88.liquid` | Loader for fake Bootstrap |
| Removed from `layout/theme.liquid` | Script tags for both malware files |
| Removed from `layout/theme.liquid` | Inline Lighthouse cloaking observer |
| Updated: 129 files | 434 deprecated `img_url` → `image_url` |
| Updated: dgf JS files | Removed all `console.log` statements |

---

## 7. Current State of the Theme

The clean theme is in our repository, ready to upload to Shopify for testing. It is identical to the live theme in design and functionality, with the malware removed and the deprecated API calls updated.

**It has not been published to the live store.** The correct process is:

1. Upload as an unpublished theme in Shopify Admin
2. Preview and test all pages
3. Run PageSpeed Insights on the preview URL
4. Publish once testing is confirmed

---

## 8. Important Note on PageSpeed Scores

When the clean theme is tested in PageSpeed Insights, **scores will be lower than what was shown previously.** This is expected and correct.

The previous scores were fabricated by the cloaking malware. They did not reflect the real experience of your customers. The new scores will reflect reality — and they give us an accurate starting point for genuine performance improvements.

With the malware gone, we can now make real optimisations that benefit real users.

---

## 9. Known Issues — Technical Debt

These issues were identified during the audit. They are not malware — they are development decisions from the original agency that create performance and maintenance challenges.

### 9.1 Inline CSS — 539KB Per Page Load

A very large volume of CSS is rendered inline on every page. Inline CSS cannot be cached by the browser, meaning it is downloaded again on every page visit. Extracting this to external files would significantly improve repeat-visit load times.

### 9.2 Duplicate JavaScript Libraries

The Swiper slider library is loaded more than once. The Slick Slider library is also present but fully replaced by Swiper. These are dead weight on every page.

### 9.3 Images Without Dimensions

593 images across the theme have no `width` or `height` attributes set. This causes **Cumulative Layout Shift (CLS)** — content visibly jumping around as images load. CLS is a Google Core Web Vitals metric and directly affects search ranking.

### 9.4 Images Without Alt Text

432 images have no `alt` attribute. This is an accessibility violation (WCAG non-compliance) and reduces SEO effectiveness.

### 9.5 jQuery Dependency

The theme loads jQuery, a 30KB+ legacy library. All of its functionality can be handled by modern JavaScript built into current browsers. Removing jQuery would reduce page weight and improve parse time.

---

## 10. Recommended Phased Plan

### Phase 1 — Test the Clean Theme (Immediate)

- Upload clean theme to Shopify as unpublished
- Test all pages on desktop and mobile
- Run PageSpeed Insights on the preview URL
- Confirm no functionality regression

**Timeline:** 1–2 days

---

### Phase 2 — Medium-Risk Performance Fixes

Once Phase 1 is confirmed, apply targeted fixes:

- Add `width`/`height` to all 593 images (fixes CLS, improves CWV)
- Remove duplicate Swiper instances
- Remove Slick Slider library
- Add missing alt text to 432 images

**Timeline:** 3–5 days  
**Expected improvement:** CLS score, Accessibility score, page weight reduction

---

### Phase 3 — New Theme Build (Figma Design)

Build a fresh theme on the latest Dawn v15.4.1 base, implementing the approved Figma design:

- Modern Shopify APIs throughout (no deprecated filters)
- CSS in external files from the start (browser-cacheable)
- Images with correct dimensions built in
- No jQuery — modern JavaScript only
- All subscription/cart functionality carried over
- Performance-first architecture

**Timeline:** 4–6 weeks (depending on design complexity)  
**Expected outcome:** Theme that genuinely passes Core Web Vitals, reflects the brand design, and is maintainable long-term

---

## 11. Core Web Vitals — Path to Passing

| Metric | What it measures | Current blocker | Fix |
|---|---|---|---|
| **LCP** | How fast the main content appears | Hero image not preloaded | `<link rel="preload">` for hero |
| **CLS** | How much content jumps around | 593 images missing dimensions | Phase 2 |
| **INP** | How fast the page responds to clicks | Heavy JavaScript on main thread | Phase 3 |

All three metrics are achievable. The malware removal is the prerequisite — without it, no accurate measurement was possible.

---

## 12. Questions and Next Steps

We recommend proceeding with Phase 1 testing immediately. Once you have confirmed the clean theme works correctly on preview, we can discuss the timeline for Phase 2 and Phase 3.

Please do not hesitate to reach out with any questions about this report.

---

*This report was prepared following a full technical audit of the tribe-organics.com Shopify theme. All findings are based on direct inspection of the theme source files.*
