# Hand of Two handoff

Date: 6 September 2026
Work order: `hand-of-two-review-3`
Artifact class: `browser-game`
Live product: <https://hand-of-two.sociobot.in>
Implementation reviewed: `56f111fc186ec8ee79d667dbdaa591f85660b238`
Documentation baseline: `f20e5e30f2f3a6e4214657ad70ba6f37c9b86bae`

## Outcome

**PASS — 0 findings; 0 untested public claims.**

No product code changed. The live static artifact exactly matches a fresh
production build of `56f111f`.

## Verified

- Clean Node `v22.23.2`, npm `10.9.8`, and Playwright `1.58.2` setup.
- `npm ci`, `npm test`, `npm run build`, and `npm run test:a11y` passed.
- All ten exact `.factory/claims.json` commands passed independently.
- Fresh Chromium desktop and phone/touch contexts showed the job, audience,
  sample action, and active game before scrolling.
- The sample stayed labelled, reached a six-turn ending, reset cleanly, and
  did not change real settings or create demo storage.
- Two independent live clients covered hidden moves, reload recovery, touch,
  keyboard, audio startup, six-turn end screens, history, and rematch.
- Live routes, navigation focus, back/forward, privacy and terms, reduced
  motion, 200% text, touch targets, product-only requests, and the expected
  designed 404 passed. Live Axe found zero serious or critical issues.
- Health returned 200. Live third-seat and cross-room access were rejected. A
  fresh allowance returned twelve 201 responses, then 429 with
  `Retry-After: 60`. Isolated SQLite restart and retention tests passed.
- The complete edition remains a public `$8 USD` one-time offer. Checkout and
  activation are disabled and were not reported as working.

## Support boundary

The public site does not promise named browser versions. This review used
Chromium `145.0.7632.6`; Verification 4 independently covered Chromium,
Firefox, and WebKit. Touch and audio-context startup were verified with browser
automation rather than a physical phone or audible output device.

The separate path `factory-evidence/hand-of-two-verify-4/qa-report.md` was not
mounted in this worker. Its complete repository counterpart,
`.factory/verification-4.md`, was read, and the required evidence was recreated
fresh.

## Remaining external work

Billing registration and license activation remain pending. The product says
so plainly. No live service restart was performed; Verification 2's direct
restart evidence remains applicable to the unchanged realtime implementation,
and the clean local SQLite restart test passed.

## Run locally

```bash
npm ci
npm test
npm run build
npm run test:a11y
```

See `.factory/review-3.md` for the complete claim matrix, live evidence, and
earlier finding disposition. Machine-readable evidence is under
`/work/.evidence/`.
