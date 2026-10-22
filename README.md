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
| Open-Door Mentorship | `pages/mentorship-open-door/` | Built (OpenDoor Mentorship Page_V3) |
| Mentorship One-Shots | `pages/mentorship-one-shots/` | Built (placeholder: "more information coming soon") |

Every page ships in **compact mode** by default (content capped at 1440px
and centred; see "Page size: compact by default").

**New to the repo?** Read [Making changes](#making-changes) first — it's the
whole workflow, from editing a file to the change showing on the live site.

## Making changes

This is the path every change takes. The rest of this README is reference
for the steps below.

### 1. Setup (once)

```bash
git clone https://github.com/brian-d-v/sir_wade_webpage.git
cd sir_wade_webpage
node --version        # any Node 18+; there is nothing to install
node build.mjs        # builds every page — if this runs, you're set up
```

No `package.json`, no dependencies, no bundler. `build.mjs` concatenates
files; that's all. Open a page's `preview.html` through a local server
(VS Code's Live Preview works) to see it. Licensed fonts for previews go in
the git-ignored `.local-fonts/` (see "Fonts"); without them headings fall
back to Kalam, which is fine for layout work.

### 2. Find where the change goes

| You want to change… | Edit | Re-paste in Kajabi? |
| --- | --- | --- |
| Text, a heading, an element, the order of things | `pages/<page>/blocks/NN-*.html` | **Yes** — that block |
| How something looks on one page | `pages/<page>/src/css/NN-*.css` | No — head bump only |
| How the header, footer or Stay in the loop looks | `shared/css/…` (see "Shared sections") | No — head bump only |
| What something does (dropdowns, forms, animations) | `pages/<page>/src/js/` or `shared/js/` | No — head bump only |
| A link or an image | `shared/js/00-assets.js` (`links.*`, `catalog.*`, …) — or override the key in a page's `00-head.html` | Overriding: that page's head block. Default: head bump only |
| An image file served from the repo | `assets/<page>/` + the `REPO` base in `00-assets.js` | No — head bump only |
| Colours, fonts, the page scale | `shared/css/00-tokens.css` | No — head bump only |

"Head bump only" means: release a new tag, then re-paste each page's two
head pieces (step 5). Markup is the only thing Kajabi holds; everything
else comes from the CDN.

Find the file by searching for a class name you see in the browser's
inspector — every class starts with `sw-`, and each CSS file opens with a
comment naming the section it styles and the mockup measurements behind it.

### 3. Make the change

- **Work on a branch** and open a pull request into `main`:
  `git switch -c fix/footer-spacing`. Don't push straight to `main`, and
  leave tagging to whoever releases (step 5).
- **Never edit `dist/` or `preview*.html`** — they're generated.
- **Sizes are mockup pixels in page units.** Mockups are 2566px wide, and
  `--sw-u` is 1% of the page, so N mockup px is written
  `calc(N / 25.66 * var(--sw-u))`. Keep the original px in a comment.
  Floors like `max(1rem, …)` or `clamp(…)` stop text shrinking on small
  screens; keep them.
- **Scope everything.** Every rule starts with `.sw-scope.<section-class>`
  so it can't leak into Kajabi's own markup, and Kajabi's theme can't
  easily override it.
- **Shared blocks stay identical.** If you change `01-header`, the footer
  or Stay in the loop, make the same change in every page's copy and run
  the hash check under "Shared sections".
- **File names set the CSS order** across `shared/` and the page (see "CSS
  file order"). Two files with the same name in a page's bundle fail the
  build — including a page file that collides with a shared one.
- **Don't write `*/` inside a CSS comment** (e.g. `pages/*/blocks`); the
  build fails on it, because the browser would silently drop the next rule.
- **Match the comment style around you.** Files open with a header block
  saying what the section is and why; keep it current when behaviour
  changes.

### 4. Check it

```bash
node build.mjs            # must finish without errors
```

Then open the page's `preview.html` and look at it:

- [ ] Desktop at ~1440px (the compact default) and `preview-full.html` (no cap)
- [ ] A phone width — **720px and under** is the phone layout (hamburger
      header, stacked sections). Chrome's device toolbar at 390px is a good check.
- [ ] Anything you made interactive: by mouse, by keyboard (Tab/Enter/Escape),
      and with reduced motion on if it animates
- [ ] Other pages, if you touched `shared/`

The preview has none of Kajabi's wrappers, so anything that overlaps the
next block (dropdowns, menus, tooltips) can look fine locally and still be
hidden on Kajabi, where each block is its own stacking layer and clips
its content (`.block { overflow: hidden }` in Kajabi's theme). Check those
on the live page after releasing (see "Keep the header above the blocks
after it" in `shared/css/15-header.css`).

Commit the rebuilt `dist/` with your source changes — jsDelivr serves
`dist/` straight from the repo.

### 5. Release it

Releases are tags; the live pages load a pinned tag, never `main`.
Whoever releases:

1. Pick the next version (`v1.13.4` → `v1.13.5` for fixes, `v1.14.0` for
   features) and replace the old one **everywhere it appears**:
   ```bash
   grep -rl "v1\.13\.4" pages/*/blocks/00-head.* shared/js/00-assets.js \
     | xargs sed -i '' 's/v1\.13\.4/v1.13.5/g'    # macOS sed; on Linux drop the ''
   ```
   That's two URLs in each `00-head.html`, one in each `00-head.css`, and
   the `REPO` image base in `shared/js/00-assets.js`.
2. Build, commit, push, tag — **one command per line**, not chained, so a
   wrapped terminal line can't swallow the tag:
   ```bash
   node build.mjs
   git add -A
   git commit -m "v1.13.5: …"
   git push
   git tag v1.13.5
   git push origin v1.13.5
   ```
3. Confirm the tag is on the commit you just pushed — the two hashes must
   match:
   ```bash
   git ls-remote --tags origin v1.13.5 && git rev-parse HEAD
   ```

**Never move or reuse a tag.** If a tag lands on the wrong commit, leave it
and release the next number — jsDelivr caches a tag's files for good once
anything has fetched them, so a moved tag can keep serving the old files.

### 6. Put it on Kajabi

On **every page**, re-paste the two head pieces (they carry the new tag):
`00-head.css` into Settings → Custom Code → Custom CSS, and `00-head.html`
into the head Custom Code block at the top. Then re-paste any section
block whose **markup** changed (step 2's table), on every page that has it.

Order matters: **push the tag before pasting**, and paste the head pieces
whenever you paste new markup. New markup on top of an old stylesheet
breaks — unstyled SVGs render huge, hidden menus show, drop-downs sit open.
(That happened once with v1.13.0: the blocks were pasted while the heads
still loaded v1.12.0.)

Check it took: view the live page's source and look for your tag in the
`sirwade.css` / `sirwade.js` URLs. A brand-new tag can 404 for a minute
while jsDelivr indexes it; see "Hosting on jsDelivr".

### Who does what

Contributors work on branches and open pull requests. The repo owner
reviews, merges, tags and pastes into Kajabi, so one person controls what
goes live. The repo must stay **public** — jsDelivr can't read private repos.


### Shared sections: keep them identical on every page

The **header**, **footer** and **Stay in the loop** sections must be the
same on every page. Each page has its own copy of the block (Kajabi needs
one per page), but the copies are identical and the styling is shared, so
a change to one is a change to all:

| Section | Block on each page | Shared CSS | Notes |
| --- | --- | --- | --- |
| Header | `01-header.html` | `shared/css/10-nav.css`, `15-header.css`, `js/10-nav-menu.js` | Classes ⌄ and Mentorship ⌄ dropdowns on desktop; hamburger + account icon at 720px and under. Class Info adds its "< Back to Class Library" bar under the identical nav |
| Footer | the last block (`05`/`08`/`09`/`12-footer.html`) | `shared/css/90-footer.css`, `95-footer.css`, `97-footer-mobile.css` | Mentorship and One-Shots size it with `96-footer.css` (same look, their mockups' measurements); `97` lines it up with the phone header |
| Stay in the loop | `*-stay-in-the-loop.html` (Home, Class Library, One-Shots) | `shared/css/80-newsletter.css`, `85-loop.css`, `87-news-form.css`, `js/40-news-form.js` | Validates, stays on the page, shows "You're signed up!". Posts to `forms.newsletter` (see "Before going live"). Mentorship and Class Info don't have the section |

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
  js/         asset resolver + default links and media URLs, header menus,
              review marquee, newsletter form — in every page's bundle
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
assets/       media served from the repo: renders (home/rift.webp,
              home/cafe.webp, home/open-door.webp), the catalog banner, the
              Open-Door Mentorship page's images (mentorship-open-door/),
              the One-Shots banner (mentorship-one-shots/), and
              the Class Library banner and card art (class-library/), and
              placeholders cut from mockups (class-info/, class-techanim,
              home/portrait)
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
shared      00-tokens 01-base 10-nav 15-header 30-catalog 50-reviews 80-newsletter 85-loop
            87-news-form 90-footer 95-footer 97-footer-mobile
home        05-home-base           20-banner 31-home-classes 40-home-mentor 55-testimonials 60-bio
catalog                            20-banner 35-catalog-drop
class-info              16-ci-header 18-ci-base 20-ci-hero 30-ci-overview 40-ci-syllabus
                        50-ci-speakers 60-ci-pricing 70-ci-works 80-ci-faq 85-ci-hover 90-ci-scale
open-door   02-mod-scale 05-mentor-base 20-hero 30-who 35-why 40-how 45-signing
                        48-structure 55-testimonials 60-works 70-faq 75-signup · 96-footer
one-shots                                  20-os-banner 30-os-soon ········· 96-footer

JS          shared 00-assets 10-nav-menu 20-reviews 40-news-form · class-info 20-syllabus
            · catalog 30-catalog-drop · open-door 30-how-arrows
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

## Open-Door Mentorship page

`pages/mentorship-open-door/` (was `pages/mentorship/` before v1.12.0, so
its CDN path changed — re-paste both head pieces). Built from
`OpenDoor Mentorship Page_V3.png` at its native 2566px width, the same way
as the catalog: every size is a measured mockup pixel in `--sw-u` units, so
`--sw-page-max` / `--sw-scale` scale it like every other page (compact by
default). Rendered at 2566px each section lands within a few px of the
mockup, apart from the header (the mockup's bar is 23px taller).

**Scaled down from the mockup.** This mockup is drawn larger than the
others, so `src/css/02-mod-scale.css` re-declares `--sw-u` per section:
85% for the hero, Whether you're a…, Testimonials and FAQ; 70% for Why join
through Need more structure, Student Works and the closing sign-up band.
Section headings are held at one size across both. Header and footer stay
full size. "Within a few px of the mockup" above is before this scale.

| Block | Section | Notes |
| --- | --- | --- |
| `00-head.html` + `00-head.css` | head | as for the catalog |
| `01-header` | header | the shared dark header, same size and nav as Class Library and Class Info (Classes and Mentorship dropdowns, Tutorials; hamburger + account icon on phones). The mockup's bar is 23px taller — treated as a design mistake |
| `02-open-door-mentorship` | hero | `mentorship.hero` |
| `03-who-you-are` | Whether you're a… | `mentorship.icon*` line drawings |
| `04-why-join` | Why join? | cards with amber label tabs; `mentorship.whyBg` |
| `05-how-it-works` | How it works | titled cards + green arrows in mockup coordinates, chevrons travelling along them at one speed (`src/js/30-how-arrows.js`). Below 860px: wide flat cards top to bottom on one straight path (CSS chevrons), gaps stretching with the screen height; `mentorship.howBg` |
| `06-signing-up` | Signing up | the $150 / session price card; button → `links.mentorshipSignup` |
| `07-need-more-structure` | Need more structure? | `mentorship.structureBg` (its curves are in the image); button → `links.oneShots` |
| `08-testimonials` | Testimonials | the home review marquee, re-sized; initials avatars |
| `09-student-works` | Student works | Class Info's frames with "Shot by:" (`mentorship.works.w1`–`w4`) |
| `10-faq` | FAQ | native `<details>`, no script |
| `11-ready-to-sign-up` | Ready to sign up | `mentorship.signupBg`, `links.mentorshipSignup` |
| `12-footer` | footer | the catalog footer at this mockup's size |

**Images** all live in `assets/mentorship-open-door/`. The banner is
RobotImage.jpg (`robot.webp`; the home page's Open-Door card has its own
copy). The
four backgrounds are the `OpenDoor Mentorship_*_Background.png` exports;
How it works and Need more structure had transparency and are flattened
onto black, the colour of the bands around them. The three icons are the
mockup's drawings as white PNGs. Replace any of them via
`SW_ASSETS.mentorship`. The asset keys and CSS classes kept their
`mentorship` names, so existing `SW_ASSETS` overrides still apply.

In `pages/mentorship-open-door/src/css/`, a mockup size of N px is written
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
it. The banner is `assets/mentorship-one-shots/hero.webp` (rtx5090_cafe_frame.png),
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
`assets/` at the `REPO` tag in `shared/js/00-assets.js` (`@v1.13.4`). A preview loads them
from the working tree instead (build.mjs sets `window.SW_REPO_BASE`), so
unreleased images still show locally. Class Library's banner and card images are served from `assets/class-library/`,
each card's artwork cropped to 16:9; Acting & Performance and Technical
Animation Skills keep their older images until new artwork exists.

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
**`@v1.13.4`**, and so is the `REPO` image base. `v1.13.x` adds the header
dropdowns and phone header, the Class Library drop-down cards, the Class
Info backgrounds, the Open-Door rescale and mobile path, the newsletter
form and the phone footer; `v1.13.2` keeps the header's dropdowns and
phone menu above the blocks below them on Kajabi, scales Class
Info to 80%, sizes its overview cards to the Class Library's, and puts two
cards per row on phones (Class Library, Home, Class Info); `v1.13.3` stops
Kajabi's `.block { overflow: hidden }` clipping the header menus, and shows
the whole Class Library banner on phones; `v1.13.4` stops the hamburger
staying amber after it's closed on a phone. (`v1.13.0` is a stray tag on the commit before
the release — don't use it.) `v1.12.0` gave every
page its own image folder under `assets/` (duplicates are fine — no page
borrows another's file, so any page's tag can move without breaking
another), moves Mentorship to `pages/mentorship-open-door/` (Open-Door
Mentorship V3) and updates the Class Library images. `v1.11.0` rebuilt the home page; `v1.11.1` kept the banner
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

run the commands in "Making changes → 5. Release it" — one per line, then
confirm the tag sits on `HEAD`. Chaining them with `&&` across a wrapped
terminal line once left the tag behind on the previous commit.

Then re-paste the head pieces into each Kajabi page (`@v1.13.4` → the new tag).
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
   already pinned to `brian-d-v/sir_wade_webpage@v1.13.4`.
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

#### Missing pages and links

Every link lives in `shared/js/00-assets.js` under `links` (and `forms`).
To fix one without a release, override its key in that page's head
snippet (`window.SW_ASSETS = { links: { … } }`); to fix it for good, change
the default there and release. Keys marked **all pages** sit in the shared
header, so set them in every page's head snippet or in 00-assets.js.

**Not connected — fix before launch**

| Where | Button / link | Key | Goes to now | Needs |
|---|---|---|---|---|
| Home, Class Library, One-Shots | "Stay in the loop" form | `forms.newsletter` | *nothing* — validates and says "You're signed up!" but stores no one | A Kajabi form's action URL (Marketing → Forms → embed code, `<form action="…">`) |

**Missing pages — currently a stand-in**

| Where | Button / link | Key | Goes to now | Needs |
|---|---|---|---|---|
| All pages, phone menu | LBX 2026 | `links.lbx` | the store | The LBX 2026 page |
| All pages, Classes ⌄ | Animation Classes | `links.classesMenu.animation` | Class Library | Its own page (or keep the library) |
| All pages, Classes ⌄ | Maya Training | `links.classesMenu.maya` | Class Library | Its own page (or keep the library) |
| All pages, Classes ⌄ | Unreal Engine | `links.classesMenu.unreal` | Class Library | Its own page (or keep the library) |
| Class Info, hero | Sign up | `links.classInfo.signup` | the store | Class checkout |
| Class Info, pricing | Sign up for Class 01 | `links.classInfo.class01` | the store | Class 01 checkout |
| Class Info, pricing | Sign up for bundle | `links.classInfo.bundle` | the store | Bundle checkout |
| Class Info, pricing | Sign up for Class 02 | `links.classInfo.class02` | the store | Class 02 checkout |
| Class Info, pricing | Contact for bulk pricing | `links.classInfo.bulk` | the store | A contact page or `mailto:` |
| Open-Door Mentorship | Sign up for Open-Door Mentorship · Sign up (closing band) | `links.mentorshipSignup` | the store | The mentorship sign-up / calendar page |
| Home, Classes | Technical Animation Skills card | `links.techAnim` | the store | The class page |
| Home, Classes | Acting & Performance card | `links.acting` | the store | The class page |
| Home, Classes | Animation in Unreal Engine Series card | `links.unrealSeries` | the store | The class page (Class Info?) |

**Probably wrong — check these**

| Where | Button / link | Key | Goes to now | Problem |
|---|---|---|---|---|
| Home, Mentorship | both "Learn more" buttons | `links.mentorship` | `courses.sirwade.com/mentorship-page` | The header's Personal Mentorship uses `sirwade.mykajabi.com/mentorship-page`. Make them match (whichever domain is live). |
| Class Library cards | image + Sign up, all ten | `links.classSignup.*` | `courses.sirwade.com/products/…` | These are the logged-in **library** pages from `legacy/classPage*.html`, not checkouts: someone who hasn't bought the class likely lands on a login screen. Swap in each class's sales/checkout page. |
| Class Library | Advanced Body Mechanics | `links.classSignup.advancedBodyMechanics` | "Class 1 Official" product | Library also has a "Class 1 Experimental" and a "Free Class Access" product — confirm which. |
| Class Library | Acting & Performance | `links.classSignup.acting` | "Acting + Performance - Class 2" product | Library also has "Performance: Intro to Acting + Gestures" — confirm which. |
| Mixed domains | — | — | — | Links use both `courses.sirwade.com` and `sirwade.mykajabi.com`. If they're the same Kajabi site, pick one; if not, confirm each page lives where its link points. |

**Working — for reference**

Class Library (`links.catalog`, Classes ⌄ All Classes, phone Browse Classes, "View all classes", "< Back to Class Library") →
`sirwade.mykajabi.com/class-library-page-2` · Personal Mentorship →
`sirwade.mykajabi.com/mentorship-page` · Shot Sprint and "Learn more about
Mentorship One-Shots" → `sirwade.mykajabi.com/oneshots-page` · Log in /
account icon → `courses.sirwade.com/login` · Tutorials →
`youtube.com/@SirWade` · Home Animation Basics card →
`courses.sirwade.com/animation-basics`.

#### Everything else

- [ ] Class Library: Acting & Performance and Technical Animation Skills
      still use their older images (no new artwork in class-library-assets).
- [ ] Class Library: write each card's two drop-down bullets — all ten
      still carry the mockup's "lorem ipsum dolor sit amet…" placeholder
      (03-all-classes.html, `.sw-catalog-points`).
- [ ] Class Library: replace the intro line under "All available classes".
      It's the home page's copy standing in for the mockup's lorem ipsum.
- [ ] Class Library: confirm the Animation in Blender description. The
      mockup's was a copy of the Unreal one; the current line is a guess.
- [ ] Home: replace the placeholder copy the mockup left as lorem ipsum —
      the Classes and Mentorship intros reuse the old home page's lines,
      Testimonials says "Hear from past students." — and give the two
      mentorship cards their own paragraphs (both carry the Mentorship
      page's intro, as in the mockup).
- [ ] Home: `home.portrait` is the bio photo cut from the mockup (716px);
      swap in the original photo when there is one.
- [ ] Confirm the **PalmerLakePrint licence** (Jen Wagner Co.) covers web
      use — it's served on the live site today. See "Fonts".
- [ ] Class Info: replace the nine overview images cut from the mockup.
      The hero (dive.png) and the syllabus, pricing and FAQ backgrounds are the
      real renders.
- [ ] Class Info: fill in the syllabus panels, guest speakers (names, bios,
      `classInfo.speakers.*`), student works (`classInfo.works.*` + names),
      and FAQ answers ("Answer coming soon.").
- [ ] Open-Door Mentorship: write the four FAQ answers (they read "Answer
      coming soon.") and add Student Works (`mentorship.works.w1`–`w4`
      and the names after "Shot by:").
- [ ] Mentorship One-Shots: replace "More information coming soon." with
      the program details when they exist.

---

## Notes on a few techniques

**Class Info renders at 80% of its mockup** (`src/css/90-ci-scale.css`):
each section's unit is 80% of the shared one and, on desktop, its content
column is capped at 80% of the page and centred (the hero is left out so
its copy lines up with the logo). The overview cards are fixed at the
Class Library cards' width, three across; on phones they go two per row
like the Class Library. The measurements below are the mockup's, before
that scale.

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

**The catalog banner** (`assets/class-library/banner.webp`) is rebuilt from
burgerBoy.jpg and the Open-Door robot render, template-matched against the
mockup and joined with a multi-band blend. The placements and the blend are
recorded in `20-banner.css`. It ships undarkened; the
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
