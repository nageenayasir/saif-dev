# Tribe Organics — Theme Rebuild Report

**Prepared by:** Claude Code (Anthropic)  
**Date:** April 20, 2026  
**Repository:** nageenayasir/saif-dev  
**Branch:** claude/rebuild-website-theme-dL2dU  

---

## 1. Executive Summary

The live Shopify theme on tribe-organics.com was infected with three layers of malware. The primary symptom was artificially inflated Core Web Vitals scores — the site appeared fast in Google PageSpeed Insights but was slow for real users. This report documents the original theme state, every malware file found and removed, all performance fixes applied, remaining technical debt, and a phased plan for the updated theme.

---

## 2. Original Theme — What Was Live

| Property | Value |
|---|---|
| Base theme | Shopify Dawn v6.0.2 |
| Customised by | DGF agency |
| Custom prefix | `dgf-` on all custom JS/CSS assets |
| Liquid files | 820 files total |
| Custom fonts | Brice (headings), HypatiaSansPro (body), SuperiorTitle (display) |
| Brand colours | #06211E (dark green), #FAEEE9 (cream), #F3D9CF (dusty rose), #AC853B (gold) |
| Cart | AJAX cart drawer (custom) |
| Product page | Subscription radio buttons, Swiper gallery, sticky mobile CTA |
| Subscription | Recharge / Skio / Bold compatible (selling plans API) |

The theme was well-structured and feature-complete for the client's needs. The core problem was not the design or functionality — it was three malware injections that compromised security and falsified performance scores.

---

## 3. Malware Found and Removed

### 3.1 Speedien Remote Code Executor — `snippets/spdn.liquid`

**What it did:**  
On every page load, this snippet created a Web Worker that fetched arbitrary JavaScript from an external server owned by Speedien and injected it directly into `<head>`. The URL was:

```
https://api.speedien.com/optimize/65feca921a6998193da7b31f27355e0c
```

Because the fetched code ran inside a Web Worker and was injected via `document.createElement('script')`, it could execute any code with full DOM access. The shop owner had no visibility into what code was being delivered — it could change at any time without touching the theme files.

**Action taken:** File emptied. Replaced with a comment:
```liquid
{%- comment -%}Removed: Speedien malware injection{%- endcomment -%}
```

---

### 3.2 Eval/Packed Fake Bootstrap — `assets/bootstrap-26.0.88.js`

**What it did:**  
This file was named to look like a legitimate Bootstrap library (version 26.0.88 — Bootstrap does not have a v26). The entire contents were a single `eval(function(p,a,c,k,e,r){...})` call — a standard JavaScript obfuscation technique used to hide malicious code from casual inspection. The packed payload intercepted page events.

A loader snippet, `snippets/dgf-bootstrap-26.0.88.liquid`, was included in the theme layout to load this file.

**Action taken:**
- `assets/bootstrap-26.0.88.js` — **deleted**
- `snippets/dgf-bootstrap-26.0.88.liquid` — **emptied** (replaced with comment)

---

### 3.3 Lighthouse Cloaking — `assets/headAsyncLoad.js` + inline MutationObserver

**What it did:**  
This was the most sophisticated attack layer. Its sole purpose was to make the site appear fast in Google PageSpeed Insights while being slow for real users.

**Layer A — `assets/headAsyncLoad.js`:**  
Obfuscated JavaScript that checked `navigator.platform`. When it detected the string `"Linux"` (which is what Lighthouse/PageSpeed Insights sends during audits from Google's servers), it disabled all JavaScript on the page. A site with no JavaScript executes instantly, producing perfect Core Web Vitals scores. Real users on Mac/Windows/iOS/Android were unaffected — they received the full (slow) page.

**Layer B — Inline MutationObserver in `layout/theme.liquid`:**  
A second cloaking mechanism embedded directly in the main theme layout. It watched for any `<script>` tag being added to the DOM and intercepted them during Lighthouse audits. This acted as a backup in case Layer A was removed.

```javascript
const observer = new MutationObserver(e => {
  e.forEach(({ addedNodes: e }) => {
    e.forEach(e => {
      1 === e.nodeType && "SCRIPT" === e.tagName && ...
    })
  })
})
```

**Action taken:**
- `assets/headAsyncLoad.js` — **deleted**
- Inline MutationObserver block in `layout/theme.liquid` — **removed**
- `<script src="{{ 'headAsyncLoad.js' | asset_url }}" defer></script>` — **removed** from theme.liquid
- `<script src="{{ 'bootstrap-26.0.88.js' | asset_url }}"></script>` — **removed** from theme.liquid

---

### 3.4 Backup Layout Files with Active Malware

Two unreferenced backup layout files were found:

- `layout/theme_20251230.liquid` — stale backup, no active malware but dead code
- `layout/theme_20260103.liquid` — contained active `<script>` tags pointing to the malware files

**Action taken:** Both files **deleted**.

---

## 4. Performance Fixes Applied

### 4.1 Deprecated `img_url` Filter — 434 Replacements

**Problem:**  
Shopify deprecated the `img_url` Liquid filter. The replacement is `image_url: width: N`. Using deprecated filters generates warnings in the Shopify admin and may be removed in future platform versions.

**Scale:** 434 instances across 129 files.

**Mapping applied:**

| Old pattern | New pattern |
|---|---|
| `img_url: 'master'` | `image_url: width: 2000` |
| `img_url: '1200x630'` | `image_url: width: 1200` |
| `img_url: '1200x400'` | `image_url: width: 1200` |
| `img_url: '1024x1024'` | `image_url: width: 1024` |
| `img_url: '800x800'` | `image_url: width: 800` |
| `img_url: '800x400'` | `image_url: width: 800` |
| `img_url: '767x'` | `image_url: width: 767` |
| `img_url: '400x400'` | `image_url: width: 400` |
| `img_url: '360x'` | `image_url: width: 360` |
| `img_url: '300x'` | `image_url: width: 300` |
| `img_url: '200x'` | `image_url: width: 200` |
| `img_url: '120x'` | `image_url: width: 120` |
| `img_url: '100x'` | `image_url: width: 100` |
| `img_url: '80x'` | `image_url: width: 80` |
| `img_url: '64x'` | `image_url: width: 64` |
| `img_url: '60x'` | `image_url: width: 60` |
| `img_url: '56x'` | `image_url: width: 56` |
| `img_url: '48x'` | `image_url: width: 48` |
| `img_url: '40x'` | `image_url: width: 40` |
| `img_url: 'large'` | `image_url: width: 800` |

**Files excluded from replacement:** Globo Filter snippets — these use a dynamic `image_size` variable set at runtime and cannot use a fixed width.

---

### 4.2 Debug Console Logs Removed

All `console.log` statements were removed from custom DGF JavaScript files:

- `assets/dgf-footer.js`
- All `assets/dgf_*.js` files

These statements were left over from development. In production they pollute the browser console and marginally slow JS parsing.

---

## 5. Files Left Intact (Intentionally)

These files were examined and confirmed to be legitimate:

| File | Reason kept |
|---|---|
| `snippets/spdn2.liquid` | Legitimate lazy-load activation (fires deferred scripts on user interaction, not external fetch) |
| `assets/custom-1.0.21.js` | Clean performance optimisation — deferred script activation system |
| `snippets/dgf-universal-observer.liquid` | Clean MutationObserver for performance — watches for DOM changes to activate lazy components, no external calls |
| All Globo Filter snippets | Third-party app files, dynamic image sizing |
| All Recharge/Skio/Bold snippets | Subscription app integrations, legitimate |

---

## 6. Summary of All Changes

| Category | Action | Count |
|---|---|---|
| Malware files deleted | bootstrap-26.0.88.js, headAsyncLoad.js | 2 |
| Malware snippets emptied | spdn.liquid, dgf-bootstrap-26.0.88.liquid | 2 |
| Backup layouts deleted | theme_20251230.liquid, theme_20260103.liquid | 2 |
| Malware script tags removed | From layout/theme.liquid | 2 |
| Inline observer removed | From layout/theme.liquid | 1 block |
| img_url replacements | Across 129 files | 434 |
| console.log removals | dgf-footer.js, dgf_*.js | multiple |

---

## 7. Known Technical Debt (Not Fixed Yet)

These issues were identified but not fixed in this phase. They are medium-to-high risk changes that require testing before applying.

### 7.1 Inline CSS — 539KB on Every Page Load

A large volume of CSS is rendered inline via Liquid. This cannot be cached by the browser — it is re-sent on every page load. Extracting this to external `.css` files and loading them with a cache header would significantly reduce repeat-visit load time.

**Risk level:** Medium — requires careful extraction and regression testing.

### 7.2 Duplicate JavaScript Libraries

The theme loads Swiper (slider library) multiple times from different locations. It also loads Slick Slider, which is fully replaced by Swiper. These duplicates add dead weight to every page.

**Risk level:** Medium — removing requires auditing all call sites.

### 7.3 Images Missing Width and Height Attributes

593 `<img>` tags across the theme have no `width` or `height` attributes. Without these, the browser cannot reserve space for images before they load, causing Cumulative Layout Shift (CLS) — a Core Web Vitals metric. CLS directly affects Google Search ranking.

**Risk level:** Low-Medium — adding attributes is safe but time-consuming at scale.

### 7.4 Images Missing Alt Text

432 `<img>` tags have no `alt` attribute. This is an accessibility violation and hurts SEO.

**Risk level:** Low — purely additive change.

### 7.5 Cross-Store CDN References

Some asset URLs reference a different Shopify store's CDN (hardcoded URLs from the original development store). These will 404 if the original store's CDN URLs change.

**Risk level:** Low — affects only specific assets.

### 7.6 jQuery Dependency

The theme loads jQuery, which is a 30KB+ dependency used by legacy DGF scripts. Modern JavaScript (ES6+) can replace all jQuery usage, eliminating this download.

**Risk level:** High — requires rewriting all jQuery-dependent code.

---

## 8. Phased Plan — What to Do Next

### Phase 1 — Test the Clean Theme (Now)

1. Download the ZIP from the repository (branch: `claude/rebuild-website-theme-dL2dU`)
2. In Shopify Admin → Online Store → Themes → Upload theme
3. Do NOT publish — preview only
4. Test these pages:
   - Homepage
   - All collection pages
   - Product page (with subscription options)
   - Cart drawer
   - Checkout
5. Test on mobile (real device, not just browser DevTools)
6. Run Google PageSpeed Insights on the preview URL — scores should now reflect reality

**Expected outcome:** Scores will be lower than before (the cloaking is gone) but they will be real scores. The site should still pass Core Web Vitals with the malware removed.

---

### Phase 2 — Medium-Risk Fixes (After Phase 1 Confirmed)

Apply these fixes once the clean theme is confirmed working:

1. Add `width` and `height` to all 593 images (fixes CLS)
2. Remove duplicate Swiper instances
3. Remove Slick Slider library
4. Fix cross-store CDN references
5. Add missing alt text to 432 images

---

### Phase 3 — Figma Design Implementation (New Version)

Once the clean theme is confirmed and tested:

1. Start fresh on Dawn v15.4.1 (current latest — was v6.0.2)
2. Implement the Figma design provided by the client
3. Carry over only the legitimate custom DGF functionality (subscription radios, lazy loading, cart drawer)
4. Use modern Shopify APIs throughout (no deprecated filters)
5. Inline CSS → external files from the start
6. Images with dimensions from the start

This phase produces the final production theme.

---

## 9. Core Web Vitals — Honest Expectations

With the malware removed, PageSpeed will show real scores. Here is what affects each metric:

| Metric | Current issue | Fix |
|---|---|---|
| **LCP** (Largest Contentful Paint) | Hero image not preloaded | Add `<link rel="preload">` for hero image |
| **CLS** (Cumulative Layout Shift) | 593 images missing width/height | Add dimensions (Phase 2) |
| **INP** (Interaction to Next Paint) | Heavy JS on main thread | Defer non-critical scripts (Phase 3) |
| **TTFB** (Time to First Byte) | Server-side — Shopify handles this | No action needed |

The site can pass Core Web Vitals. The malware removal is the prerequisite — without it, no real measurement was possible.

---

## 10. Repository Information

| Item | Value |
|---|---|
| Repository | nageenayasir/saif-dev |
| Branch | claude/rebuild-website-theme-dL2dU |
| Pull Request | PR #1 |
| ZIP download | https://github.com/nageenayasir/saif-dev/archive/refs/heads/claude/rebuild-website-theme-dL2dU.zip |

---

*End of report.*
