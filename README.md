# Sir Wade — Kajabi pages

Source for the sirwade.com pages built in Kajabi. Each page's CSS and JS are
built into two files in its own `dist/` and served free over **jsDelivr**
straight from this repo; the HTML lives in **one Kajabi custom code block per
section**.

Nothing here is a site generator. Kajabi renders the page — this repo just
supplies the stylesheet, the behaviour and the markup you paste in.

| Page | Folder | Status |
| --- | --- | --- |
| Home | `pages/home/` | Built |
| Class Catalog | `pages/class-catalog/` | Built |
| Class Info | `pages/class-info/` | Scaffold (head snippet only) |
| Mentorship | `pages/mentorship/` | Built (branch `feat/mentorshipPage`) |

---

## How the pieces fit

```
Kajabi page (e.g. Class Catalog)
├── Settings → Custom Code → Custom CSS .... pages/class-catalog/blocks/00-head.css
│     ├── @import Google Fonts + our CSS   ← lands in the real <head>
│     ├── @font-face "SW PalmerLakePrint" (font-display: block)
│     └── optional :root token overrides
│
├── "Head" Custom Code block (first) ........ pages/class-catalog/blocks/00-head.html
│     ├── preload for the heading font
│     ├── window.SW_ASSETS  ← your Kajabi media URLs
│     ├── optional :root token overrides
│     └── <link>/<script> → cdn.jsdelivr.net/gh/brian-d-v/sir_wade_webpage@TAG/pages/class-catalog/dist/*
│
└── Section blocks (one Kajabi Custom Code block each)
      01-header · 02-subheader · 03-all-classes · 04-stay-in-the-loop · 05-footer

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
              the catalog also has 00-head.css for the Custom CSS field)
    src/css/  page-only stylesheets
    src/js/   page-only scripts
    dist/     GENERATED sirwade.css + sirwade.js — what jsDelivr serves
    preview.html          GENERATED — the whole page assembled locally
    preview-<name>.html   GENERATED — one per entry in preview-variants.json
    preview-variants.json optional — extra CSS for variant previews
assets/       media served from the repo (home hero plate, catalog banner)
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
shared      00-tokens 01-base       10-nav 15-header ················ 50-reviews ········ 80-newsletter ·· 90-footer
home                                                  20-hero 30-classes 40-mentorship 60-bio 70-tutorials
catalog                                               20-banner 30-catalog ················ 85-loop · 95-footer
mentorship            05-mentor-base       16-header 20-hero 30-who 35-why 40-how 55-testimonials
                                                     60-works 70-faq 75-signup ··················· 95-footer
```

`15-header` (the dark mockup header) and `50-reviews` / `js/20-reviews` (the
review marquee) live in `shared/` because two pages use them. Their rules
only match `.sw-nav.is-dark` and `.sw-reviews`, so pages without those
elements carry the bytes but render exactly as before.

A page file can therefore restyle a shared one by sorting after it — the
mentorship's `16-header.css` makes the shared header 23px taller, `85-loop.css` restyles
the shared newsletter as "Stay in the loop", and `95-footer.css` lays out
the shared footer to the mockup.
Two files with the same name (shared or not) fail the build, since their
order would be ambiguous. JS follows the same rule.

The build also fails if a CSS comment closes early. A `*/` inside a comment
(for instance a path like `pages/*/blocks`) ends it, and the browser then
silently drops the next rule — that once wiped out every design token.

### Adding a page

1. `mkdir -p pages/<name>/{blocks,src/css,src/js}`
2. Copy an existing `blocks/00-head.html` and change the two CDN paths to
   `pages/<name>/dist/`. For a Kajabi landing page, copy the catalog's
   `00-head.css` too (see "Why two head pieces") and change its path.
3. Add section blocks and page CSS/JS, then `node build.mjs`.

Anything a second page needs too belongs in `shared/`.

---

## Working on it

```bash
node build.mjs                          # rebuild every page's dist/ and preview.html
node build.mjs class-catalog            # or just one
open pages/class-catalog/preview.html   # see the page with local (uncommitted) files
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
| Lexend | Catalog body text, nav, forms | Google Fonts |
| Poppins | Home body text, catalog banner title, "ANIMATION" under the logo | Google Fonts |
| Permanent Marker | Home headings | Google Fonts |
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

**Repo-hosted images in previews.** Defaults like the catalog banner point
at a tag-pinned jsDelivr URL, which doesn't exist until that tag is pushed.
Previews set `window.SW_LOCAL_ASSETS`, and the resolver then loads this
repo's `assets/` from the working tree instead. Live pages never set it.

---

## Two sizes of the Class Catalog

The catalog sizes itself in one unit, `--sw-u` (see `shared/css/00-tokens.css`).
Uncapped, it is exactly `1vw`, so the page fills the screen in the mockup's
proportions. Two tokens change that from a head snippet, with no release:

| Token | Effect |
| --- | --- |
| `--sw-page-max: 1440px` | Content stops growing at 1440px and centres; backgrounds, banner and waves stay full-bleed |
| `--sw-scale: 0.9` | Everything 10% smaller |

To keep both versions live, duplicate the catalog page in Kajabi (same
blocks) and uncomment `--sw-page-max` in **that copy's** head snippet —
the `00-head.html` block or the `00-head.css` field, either works. Every fix
then lands in both, because they share one bundle. (Needs v1.7.5+, see
"Theme tokens".)

The cap only shows on a viewport **wider** than it. On a laptop at 1440px or
less, both pages look identical — zoom out (Cmd −) or test with a smaller
value such as `1100px`.

Locally, `node build.mjs` writes `pages/class-catalog/preview-compact.html`
next to `preview.html`. Variants live in `pages/<page>/preview-variants.json`
as `{"name": "css"}` and are injected after the head snippet.

The home page doesn't use `--sw-u` yet, so these tokens don't affect it.

---

## Mentorship page

Built from `Mentorship Page_V2.png` at its native 2566px width, the same way
as the catalog: every size is a measured mockup pixel in `--sw-u` units, so
`--sw-page-max` / `--sw-scale` scale it like the catalog (there's a
`preview-compact.html` too).

| Block | Section | Notes |
| --- | --- | --- |
| `00-head.html` + `00-head.css` | head | as for the catalog |
| `01-header` | header | shared catalog header, 23px taller; "Mentorship" dropped (it's this page); "Classes" is a plain link — the mockup's dropdown has no menu yet |
| `02-personal-mentorship` | hero | `mentorship.hero` |
| `03-who-you-are` | Whether you're a… | `mentorship.icon*` line drawings |
| `04-why-join` | Why join? | cards with amber label tabs |
| `05-how-it-works` | How it works | cards + arrows in mockup coordinates; stacked below 860px; `mentorship.howBg` |
| `06-testimonials` | Testimonials | the home review marquee, re-sized; initials avatars |
| `07-student-works` | Student works | empty slots render as the mockup's outline boxes |
| `08-faq` | FAQ | native `<details>`, no script |
| `09-ready-to-sign-up` | Ready to sign up | `mentorship.signupBg`, `links.mentorshipSignup` |
| `10-footer` | footer | the catalog footer at this mockup's size |

**Images lifted from the mockup.** `assets/mentor-hero.webp`,
`mentor-how-bg.webp` and `mentor-signup-bg.webp` were cut out of the PNG,
with the text, cards and button filled in by a blur fill (the two blurred
backgrounds are half resolution). The fill sits behind the same text and
cards again, so it doesn't show at the mockup's layout; at other widths an
edge can peek out. Replace any of them with the real render via
`SW_ASSETS.mentorship`. The three icons are the mockup's drawings as white
PNGs.

In `pages/mentorship/src/css/`, a mockup size of N px is written
`calc(N/25.66 * var(--sw-u))` (e.g. 212px → `calc(8.262 * var(--sw-u))`),
mostly with a `max()` floor for phones; key px values are in comments.

---

## Assets: keeping Kajabi media swappable

No media URL is hardcoded in the markup. Elements carry a dotted key that
resolves through `shared/js/00-assets.js`:

```html
<img  data-sw-src="classes.summerCamp">
<div  data-sw-bg="…">
<a    data-sw-href="links.signup">
<a    data-sw-yt="tutorials.t1"><img></a>
```

Resolution order: **`window.SW_ASSETS` → shipped defaults → leave as-is.**

So to point the hero at a GIF in your Kajabi library, you edit the Kajabi head
snippet — not this repo, and no CDN purge:

```js
window.SW_ASSETS = {
  hero: { media: "https://kajabi-cdn.../portal-loop.gif" },
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
`links.*`. Card images were matched against the product images in
`legacy/classPage1–3.html`; cards with no match use `ESSENTIALS_IMG`.

### Theme tokens

Every colour, font and the hero-arc geometry are CSS custom properties on
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

Every page's head snippet (and the catalog's `00-head.css`) is pinned to
**`@v1.7.6`**. **Push that tag before pasting them**, or their CSS and JS
404. `v1.7.0` is broken (a comment swallowed the design tokens) and
`v1.7.1` is the first working `pages/` release. Pages still running an old
snippet (`@v1.6.0/dist/…`) keep working: tags are immutable.

Floating refs like `@main` and `@latest` are cached for 12 hours. During a
build-out that lag is maddening; pin a tag once the page is live.

### Releasing a new version

First bump the version in the files you'll paste — every
`pages/*/blocks/00-head.html` (two URLs each) and
`pages/class-catalog/blocks/00-head.css` (one) — then:

```bash
node build.mjs
git add -A && git commit -m "Tweak hero arc" && git push && git tag v1.7.7 && git push origin v1.7.7
```

Paste that as **one line**: if a terminal wraps it, `git push origin` can
run without the tag name ("Everything up-to-date") and the tag never
reaches GitHub. Check with `git ls-remote --tags origin`.

Then re-paste the head pieces into each Kajabi page (`@v1.7.6` → `@v1.7.7`).
The old version keeps serving until you do, so the live page never breaks
mid-release.

**A new tag can 404 for a minute.** jsDelivr needs a moment to index it,
and if anything requested the URL before the tag existed it may cache that
404. If it persists, purge that one URL (below, with the tag in place of
`@main`).

If a release touches `assets/`, check the tag-pinned URLs in
`shared/js/00-assets.js`: the hero plate (`@v1.6.0`), the catalog banner
(`@v1.7.1`) and the mentorship images (`@v1.7.7`) point at the release that
added them, so a *changed* file needs its URL bumped to the new tag.

### Forcing an update on `@main`

If you're on a floating ref and need the change now, purge it:

```
https://purge.jsdelivr.net/gh/brian-d-v/sir_wade_webpage@main/pages/home/dist/sirwade.css
```

Hit that URL in a browser. Purging is rate-limited, which is the other reason
to pin tags in production.

---

## Pasting into Kajabi

1. **Head CSS** (Class Catalog) — the page editor's **Settings → Custom
   Code → Custom CSS**: replace the placeholder with
   `pages/class-catalog/blocks/00-head.css`. Leave Custom JavaScript empty.
2. **Head block** — a Custom Code block at the very top of the page,
   holding `pages/<page>/blocks/00-head.html` as-is. Its CDN URLs are
   already pinned to `brian-d-v/sir_wade_webpage@v1.7.6`.
3. **Sections** — add one Custom Code block per file, in numeric order, pasting
   the whole file each time.
4. Setting each section to **Full Width** with **0 padding** is still worth
   doing, but the stylesheet no longer depends on it — it strips the
   wrappers' side padding and max-width itself.
5. The nav/header and footer blocks are optional — skip them if you're keeping
   Kajabi's native header and footer (the catalog hides Kajabi's). Nothing
   else depends on them.

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

- [ ] Upload a **green** `SirWade` wordmark and set `brand.logoGreen`, then
      drop the `sw-tint-green` class from `pages/home/blocks/01-nav.html`. The default is
      the cream logo recoloured with a CSS filter — a stopgap, not the asset.
- [ ] Replace the hero plate. `assets/hero-rift.webp` was extracted from the
      flattened mockup — correct framing, but soft on retina and a still where
      the design implies motion. Point `hero.media` at the real render, or a
      looping `.mp4`/`.webm` (the `<img>` becomes a `<video>` on its own).
- [ ] Fill in `tutorials.t1`–`t5` with real YouTube ids. They ship empty on
      purpose: a wrong id renders YouTube's grey placeholder instead of
      failing visibly.
- [ ] Wire the newsletter form (see the comment in `pages/home/blocks/08-newsletter.html`;
      the catalog's Stay in the loop form is the same).
      As shipped it does nothing on submit, deliberately — so it can't swallow
      signups before it's connected.
- [ ] Class Catalog: `catalog.banner` defaults to `assets/catalog-banner.webp`,
      rebuilt from two product stills (see `20-banner.css`). Its robot half
      is a different frame than the mockup's; swap in the real banner render
      if there is one. Seven cards still use the Maya Animation Essentials
      image as a stand-in.
- [ ] Class Catalog: point the card links at their pages. Only `links.basics`
      and `links.maya` are real; the other eight fall back to the store.
- [ ] Class Catalog: replace the intro line under "All available classes".
      It's the home page's copy standing in for the mockup's lorem ipsum.
- [ ] Class Catalog: confirm the Animation in Blender description. The
      mockup's was a copy of the Unreal one; the current line is a guess.
- [ ] Class Catalog: the Kajabi page currently lives at `/class-info-page`.
      Give it a proper URL (and keep Class Info for the per-class page).
- [ ] Confirm the **PalmerLakePrint licence** (Jen Wagner Co.) covers web
      use — it's served on the live site today. See "Fonts".
- [ ] Build out `class-info`: a scaffold with only a head snippet.
- [ ] Mentorship: write the four FAQ answers (they read "Answer coming
      soon."), fill How it works steps 3 and 4, and add Student Works
      content (`works.w1`–`w4`, titles, subtitle).
- [ ] Mentorship: point `links.mentorshipSignup` at the real sign-up /
      calendar page (it falls back to the store), and decide whether the
      header's "Classes" gets its dropdown menu.
- [ ] Mentorship: swap the three mockup-lifted images for real renders if
      there are any.
- [ ] Optionally set `apps.maya` / `apps.unreal` / `apps.blender` for the
      Mentorship badges. Unset keys hide their slot rather than break.

---

## Notes on a few techniques

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

**The hero arc** is a `clip-path: ellipse()` whose geometry was *measured*,
not eyeballed: the cream/plate boundary is traced out of the mockup row by
row, then least-squares fitted to a circle — centre (99.5%, 157%), radius
79.7% of the hero width, max error 22px across 1,125 rows. Written in
percentages it holds the same composition at any viewport. Reshape it from the
`--sw-hero-arc-*` tokens; below 900px it drops to a full-bleed scrim.

Two things depend on those numbers staying in sync. The hero copy column is
sized against the measured clearance (the headline reaches 44.4% of the hero
width where the arc is at 50.6%), and `assets/hero-rift.webp` has the region
the arc hides edge-extended using the same ellipse. Change the tokens and both
want revisiting.

**Wave dividers** are inline SVG on the *upper* section, filled with the colour
of the section below. The colour is set inline in the block, so the fill and
the next band can never drift apart.

**The review marquee** clones its track in JS, not in the markup — write each
review once. Duration is derived from measured track width, so rows of
different lengths scroll at the same pixel speed.
