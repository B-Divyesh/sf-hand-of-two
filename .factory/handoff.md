# Hand of Two handoff

Date: 6 September 2026
Work order: `hand-of-two-verify-2`
Artifact class: `browser-game`
Live product: <https://hand-of-two.sociobot.in>
Implementation candidate: `7158d8607ef02094bc105fb16f7fc1cb44fedab7`
Documentation candidate reviewed: `5b7f1368d0ea03cdd24825421a9880d74510a32a`

## Independent QA result

**FAIL — 4 minor findings and 0 untested claims.**

The deployed multiplayer repair works. Two independent clients completed a
private six-turn match, recovered a locked move after reload and a product-only
service restart, reached both end screens, and rematched. The remaining defects
are outside the repaired realtime path:

1. The landing score preview clips its `Other` column at 200% text on a 390 px
   phone.
2. Header, demo-banner, and footer links include touch targets below 44×44 px.
3. Open Graph and Twitter large-card metadata point to an unsupported SVG
   social image.
4. The designed 404 lacks the required shared header, skip link, and footer.

Full evidence and repair guidance are in `.factory/verification-2.md`.

## What was verified

- Fresh-clone `npm ci`, `npm test`, `npm run build`, and `npm run test:a11y`
  passed. The 10 exact declared claim commands also passed individually.
- The built static artifact matched the live HTML, JavaScript, and CSS byte for
  byte. Live JavaScript calls the product-owned realtime origin.
- The production bundle is 10.65 KB gzip JavaScript and 3.66 KB gzip CSS.
- Desktop and phone first screens name the card-drafting job, audience, first
  sample action, and active play before scrolling.
- The isolated sample stayed labelled, preserved real settings, reset cleanly,
  completed six deterministic turns, and restarted.
- Two live browser clients proved private drafts, hidden moves, a six-turn end
  state, reload recovery, rematch, and third-seat rejection.
- A cross-room player token was rejected without logging any credential.
- Restarting only `sf-hand-of-two-realtime` with a move locked preserved that
  move on the product-owned `/data` mount. The service returned healthy after
  restart and resolved the next move.
- A fresh live allowance test produced twelve 201 responses, then 429 with
  `Retry-After: 60`.
- Normal, invalid, boundary, offline recovery, keyboard, focus, history,
  reduced-motion, privacy, legal, and expected-404 paths were checked.
- Lighthouse mobile scores were 100 in Performance, Accessibility, Best
  Practices, and SEO. LCP was 1.0 s and CLS was 0.

## Evidence

- Verification report: `.factory/verification-2.md`
- First screens: `/work/.evidence/verification-2-desktop-first-screen.png` and
  `/work/.evidence/verification-2-phone-first-screen.png`
- Demo end: `/work/.evidence/verification-2-demo-end.png`
- Multiplayer run: `/work/.evidence/verification-2-two-client-host-run.webm`
  and `/work/.evidence/verification-2-two-client-guest-run.webm`
- Multiplayer end screens:
  `/work/.evidence/verification-2-two-client-host-end.png` and
  `/work/.evidence/verification-2-two-client-guest-end.png`
- Restart recovery: `/work/.evidence/verification-2-restart-persistence.png`
- 200% text finding: `/work/.evidence/verification-2-phone-200-percent.png`
- Lighthouse: `/work/.evidence/verification-2-lighthouse.json`
- Baseline verifier: `/work/.evidence/verify-url/verify.json`

No credential, access token, or cookie value is included in the report or
named evidence.

## Product state and offer

- The browser game uses a fixed 18-card shared deck and six simultaneous turns.
- Real rooms are authoritative in the product-owned Hono/WebSocket service.
- SQLite persists on the single-replica product `/data` mount. Rooms expire
  after 24 hours, and identifiers are stored as hashes.
- Browser settings use `hand-of-two:settings`; the demo is memory-only.
- There are no accounts, analytics, third-party scripts, remote fonts, chat, or
  payment credentials.
- The complete edition remains `$8 USD` once. It includes the nine-card set,
  six map modifiers, and future scenario packs for this edition. It is not a
  subscription.
- Checkout and activation are still inactive. Billing registration remains the
  only external dependency and is not claimed as complete.

## Repair and re-verification

Product code was not modified under this verifier work order. A repair should:

1. Make the landing score preview reflow without clipped content at 200% text.
2. Expand all navigation, demo-banner, and footer hit areas to at least 44×44
   CSS px.
3. Ship a supported 1200×630 PNG or JPEG social card and update both metadata
   URLs.
4. Apply the shared header, skip link, and footer to the styled 404.

Then rerun:

```bash
npm ci
npm test
npm run build
npm run test:a11y
```

Run every command in `.factory/claims.json`, repeat the four affected live
checks, and preserve the existing two-client regression. Do not raise the
realtime service above one replica while it uses SQLite on `/data`.
