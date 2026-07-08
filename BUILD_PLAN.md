# Miss B's Coconut Club — Completion Build Plan
**Repo:** github.com/LilosG/miss-bs-coconut-club
**Goal:** Bring the site from "looks finished" to "actually architected correctly" and ready for production cutover — zero hardcoded content, zero duplicated data, `astro check` clean, real lead capture, complete schema.

Each phase below has: what gets built, why, the exact prompt to hand Claude Code, and a validation gate you check before moving to the next phase. Do not skip the validation gate — that's how drift creeps back in.

---

## Phase 0 — Decisions (LOCKED IN)

1. **Forms** — no custom backend. Reservations and private-event inquiries use an embedded/iframe Toast integration, submitting directly into Toast. No Cloudflare Worker, no Resend, no Notion queue for this site.
2. **Pricing** — no pricing displayed anywhere on the site, ever. Menu stays the visual category-card approach (Food / Cocktails / Brunch, dish names, no prices). `menu.json` gets populated with dish names/descriptions/images only — no price field in the schema at all, so it can't accidentally get added later.
3. **FAQ page** — yes, structurally matching Cococabana, but the questions/answers must be written to target high-intent local search phrases and structured for AEO/LLM citability (direct-answer format, FAQPage schema, question phrasing that mirrors real search/prompt queries). Covered in detail in Phase 7.
4. **Production domain** — `https://missbcoconutclub.com/` (no "s" after "miss b"). **Critical bug found:** the current codebase hardcodes `missbscoconutclub.com` (with the "s") in `LocalSEO.astro`'s canonical/OG fallback, the og-image path, and inline in two blog post bodies. `astro.config.mjs` also never sets Astro's `site` field, so every canonical/OG/JSON-LD `url` in the current build is silently falling back to that wrong domain string. This gets fixed in Phase 1 as a global correction, not left for later.
5. **Social profiles** — confirmed:
   - TikTok: `https://www.tiktok.com/@missbcoconutclub`
   - Instagram: `https://www.instagram.com/missbcoconutclub/`
   - Facebook: `https://www.facebook.com/MissBsCoconutClub/`
   - LinkedIn: `https://www.linkedin.com/company/miss-b's-coconut-club-llc`

   Note: `contact.astro` currently hardcodes Instagram/Facebook links using the wrong handle (`missbscoconutclub`, with an "s") — gets corrected in the same pass as the domain fix.

All open questions are resolved. Proceed to Phase 1.

---

## Phase 1 — Data Layer Foundation

**What:** Rebuild `/src/data` as the single source of truth for every piece of copy currently hardcoded in page files, and fix the domain bug at the source so nothing downstream inherits it.

Files to create/expand:
- `site-profile.json` — expand to include: full business info, correct domain (`https://missbcoconutclub.com`), social handles (TikTok/Instagram/Facebook/LinkedIn, exact URLs below), hours (structured, not strings), nav links
- `menu.json` — dish names/descriptions/images only, **no price field in the schema**
- `events.json` — all 6 private event types, one record each, keyed by slug
- `nav.json` — single nav array consumed by both header and footer (kills the duplication)

Confirmed social URLs to go into `site-profile.json` → `social`:
```json
{
  "tiktok": "https://www.tiktok.com/@missbcoconutclub",
  "instagram": "https://www.instagram.com/missbcoconutclub/",
  "facebook": "https://www.facebook.com/MissBsCoconutClub/",
  "linkedin": "https://www.linkedin.com/company/miss-b's-coconut-club-llc"
}
```

**Claude Code prompt:**
```
Read the full current codebase at src/. Do not write any code yet — first output
a complete inventory of every hardcoded content array/object across all pages
and components (cite file + line numbers), AND every occurrence of the string
"missbscoconutclub" anywhere in the repo (this is a wrong domain — correct
domain is missbcoconutclub.com, no "s" after "miss b"). Then propose the exact
JSON schema for site-profile.json, menu.json (no price field — this site never
displays pricing), events.json, and nav.json that would let every page consume
100% of its copy from data files with zero inline arrays remaining. Wait for my
approval of the schema before creating any files.

Once approved: set the `site` field in astro.config.mjs to
"https://missbcoconutclub.com", correct every hardcoded "missbscoconutclub"
occurrence (including inside blog post body copy and the contact page's
Instagram/Facebook links) to the correct domain and the confirmed social URLs
below, and remove the hardcoded domain fallback string in LocalSEO.astro in
favor of relying on Astro.site.

Social URLs:
tiktok: https://www.tiktok.com/@missbcoconutclub
instagram: https://www.instagram.com/missbcoconutclub/
facebook: https://www.facebook.com/MissBsCoconutClub/
linkedin: https://www.linkedin.com/company/miss-b's-coconut-club-llc
```

**Validation gate:** You approve the proposed JSON schemas before a single file is written. This is the "read the environment before writing code" step — don't let it skip this.

---

## Phase 2 — Blog → Astro Content Collections

**What:** Replace the two duplicated hardcoded post objects (`blog/index.astro` and `blog/[slug].astro`) with a real Content Collection, matching the MDX pipeline you run on your other 8 blog clients.

**Claude Code prompt:**
```
Create src/content/config.ts defining a "blog" collection with a zod schema:
title, metaTitle, description, category, date, image, imageAlt. Migrate all 6
existing hardcoded posts (best-brunch-mission-beach, best-bars-mission-beach,
private-events-mission-beach, things-to-do-mission-beach,
tropical-cocktails-san-diego, bachelorette-party-san-diego) from
src/pages/blog/[slug].astro into individual .mdx files under src/content/blog/,
preserving all existing body copy exactly. Refactor blog/index.astro to use
getCollection('blog') and blog/[slug].astro to use getStaticPaths from the
collection with getEntry. Delete the old hardcoded objects entirely. Run
astro check and fix any resulting errors before reporting done.
```

**Validation gate:** `astro check` clean. Visit `/blog` and two individual post pages locally — content must render identically to before.

---

## Phase 3 — Component Extraction

**What:** Right now, repeated UI blocks (stat bars, image grids with hover captions, CTA bands, "what's included" lists) are copy-pasted inline across pages. Extract them into real components so future edits happen in one place.

**Claude Code prompt:**
```
Audit src/pages/*.astro and src/pages/**/*.astro for repeated markup patterns
(stat/hours bars, hover-caption image grids, split-screen CTA bands, checklist
sections). Propose a list of reusable Astro components to extract (e.g.
StatBar, HoverImageGrid, SplitCTA, ChecklistSection) with props interfaces.
Wait for my approval, then extract them into src/components/ui/, and refactor
every page that uses that pattern to use the new component instead of inline
markup. Run astro check after each component extraction, not just at the end.
```

**Validation gate:** Visual diff — every page should render pixel-identical to before. This phase is pure architecture, zero visual change.

---

## Phase 4 — Wire All Pages to Data Files

**What:** Now that data files and components exist, remove every remaining inline content array from `index.astro`, `menu.astro`, `brunch.astro`, `space.astro`, `contact.astro`, and both `private-events` pages.

**Claude Code prompt:**
```
Using the data files created in Phase 1, refactor index.astro, menu.astro,
brunch.astro, space.astro, contact.astro, private-events/index.astro, and
private-events/[...slug].astro so that zero content arrays remain hardcoded
inline. All copy, images, hours, event types, and nav must be pulled from
src/data/*.json or the content collection. Remove unused imports (siteProfile
is currently imported but unused in brunch.astro, menu.astro, and both
private-events pages — either use it or remove it, do not leave dead imports).
Run astro check and fix all errors and warnings before reporting done.
```

**Validation gate:** `astro check` → 0 errors, 0 warnings, 0 hints. `grep -rn` for any remaining inline arrays of 3+ objects in `src/pages/` should return nothing.

---

## Phase 5 — Private Events Sub-Pages Consolidation

**What:** Confirm `private-events/index.astro` and `private-events/[...slug].astro` both read from the single `events.json` created in Phase 1 — no separate `eventTypes` array anywhere.

**Claude Code prompt:**
```
Confirm private-events/index.astro and private-events/[...slug].astro both
import from src/data/events.json exclusively, with getStaticPaths generating
routes from Object.keys(events) or a similar single-source pattern. There
should be exactly one place in the codebase where an event type's title,
description, and capacity are defined. Run astro check.
```

**Validation gate:** Edit one field in `events.json`, confirm it updates in both the index card and the detail page on rebuild.

---

## Phase 6 — Toast Integration (Reservations + Private Events)

**What:** Replace every dead "Submit an Inquiry" CTA with a real embedded Toast form/iframe. No custom backend for this site — Toast owns the submission path. Also resolve the dead `/order` nav link, likely also a Toast destination.

**Before writing code, you need from Toast/the client:**
- The embed/iframe snippet or public URL Toast provides for reservations
- Whether private-event inquiries route through a separate Toast form/flow than table reservations, or the same one with different pre-fill
- Whether Toast also handles online ordering (which would resolve what `/order` should point to)

**Claude Code prompt:**
```
Embed the Toast [reservation / private-event inquiry] iframe/widget on
/contact, replacing the current tel:-only reservation CTA. Wire every
"Submit an Inquiry" CTA across private-events/index.astro and
private-events/[...slug].astro to point to the same embed, ideally with a
pre-filled event-type field/query param if Toast's embed supports it — check
Toast's embed documentation for supported parameters before assuming this is
possible.

The nav CTA "Order Online" currently links to /order, which does not exist.
Point it at the Toast ordering URL if one exists, otherwise remove the CTA
until there's a real destination — confirm with me which before building.

Since the iframe is a third-party embed, verify it doesn't break the existing
CSP/security headers in astro.config.mjs or vercel config, and confirm it's
responsive at mobile widths — Toast embeds are not always mobile-optimized by
default.
```

**Validation gate:** Submit a real test reservation and a real test private-event inquiry through the live embed, confirm both land correctly in Toast. No dead links remain anywhere — run a full link check across every page. Confirm the embed renders correctly on mobile.

---

## Phase 7 — SEO & Schema Completion

**What:** Close every schema and metadata gap found in the audit.

**Claude Code prompt:**
```
Update LocalSEO.astro to add: sameAs array (Instagram + Facebook URLs from
site-profile.json), openingHoursSpecification generated from the structured
hours data in site-profile.json (not hardcoded strings), and a hasMenu
reference if a real priced menu exists per Phase 0 decision #2. Generate a
real 1200x630 og-image.jpg and place it in public/ — reference it correctly
in LocalSEO.astro instead of the current broken /assets/og-image.jpg path.
Build /faq.astro with FAQPage schema. Before writing question copy, research
actual high-intent local search phrases this venue should rank for — think in
terms of what someone actually types into Google or asks ChatGPT/Perplexity
when deciding where to go, not generic FAQ filler. Categories to cover at
minimum: reservations/walk-ins policy, brunch specifics (times, bottomless
mimosas, wait), private event capacity and buyout options, parking/getting
there in Mission Beach, dress code, dog-friendly/kid-friendly status, and
"best X in Mission Beach" style comparative questions where Miss B's has a
legitimate claim. Write each answer as a direct, self-contained 2-4 sentence
answer in the first sentence (this is what gets pulled into AI Overviews and
cited by LLMs — lead with the answer, not a wind-up). Use the exact question
phrasing a real searcher would use, not marketing-voice restatements. Pull
factual details (hours, capacity, address) from site-profile.json — do not
hardcode them again in the FAQ content.
Run astro check.
```

**Validation gate:** Paste the rendered JSON-LD from 2-3 pages into Google's Rich Results Test. Confirm og-image renders correctly in a social share preview debugger (e.g. Facebook Sharing Debugger, Twitter Card Validator).

---

## Phase 8 — Full Build Health Pass

**Claude Code prompt:**
```
Run a final full audit: astro check (must be 0 errors/warnings/hints), a broken
link check across every internal href in src/pages/, verification that no
src/pages/*.astro file contains inline content arrays of 3+ objects, and a
check that every image has a non-generic alt tag. Report results as a
checklist, not a narrative.
```

**Validation gate:** Every item on that checklist passes. If anything fails, fix it before moving to Phase 9 — do not launch with known gaps.

---

## Phase 9 — Pre-Launch Checklist (manual, not Claude Code)

- [ ] `sitemap.xml` and `robots.txt` present and correct for production domain
- [ ] GA4 + GSC verification tags in place (match your dashboard.lilosgrowth.com integration)
- [ ] Client sign-off on menu content, event capacities, and hours accuracy — this is content correctness, not code correctness, and only the client/GPH team can confirm it
- [ ] DNS/domain cutover plan from current live site to this Vercel deployment confirmed with client
- [ ] Redirect map if any URL paths are changing from the current live site (avoid losing existing SEO equity)
- [ ] Final mobile pass on real devices, not just browser devtools

---

## Why this order matters

Data layer → content collections → components → page wiring → forms → schema → QA. Each phase depends on the one before it existing cleanly. Building the form before the data layer is centralized, for example, means you'd wire it to values that are about to move — that's exactly the kind of rework-inducing sequencing that creates patchwork. Hold the line on the validation gates between phases even when it's tempting to skip ahead.
