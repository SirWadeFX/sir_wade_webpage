# Sir Wade — Kajabi pages

Source for the sirwade.com pages built in Kajabi. Each page's CSS and JS are
built into two files in its own `dist/` and served free over **jsDelivr**
straight from this repo; the HTML lives in **one Kajabi custom code block per
section**.

Nothing here is a site generator. Kajabi renders the page — this repo just
supplies the stylesheet, the behaviour and the markup you paste in.

| Page | Folder | Status |
| --- | --- | --- |
| Home | `pages/home/` | Built (Homepage_V2 — same header and footer as the other pages) |
| Class Library | `pages/class-library/` | Built |
| Class Info | `pages/class-info/` | Built (Animation in Unreal Engine) |
| Mentorship | `pages/mentorship/` | Built |
| Mentorship One-Shots | `pages/mentorship-one-shots/` | Built (placeholder: "more information coming soon") |

Every page ships in **compact mode** by default (content capped at 1440px
and centred; see "Page size: compact by default").

### Shared sections: keep them identical on every page

The **header**, **footer** and **Stay in the loop** sections must be the
same on every page. Each page has its own copy of the block (Kajabi needs
one per page), but the copies are identical and the styling is shared, so
a change to one is a change to all:

| Section | Block on each page | Shared CSS | Notes |
| --- | --- | --- | --- |
| Header | `01-header.html` | `shared/css/10-nav.css`, `15-header.css`, `js/10-nav-menu.js` | Class Info adds its "< Back to Class Library" bar under the identical nav |
| Footer | the last block (`05`/`08`/`09`/`10-footer.html`) | `shared/css/90-footer.css`, `95-footer.css` | Mentorship and One-Shots size it with `96-footer.css` (same look, their mockups' measurements) |
| Stay in the loop | `*-stay-in-the-loop.html` (Home, Class Library, One-Shots) | `shared/css/80-newsletter.css`, `85-loop.css` | Mentorship and Class Info don't have the section |

When you change one of these blocks, copy the change into every page's
copy in the same commit, then re-paste that block on every Kajabi page.
Page-specific CSS must not restyle them — put any change in the shared
files. A quick check that the copies still match:

```bash
for f in pages/*/blocks/*-footer.html pages/*/blocks/*stay-in-the-loop.html; do
  printf '%s  %s\n' "$(perl -0pe 's/<!--.*?-->//gs; s/^\s+|\s+$//g' "$f" | shasum | cut -c1-8)" "$f"
done
```

Matching hashes mean matching markup (comments are ignored, so each copy's
header comment can name its own page).

---

## How the pieces fit

```
Kajabi page (e.g. Class Library; Class Info is the same shape)
├── Settings → Custom Code → Custom CSS .... pages/class-library/blocks/00-head.css
│     ├── @import Google Fonts + our CSS   ← lands in the real <head>
│     ├── @font-face "SW PalmerLakePrint" (font-display: block)
│     └── optional :root token overrides
│
├── "Head" Custom Code block (first) ........ pages/class-library/blocks/00-head.html
│     ├── preload for the heading font
│     ├── window.SW_ASSETS  ← your Kajabi media URLs
│     ├── optional :root token overrides
│     └── <link>/<script> → cdn.jsdelivr.net/gh/brian-d-v/sir_wade_webpage@TAG/pages/class-library/dist/*
│
└── Section blocks (one Kajabi Custom Code block each)
      01-header · 02-subheader · 03-all-classes · 04-stay-in-the-loop · 05-footer

Class Info's section blocks
      01-header · 02-subheader · 03-class-overview · 04-syllabus ·
      05-guest-speakers · 06-pricing · 07-student-works · 08-faq · 09-footer

Site-wide (Kajabi site head, not this repo)
      @font-face "PalmerLakePrint" — the brand heading font, see "Fonts"
```

Each section block is **markup only**. Styling and behaviour come from that
page's two CDN files, so a design change is a commit here, not a round of
copy-pastes in Kajabi.

Every page has its own bundle, so these go **on each page**, never in a
site-wide setting — that would load one page's bundle everywhere.

**Why two head pieces.** Kajabi's landing-page builder has no raw head-code
field. A Custom Code block named "Head" still renders in the page *body*, so
a stylesheet loaded only from there arrives after the page starts drawing
and Kajabi's own styling flashes first. The page's **Custom CSS** field is
the one thing Kajabi puts in the real `<head>`, so `00-head.css` `@import`s
the stylesheet from there. The block still carries `SW_ASSETS`, the script
and the font preload; its `<link>` is then a cached no-op. (The home page
predates this and has only the block.)

---

## Repo layout

```
shared/
  css/        tokens, base, nav, dark mockup header, review marquee,
              newsletter, footer — in every page's bundle
  js/         asset resolver + default media URLs, review marquee — in every
              page's bundle
pages/
  <page>/
    blocks/   the snippets you paste into Kajabi (00-head.html first;
              catalog and class-info also have 00-head.css for the
              Custom CSS field)
    src/css/  page-only stylesheets
    src/js/   page-only scripts
    dist/     GENERATED sirwade.css + sirwade.js — what jsDelivr serves
    preview.html          GENERATED — the whole page assembled locally
    preview-<name>.html   GENERATED — one per entry in preview-variants.json (preview-full.html)
    preview-variants.json optional — extra CSS for variant previews
assets/       media served from the repo: renders (robot.webp, home/rift.webp,
              home/cafe.webp), the catalog banner, and placeholders cut from
              mockups (class-info/, mentor-*, class-techanim, home/portrait)
build.mjs     builds every page
legacy/       the previous single-block homepage, plus saved copies of the
              old Kajabi class listings (classPage1–3) the card images came from
.local-fonts/ GIT-IGNORED — licensed fonts for local previews only (see "Fonts")
```

Never edit `dist/` or `preview*.html` by hand.

### CSS file order

Each page's bundle is `shared/css/*` and `pages/<page>/src/css/*` **merged
and sorted by filename**, so the numeric prefix sets cascade order across
both:

```
shared      00-tokens 01-base 10-nav 15-header 30-catalog 50-reviews 80-newsletter 85-loop 90-footer 95-footer
home        05-home-base           20-banner 31-home-classes 40-home-mentor 55-testimonials 60-bio
catalog                            20-banner
class-info              16-ci-header 18-ci-base 20-ci-hero 30-ci-overview 40-ci-syllabus
                        50-ci-speakers 60-ci-pricing 70-ci-works 80-ci-faq
mentorship  05-mentor-base           20-hero 30-who 35-why 40-how 55-testimonials
                        60-works 70-faq 75-signup ················ 96-footer
one-shots                                  20-os-banner 30-os-soon ········· 96-footer
```

A file can restyle an earlier one by sorting after it — `15-header.css`
sizes the dark nav (`.sw-nav.is-dark`) that the catalog, Class Info and
Mentorship share, `95-footer.css` lays out the slim footer (any footer
without a link row) they share, and `85-loop.css` restyles the newsletter
as "Stay in the loop" wherever it carries `sw-loop` (Home, Class Library,
Mentorship and Mentorship One-Shots). All five pages use the dark header
and the slim footer. Mentorship's `96-footer.css` then resizes the footer
to its mockup (One-Shots carries a copy: its mockup's footer is identical).

`30-catalog.css` (the class cards) is shared because Class Library and Home
both use it; its rules only match `.sw-catalog`.

`50-reviews.css` / `js/20-reviews.js` (the review marquee) are shared because
home and Mentorship both use them; their rules only match `.sw-reviews`, so
pages without one carry the bytes but render exactly as before.
Two files with the same name (shared or not) fail the build, since their
order would be ambiguous. JS follows the same rule.

The build also fails if a CSS comment closes early. A `*/` inside a comment
(for instance a path like `pages/*/blocks`) ends it, and the browser then
silently drops the next rule — that once wiped out every design token.

### Adding a page

1. `mkdir -p pages/<name>/{blocks,src/css,src/js}`
2. Copy an existing page's `blocks/00-head.html` and `00-head.css` and change
   their CDN paths to `pages/<name>/dist/`. Keep the compact
   `--sw-page-max: 1440px;` line.
3. Copy the shared blocks unchanged from another page — `01-header.html`,
   the footer and (if the page has one) Stay in the loop — then add the
   page's own section blocks and CSS/JS, and `node build.mjs`. Also copy
   `preview-variants.json` for the full-width preview.

Anything a second page needs too belongs in `shared/`.

---

## Working on it

```bash
node build.mjs                          # rebuild every page's dist/ and preview.html
node build.mjs class-library            # or just one
open pages/class-library/preview.html   # see the page with local (uncommitted) files
```

Each `preview.html` rewrites the CDN `<link>`/`<script>` to its local `dist/`, so
what you see is your working tree, not what's live. Open them through VS Code's
Live Preview (or any local server) at `/pages/<page>/preview.html`.

A preview is the page's own markup and CSS only. It doesn't have Kajabi's
wrappers, theme CSS or the site-wide head, so check wrapper spacing and
fonts on Kajabi itself.

No dependencies, no `node_modules`, no bundler — jsDelivr serves the committed
`dist/` files directly, so the build has to stay inspectable.

**Always run `node build.mjs` and commit `dist/` before pushing.** jsDelivr
serves what's in the repo; unbuilt source changes are invisible to the live
site.

---

## Fonts

| Face | Used for | Loaded from |
| --- | --- | --- |
| **PalmerLakePrint** | Catalog headings, card titles, Log in | The Kajabi **site-wide head** (`@font-face`), not this repo |
| Lexend | Body text, nav and forms on every page | Google Fonts. The mockups' "Lexend Deca" is the same font — Google serves it as "Lexend", with identical metrics |
| Fredoka | Class Info overview card titles | Google Fonts |
| League Spartan | Class Info prices | Google Fonts |
| Poppins | Banner titles (Home, Class Library, Mentorship), home mentorship card titles, "ANIMATION" under the logo | Google Fonts |
| Permanent Marker | Base display face only — every visible heading now overrides it with PalmerLakePrint | Google Fonts |
| Kalam (scaled) | Fallback for PalmerLakePrint only | Google Fonts, as "SW Print Fallback" |

**Sizes are set for PalmerLakePrint.** The mockup measures exactly in it.
It's drawn small in its box — capitals are ~0.44em, where Kalam's are
~0.75em — so its font sizes look large in CSS, and it needs
`line-height: 0.62` to sit where the mockup puts it. The Kalam fallback is
pre-scaled (`size-adjust: 61.6%`) to the same capital height.
`font-size-adjust` can't do this: PalmerLakePrint's file declares a cap
height of 0.700 rather than what it draws, so it shrinks the real font too.

**No flash on load.** The site's own `@font-face` uses `font-display: swap`,
which paints catalog headings in a fallback for ~0.7s and then jumps.
`00-head.css` declares the same file again as **"SW PalmerLakePrint"** with
`font-display: block`, which the font stack tries first, and `00-head.html`
preloads it. Headings stay hidden for that moment instead of changing shape.
It's one download either way. The URL must stay page-relative
(`/resource_redirect/…`): Kajabi serves the file without CORS headers, so it
only loads same-origin — which is also why the shared stylesheet can't
declare it.

**Why it isn't in this repo.** It's a commercial font ("© 2020 Jen Wagner
Co. All rights reserved"). The repo is public and jsDelivr serves every
file in it, so committing it would publish it. Serving it from here would
be faster (≈0.04s cached vs ≈0.6s through Kajabi's redirect, which also
can't be cached) — **only do it if the licence covers web self-hosting.**

**Previewing with the real font.** A local preview can't load it from Kajabi
(no CORS), so put a copy at:

```
.local-fonts/PalmerLakePrint-Regular.ttf
```

`node build.mjs` then loads it in every `preview*.html`. The folder is
git-ignored and must stay that way. The file is the
`/resource_redirect/…/PalmerLakePrint-Regular.ttf` one from the site head.
Without it, previews fall back to the scaled Kalam — close, but Kajabi is
the reference.


---

## Page size: compact by default

Every page sizes itself in one unit, `--sw-u` (see `shared/css/00-tokens.css`):
1 unit = 1/100 of the page width, so each page keeps its mockup's
proportions. `--sw-page-max` caps that width. **Compact is the default**:
`--sw-page-max: 1440px` is the token's default and is written out,
uncommented, in every page's `00-head.html` and `00-head.css`. On screens
wider than 1440px the content stops growing and centres; section
backgrounds, banners and waves still run edge to edge, and the banner
renders stay behind the copy (they anchor to the centred column).

| Token (in a page's head snippet) | Effect |
| --- | --- |
| `--sw-page-max: 1440px` | **Default.** Compact: content caps at 1440px and centres |
| `--sw-page-max: 100000px` | Full width — the mockups' exact 2566px scale on any screen |
| `--sw-scale: 0.9` | Everything 10% smaller (either mode) |

To change a page's mode, edit that line in **both** head pieces (the
`00-head.html` block and the `00-head.css` field) and keep them in step.
No release is needed — it's a Kajabi edit.

The cap only shows on a viewport **wider** than it: at 1440px or less the
two modes look identical. To compare, zoom out (Cmd −) or use a wide
monitor.

Locally, `preview.html` is the compact page (it uses the head snippet) and
`node build.mjs` also writes `preview-full.html` with the cap lifted.
Variants live in `pages/<page>/preview-variants.json` as `{"name": "css"}`
and are injected after the head snippet. (Before v1.11.2 the default was
full width and the preview variant was `preview-compact.html`.)

---

## Mentorship page

Built from `Mentorship Page_V2.png` at its native 2566px width, the same way
as the catalog: every size is a measured mockup pixel in `--sw-u` units, so
`--sw-page-max` / `--sw-scale` scale it like every other page.

| Block | Section | Notes |
| --- | --- | --- |
| `00-head.html` + `00-head.css` | head | as for the catalog |
| `01-header` | header | the shared dark header, same size and nav as Class Library and Class Info (Classes dropdown, Mentorship, Tutorials). The mockup's bar is 23px taller — treated as a design mistake |
| `02-personal-mentorship` | hero | `mentorship.hero` |
| `03-who-you-are` | Whether you're a… | `mentorship.icon*` line drawings |
| `04-why-join` | Why join? | cards with amber label tabs |
| `05-how-it-works` | How it works | cards + arrows in mockup coordinates; stacked below 860px; `mentorship.howBg` |
| `06-testimonials` | Testimonials | the home review marquee, re-sized; initials avatars |
| `07-student-works` | Student works | empty slots render as the mockup's outline boxes |
| `08-faq` | FAQ | native `<details>`, no script |
| `09-ready-to-sign-up` | Ready to sign up | `mentorship.signupBg`, `links.mentorshipSignup` |
| `10-footer` | footer | the catalog footer at this mockup's size |

**Images.** The banner is RobotImage.jpg (`assets/robot.webp`, shared with
the home page). `mentor-how-bg.webp` and `mentor-signup-bg.webp` were cut
out of the PNG with the cards and button filled in by a blur fill, and
the three icons are the mockup's drawings as white PNGs. Replace any of
them via `SW_ASSETS.mentorship`.

In `pages/mentorship/src/css/`, a mockup size of N px is written
`calc(N/25.66 * var(--sw-u))` (e.g. 212px → `calc(8.262 * var(--sw-u))`),
mostly with a `max()` floor for phones; key px values are in comments.

---

## Mentorship One-Shots page

Built from `Mentorship OneShots_PLACEHOLDER.png` (2566px wide) the same
way as Mentorship, and written in the same `calc(N/25.66 * var(--sw-u))`
form. Rendered at 2566px it lands within 1px of the mockup, apart from
the header (below) and the Stay in the loop headline, which sits 6px high
here as it does on Class Library.

| Block | Section | Notes |
| --- | --- | --- |
| `00-head.html` + `00-head.css` | head | as for the catalog |
| `01-header` | header | Mentorship's header block, unchanged. The mockup's bar is 24px taller — the same difference Mentorship treats as a design mistake |
| `02-banner` | Mentorship One-Shots | `oneShots.hero` |
| `03-coming-soon` | More information coming soon | black band; carries the wave into the cream band, traced from the mockup |
| `04-stay-in-the-loop` | Stay in the loop | the Class Library section, unchanged (identical in both mockups) |
| `05-footer` | footer | Mentorship's footer size |

The wave runs flat for its last 37px: the shared Stay in the loop section
starts at the wave's bottom, and that keeps its card where this mockup puts
it. The banner is `assets/one-shots-cafe.webp` (rtx5090_cafe_frame.png),
placed and faded as measured off the mockup.

---

## Assets: keeping Kajabi media swappable

No media URL is hardcoded in the markup. Elements carry a dotted key that
resolves through `shared/js/00-assets.js`:

```html
<img  data-sw-src="catalog.basics">
<div  data-sw-bg="…">
<a    data-sw-href="links.signup">
<a    data-sw-yt="tutorials.t1"><img></a>
```

Resolution order: **`window.SW_ASSETS` → shipped defaults → leave as-is.**

So to point the home banner at another image in your Kajabi library, you edit the Kajabi head
snippet — not this repo, and no CDN purge:

```js
window.SW_ASSETS = {
  home: { rift: "https://kajabi-cdn.../banner.jpg" },
};
```

Three conveniences worth knowing:

- **Format-agnostic.** If a key resolves to `.mp4`/`.webm`/`.mov`, an `<img>`
  is swapped for a muted autoplaying `<video>` in place. Point the same key at
  a `.jpg` later and it swaps back. One key, any format.
- **`data-sw-yt`** takes a bare YouTube id, any YouTube URL, or a plain image
  URL, and fills in both the thumbnail and the watch link from that one value.
- **Partial overrides.** `SW_ASSETS` deep-merges, so setting one key inside
  `classes` leaves the other three alone.

`window.SWAssets.apply()` re-resolves the page if you inject markup yourself.

Because the resolver runs after the page loads, images appear a beat
(~75ms) after the first paint. Putting the default URL in the markup's `src`
as well would remove that, at the cost of keeping two copies in sync.

The catalog's keys live under `catalog.*` (banner + one per card) and
`links.*`. Class Info's live under `classInfo.*` (hero, backgrounds, the
nine overview images, speaker portraits, student works) and
`links.catalog` / `links.classInfo.*` (Back to Class Library, sign-ups).

Class Info's and Mentorship's defaults are served from this repo's
`assets/` at the `REPO` tag in `shared/js/00-assets.js` (`@v1.11.0`). A preview loads them
from the working tree instead (build.mjs sets `window.SW_REPO_BASE`), so
unreleased images still show locally. Card images were matched against the product images in
`legacy/classPage1–3.html`; cards with no match use `ESSENTIALS_IMG`.

### Theme tokens

Every colour and font is a CSS custom property on
`:root` (see `shared/css/00-tokens.css`). They can be overridden from the same
Kajabi head snippet, which makes "try a different green" a 10-second edit with
no deploy:

```css
:root { --sw-green: #2f6a4c; }
```

The defaults are declared with `:where(:root)`, which has no specificity, so
a plain `:root` override wins wherever it sits on the page. Before v1.7.5
they used `:root`, and because Kajabi puts the head snippet's `<style>`
*before* our stylesheet's `<link>`, the stylesheet came later and silently
beat every override.

---

## Hosting on jsDelivr

jsDelivr serves any public GitHub repo for free, no account or config:

```
https://cdn.jsdelivr.net/gh/brian-d-v/sir_wade_webpage@TAG/pages/home/dist/sirwade.css
```

**This repo must stay public.** jsDelivr cannot read private repos — flipping
it back to private takes the live site's CSS and JS down with it.

### Which `@TAG` to use

| Ref | Cache | Use for |
| --- | --- | --- |
| `@main` | up to 12h | Development. Convenient, but edits take hours to show |
| `@v1.2.3` | permanent | **Production.** A tag is immutable, so it's cached hard and can never change under you |

Every page's head snippet (and each `00-head.css`) is pinned to
**`@v1.11.2`** (the `REPO` image base stays at `@v1.11.1`, which holds
every image). `v1.11.0` rebuilt the home page; `v1.11.1` kept the banner
renders under the copy when the page is capped and gave One-Shots its real
render; `v1.11.2` makes compact the default. (`v1.9.0` added Mentorship and renamed the catalog to Class
Library; `v1.9.1` gave Mentorship the shared header height; `v1.10.0` added
Mentorship One-Shots.) **Push that tag before pasting them**, or their CSS and JS
404. `v1.7.0` is broken (a comment swallowed the design tokens) and
`v1.7.1` is the first working `pages/` release. Pages still running an old
snippet keep working: tags are immutable.

**The catalog was renamed to Class Library in v1.9.0.** Its files moved from
`pages/class-catalog/` to `pages/class-library/`, so its CDN path changed
too. A Kajabi page still pasted with `@v1.7.6/pages/class-catalog/…` keeps
loading that old version; re-paste both head pieces to move it to the new
path. (Its CSS classes and asset keys — `.sw-catalog…`, `catalog.*`,
`links.catalog` — kept their names, so the section blocks don't change.)

Floating refs like `@main` and `@latest` are cached for 12 hours. During a
build-out that lag is maddening; pin a tag once the page is live.

### Releasing a new version

First bump the version in the files you'll paste — every
`pages/*/blocks/00-head.html` (two URLs each) and every
`pages/*/blocks/00-head.css` (one each) — and the `REPO` base in
`shared/js/00-assets.js` if the release adds or changes images under it.
Then:

```bash
node build.mjs
git add -A && git commit -m "Tweak banner" && git push && git tag v1.11.3 && git push origin v1.11.3
```

Paste that as **one line**: if a terminal wraps it, `git push origin` can
run without the tag name ("Everything up-to-date") and the tag never
reaches GitHub. Check with `git ls-remote --tags origin`.

Then re-paste the head pieces into each Kajabi page (`@v1.11.2` → `@v1.11.3`).
The old version keeps serving until you do, so the live page never breaks
mid-release.

**A new tag can 404 for a minute.** jsDelivr needs a moment to index it,
and if anything requested the URL before the tag existed it may cache that
404. If it persists, purge that one URL (below, with the tag in place of
`@main`).

If a release touches `assets/`, check the tag-pinned URLs in
`shared/js/00-assets.js`: the catalog banner (`@v1.7.1`) points at the
release that added it; every other repo image goes through the single
`REPO` base in that file, pinned to the next release. A *changed* file needs its URL bumped to the new tag, and
`REPO` must name a tag that contains every image under it.

### Forcing an update on `@main`

If you're on a floating ref and need the change now, purge it:

```
https://purge.jsdelivr.net/gh/brian-d-v/sir_wade_webpage@main/pages/home/dist/sirwade.css
```

Hit that URL in a browser. Purging is rate-limited, which is the other reason
to pin tags in production.

---

## Pasting into Kajabi

1. **Head CSS** — the page editor's **Settings → Custom Code → Custom
   CSS**: replace the placeholder with `pages/<page>/blocks/00-head.css`.
   Leave Custom JavaScript empty.
2. **Head block** — a Custom Code block at the very top of the page,
   holding `pages/<page>/blocks/00-head.html` as-is. Its CDN URLs are
   already pinned to `brian-d-v/sir_wade_webpage@v1.11.2`.
3. **Sections** — add one Custom Code block per file, in numeric order, pasting
   the whole file each time. The header, footer and Stay in the loop blocks
   are the shared ones (see "Shared sections") — paste the same versions on
   every page.
4. Setting each section to **Full Width** with **0 padding** is still worth
   doing, but the stylesheet no longer depends on it — it strips the
   wrappers' side padding and max-width itself.
5. Hide Kajabi's native header and footer on every page and use ours, so
   all pages share the same header and footer.

To check a paste took: view the page source. The `<style>` near the top
should contain the two `@import url(…)` lines, and the head block's `<link>`
should name the tag you expect.

### Gaps around the blocks

Kajabi wraps every custom code block in a centred, padded container, which
shows up as a margin around each full-width band. The two axes are handled
very differently, and the asymmetry is deliberate:

- **Sideways — remove the constraint, don't escape it.** The same `:has()`
  rule drops the wrappers' side padding and `max-width`, so the block fills
  them naturally at `width: 100%`.

  Two earlier versions tried to *escape* the container instead — first with
  `margin-inline: calc(50% - 50vw)`, then with JS measuring the real offset.
  Both shifted blocks off the left edge, because both had to work out where
  the container sat, and Kajabi's wrappers differ between the editor, the
  theme preview and the live page.

  Removing the constraint needs no such guess. It is also strictly safer:
  a negative margin can move a block off-screen, whereas dropping a padding
  can only ever make something wider. Worst case here is an element keeping
  an inset it didn't need.

  `legacy/homepage-v1.html` is the proof — it reaches the edges with no CSS
  tricks whatsoever. The constraint was always the thing to remove.

- **Vertically — a `:has()` rule** zeroes padding on the four wrapper levels
  above each block. It selects on *what the wrapper contains*, since those
  wrappers are Kajabi's and their class names vary by theme. Four levels
  because Kajabi nests roughly `section > container > content > block`, and
  the padding lives on the outermost one.

  This one stays in CSS because it only ever *removes* spacing. It can't
  mis-position anything, so the failure mode that killed the horizontal
  version doesn't apply.

So a freshly pasted block should sit flush without any editor work. If a gap
survives:

1. **Bands not reaching the edges** — the section isn't set to Full Width.
   Editor → section settings → Width → Full.
2. **A gap above the first band** — the head block renders nothing, but
   Kajabi still wraps it in a full section with a full section's padding:
   ~230px of blank space. The stylesheet collapses those wrappers via the
   `sw-head-marker` element at the top of the snippet, so this only shows
   if that element was deleted, or the block landed in a section of its own
   that the reset can't reach.
3. **Leftover space between bands** — zero the section's top/bottom padding
   in the editor. If a theme won't let you, set `--sw-bleed-y: -40px` in the
   head snippet's `:root` block as a last resort.

`sw-keep-wrapper` on a block root opts its ancestors out of the vertical
reset. `sw-contained` and `sw-bleed` still parse but do nothing — they're
kept so blocks pasted against older versions keep working.

### Before going live

- [ ] Wire the Stay in the loop form (Home, Class Library and Mentorship
      share it — see the comment in `pages/class-library/blocks/04-stay-in-the-loop.html`).
      As shipped it does nothing on submit, deliberately — so it can't swallow
      signups before it's connected.
- [ ] Class Library: `catalog.banner` defaults to `assets/catalog-banner.webp`,
      rebuilt from two product stills (see `20-banner.css`). Its robot half
      is a different frame than the mockup's; swap in the real banner render
      if there is one. Seven cards still use the Maya Animation Essentials
      image as a stand-in.
- [ ] Class Library: point the card links at their pages. Only `links.basics`
      and `links.maya` are real; the other eight fall back to the store.
- [ ] Class Library: replace the intro line under "All available classes".
      It's the home page's copy standing in for the mockup's lorem ipsum.
- [ ] Class Library: confirm the Animation in Blender description. The
      mockup's was a copy of the Unreal one; the current line is a guess.
- [ ] Class Library: publish the Kajabi page at `/class-library-page-2` —
      the Class Info "< Back to Class Library" button links there.
- [ ] Home: replace the placeholder copy the mockup left as lorem ipsum —
      the Classes and Mentorship intros reuse the old home page's lines,
      Testimonials says "Hear from past students." — and give the two
      mentorship cards their own paragraphs (both carry the Mentorship
      page's intro, as in the mockup).
- [ ] Home: `home.portrait` is the bio photo cut from the mockup (716px);
      swap in the original photo when there is one.
- [ ] Publish `/mentorship-page` and `/class-library-page-2` — the nav's
      Mentorship and Classes links and the home buttons point there, and
      both return 404 until they're live.
- [ ] Confirm the **PalmerLakePrint licence** (Jen Wagner Co.) covers web
      use — it's served on the live site today. See "Fonts".
- [ ] Class Info: replace the placeholders cut from the mockup — the hero
      (`classInfo.hero`, already darkened at its left edge), the nine
      overview images, and the syllabus and FAQ backgrounds (painted-out,
      blurry where the panels and boxes sit).
- [ ] Class Info: fill in the syllabus panels, guest speakers (names, bios,
      `classInfo.speakers.*`), student works (`classInfo.works.*` + names),
      FAQ answers ("Answer coming soon.") and the Classes dropdown panel.
- [ ] Class Info: point `links.classInfo.*` at real checkouts. The
      "< Back to Class Library" button (`links.catalog`) goes to
      `/class-library-page-2` — publish the Class Library page at that URL.
- [ ] Mentorship: write the four FAQ answers (they read "Answer coming
      soon."), fill How it works steps 3 and 4, and add Student Works
      content (`mentorship.works.w1`–`w4`, titles, subtitle).
- [ ] Mentorship: point `links.mentorshipSignup` at the real sign-up /
      calendar page (it falls back to the store), and fill the header's
      Classes dropdown panel (shared with Class Info).
- [ ] Mentorship: swap the three mockup-lifted images for real renders if
      there are any.
- [ ] Mentorship One-Shots: replace "More information coming soon." with
      the program details when they exist.

---

## Notes on a few techniques

**Class Info is measured the same way** off `Class Info Page_V2.png`,
one table per stylesheet. Section by section, the rendered page sits
within 3px of the mockup at 2566px (heading, text and card positions).
Where the mockup is inconsistent (heading sizes vary 7.2–8u between
sections, pricing cards aren't evenly spaced) the per-section values
follow it, except the pricing gaps, which are evened out.
The syllabus panels open on the green toggle; the mockup shows them open,
the page loads closed.

**Catalog sizes are measured, not eyeballed.** Each catalog stylesheet opens
with a table of measurements taken off `Class Library Page_V2.png` at its
native 2566px width, converted to page units (1 unit = 25.66px there, see
`--sw-u`). Card text uses container units (`cqi`) instead, so it scales with
the card rather than the screen in the 2- and 1-column layouts. When the
mockup changes, re-measure at 2566px and update both the table and the
values.

**The catalog banner** (`assets/catalog-banner.webp`) is rebuilt from two
product stills, template-matched against the mockup. The placements and
the crossfade are recorded in `20-banner.css`. It ships undarkened; the
CSS adds the measured 58.6% scrim.

**Scoping.** Separate Kajabi blocks can't share one `#id` wrapper, so every
block root carries `.sw-scope` and all CSS is anchored to it. Kajabi's theme
can't bleed in; ours can't bleed out.

**Banner fades are measured, not eyeballed.** The home and Mentorship
banners show raw renders (`home.rift`, `mentorship.hero`) under a CSS black
gradient whose stops come from fitting the mockup against the render column
by column. Any render at the same key gets the same fade.

**Wave dividers** are inline SVG on the *upper* section, filled with the colour
of the section below. The colour is set inline in the block, so the fill and
the next band can never drift apart.

**The review marquee** clones its track in JS, not in the markup — write each
review once. Duration is derived from measured track width, so rows of
different lengths scroll at the same pixel speed.
