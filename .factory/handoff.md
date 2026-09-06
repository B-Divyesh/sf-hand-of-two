# Hand of Two handoff

Date: 6 September 2026
Work order: `hand-of-two-review-1`
Artifact class: `browser-game`
Live product: <https://hand-of-two.sociobot.in>
Implementation reviewed: `56f111fc186ec8ee79d667dbdaa591f85660b238`
Documentation baseline: `f41f62b9b4a7149f657e917b0bf11cc62152c054`

## Outcome

**PASS — 0 findings; 0 untested declared claims.**

The live static artifact exactly matches a fresh production build of `56f111f`.
The game is a real authoritative two-browser, six-turn duel; the demo bot is
only the labelled sample.

## Verified

- Clean `npm ci`, `npm test`, `npm run build`, and `npm run test:a11y` passed.
- All ten exact `.factory/claims.json` commands passed independently.
- Fresh desktop and phone browsers showed the job, audience, sample action, and
  active-game preview before scrolling. Phone 200% text did not overflow.
- The sample starts populated, keeps its demo label, completes to a six-turn end
  screen, resets, and leaves real browser settings untouched.
- Fresh independent live clients created and joined a room, kept the first move
  hidden, reconnected after a locked move, completed, reached complementary end
  screens, and rematched.
- Live health returned 200; room creation rate limiting returned 429 with
  `Retry-After: 60`. Local SQLite tests cover persistence, expiry and isolation;
  the unchanged service's direct restart evidence remains in Verification 3.
- Live routes, expected styled 404, links, metadata, privacy request paths,
  keyboard structure, reduced motion, `verify-url.sh`, and live Axe scans all
  passed. No console errors were observed.

## Remaining external work

Billing registration is pending. The public complete-edition offer is `$8 USD`
once, not a subscription. Checkout and activation are disabled and are not
claimed to work.

## Run locally

```bash
npm ci
npm test
npm run build
npm run test:a11y
```

The factory deploys `dist/` as `sf-hand-of-two`. Its product-owned realtime
service uses its fleet-created `/data` SQLite mount. See `.factory/review-1.md`
for the complete review evidence.
