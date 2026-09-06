# Hand of Two handoff

Date: 6 September 2026
Work order: `hand-of-two-repair-3`
Artifact class: `browser-game`
Live product: <https://hand-of-two.sociobot.in>
Static implementation: `56f111fc186ec8ee79d667dbdaa591f85660b238`
Realtime implementation: `7158d8607ef02094bc105fb16f7fc1cb44fedab7` (unchanged)
Documentation candidate: `90f13495fe8e37700fb2d4e3ca05a6e7f8277e32`

## Outcome

**PASS — all four Verification 2 findings are fixed, with no known product
defect left open.**

The static repair is deployed. The existing product-owned realtime service was
not rebuilt because its multiplayer and SQLite behavior was already correct.
Its active revision was restarted during this repair to prove that a locked
move still survives on the durable `/data` mount.

## Repairs

1. The score table now uses bounded responsive columns on small screens. At
   200% text in a 390 px viewport, every score cell remains visible and inside
   the viewport.
2. Header, demo-banner, and footer controls now have at least 44×44 CSS pixel
   hit areas on phone and desktop layouts.
3. Open Graph and Twitter metadata now use an 85 KB, 1200×630 PNG export of the
   existing original SVG composition. The public response is `image/png`.
4. The real HTTP 404 page now includes the shared skip link, wordmark header,
   main navigation, one main landmark, one h1, footer, and return action.

Outcome-based Playwright checks measure the score-cell bounds, rendered target
sizes, PNG response and dimensions, and 404 landmarks. They do not assert only
implementation strings.

## Verification

Clean setup used Node `v22.23.2`, npm `10.9.8`, and `npm ci` with zero reported
vulnerabilities.

- `npm test`: pass — 6 unit/SQLite tests and 15 Chromium tests.
- `npm run build`: pass — `dist/` produced.
- `npm run test:a11y`: pass — six application routes had no serious or
  critical Axe findings.
- Every one of the 10 exact commands in `.factory/claims.json`: pass.
- Standalone Axe CLI 4.13.0: 0 violations after installing its documented
  matching Chrome and ChromeDriver prerequisite.
- Factory `verify-url.sh`: pass, HTTPS 200 and zero console errors.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 946 ms, CLS 0, total blocking time 25 ms.
- Production JavaScript: 32.52 KB raw / 10.62 KB gzip.
- Production CSS: 12.76 KB raw / 3.70 KB gzip.
- Live HTML, JavaScript, and CSS match the final local `dist/` bytes.

## Live product checks

- Fresh desktop and 390×844 phone contexts showed the job, audience, first
  sample action, and an active-game preview before scrolling.
- The sample opened in one click, stayed labelled, completed all six turns,
  showed an end screen and six history rows, reset to its original draft, and
  left a pre-existing real setting unchanged.
- Two independent fresh browser clients created and joined one room, kept the
  first move hidden, recovered the locked move after reload, completed six
  turns, reached both end screens, and started a rematch.
- A third seat and a player identifier from another room were rejected.
- Restarting only `sf-hand-of-two-realtime` with a move locked preserved that
  move. Health returned 200 and the other player resolved the match to turn 2.
- The realtime service remains at one minimum/maximum replica with `/data`
  mounted. A fresh allowance check returned twelve 201 responses, then 429
  with `Retry-After: 60`.
- Route titles, links, reduced motion, keyboard paths, invalid input, offline
  recovery, privacy isolation, legal pages, and the deliberate 404 passed.
- A two-second phone sample measured 60.6 animation frames per second. The game
  remains event-driven and makes no public frame-rate claim.

## Evidence

- Detailed report: `.factory/verification-3.md`
- Desktop first screen: `/work/.evidence/repair-3-live-desktop-first-screen.png`
- Phone first screen: `/work/.evidence/repair-3-live-phone-first-screen.png`
- 200% score table: `/work/.evidence/repair-3-live-phone-200-percent.png`
- Demo end screen: `/work/.evidence/repair-3-live-demo-end.png`
- Two-client end screens: `/work/.evidence/repair-3-live-two-client-host-end.png`
  and `/work/.evidence/repair-3-live-two-client-guest-end.png`
- Two-client recordings: `/work/.evidence/repair-3-live-two-client-host-run.webm`
  and `/work/.evidence/repair-3-live-two-client-guest-run.webm`
- Restart recovery: `/work/.evidence/repair-3-live-restart-persistence.png`
- Designed 404: `/work/.evidence/repair-3-live-404.png`
- Factory baseline: `/work/.evidence/repair-3-verify-url/verify.json`
- Axe: `/work/.evidence/repair-3-axe.json`
- Lighthouse: `/work/.evidence/repair-3-lighthouse.json`

No credential, access token, cookie value, or player identifier is present in
the report or named evidence.

## Offer and remaining external dependency

The complete edition remains **$8 USD once**. It includes the fixed 18-card
nine-card-type tactical set, six map modifiers, and future scenario packs for
this edition. It is not a subscription and does not sell stronger cards.

Checkout and license activation remain inactive. Billing registration is the
only external dependency. Public metadata is copied to
`/work/.evidence/billing-offer.json`; no provider credential is present. The
free sample and real two-player core work without billing.

The researched 10–15 minute duration and 30% immediate-rematch goal still lack
production cohort data. They remain targets, not measured public claims.

## Run and deploy

```bash
npm ci
npm test
npm run build
npm run test:a11y
```

The factory deploys `dist/` as `sf-hand-of-two`. If the realtime service is
ever changed, preserve its fleet-created `/data` volume, probes, environment,
and one-replica bounds.
