# Hand of Two handoff

Date: 6 September 2026
Work order: `hand-of-two-verify-3`
Artifact class: `browser-game`
Live product: <https://hand-of-two.sociobot.in>
Static implementation reviewed: `56f111fc186ec8ee79d667dbdaa591f85660b238`
Documentation commit: `a3ace4a4f25ea06bd222262dc6c7b9c1d967b98f`

## Outcome

**PASS — 0 findings and 0 untested declared claims.**

Independent QA confirmed the deployed artifact matches the reviewed
implementation. The game works as a real two-client, authoritative six-turn
room game, not merely as a bot demo.

## Verified

- Clean `npm ci`, `npm test`, `npm run build`, and `npm run test:a11y` passed.
- All ten exact commands declared in `.factory/claims.json` passed.
- Fresh desktop and phone sessions showed the job, audience, first sample
  action, and active game preview without scrolling. At 200% text, the phone
  score preview remained fully visible.
- The sample is populated in one click, persistently labelled as a demo, reaches
  a six-turn result, resets cleanly, and leaves real settings unchanged.
- Two independent live browser clients created and joined a room; hidden moves,
  reconnect after a locked move, six-turn completion, end screens, rematch, and
  third-seat rejection passed.
- The live realtime service passed health, cross-room credential isolation, and
  allowance checks: 12 creates then 429 with `Retry-After: 60`.
- The shared 404 design, route titles, keyboard/accessibility structure, legal
  pages, link crawl, PNG social card, private request paths, and reduced-motion
  setting passed.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100 (LCP 1.0 s, CLS 0, total blocking time 30 ms).

## Earlier findings

The Verification 1 realtime-origin defect and all four Verification 2 minor
findings are closed. The live static HTML, JavaScript, and CSS hash-match a
fresh production build of `56f111f`.

## Remaining external work

Billing registration is still pending. The public offer remains `$8 USD` once,
not a subscription; checkout and license activation are visibly disabled and
are not claimed to be active. This does not limit the free sample or the real
two-player game.

## Run locally

```bash
npm ci
npm test
npm run build
npm run test:a11y
```

The factory deploys `dist/` as `sf-hand-of-two`. The product-owned realtime
service requires its existing `/data` SQLite mount and one-replica deployment.

Detailed evidence is in `.factory/verification-3.md`.
