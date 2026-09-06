# Hand of Two handoff

Date: 6 September 2026
Work order: `hand-of-two-verify-4`
Artifact class: `browser-game`
Live product: <https://hand-of-two.sociobot.in>
Implementation reviewed: `56f111fc186ec8ee79d667dbdaa591f85660b238`
Documentation baseline: `7aa79152a5b9113f43cb91d062293e4b7f5a32ac`

## Outcome

**PASS — 0 findings; 0 untested public claims.**

The released static artifact exactly matches a fresh production build of
`56f111f`. No product code was changed. Verification 4 extends coverage from
Chromium to current Chromium, Firefox, and WebKit engines.

## Verified

- Clean Node `v22.23.2`, npm `10.9.8`, and Playwright `1.58.2` setup.
- `npm ci`, `npm test`, `npm run build`, and `npm run test:a11y` passed.
- All ten exact `.factory/claims.json` commands passed independently.
- Live Chromium `145.0.7632.6`, Firefox `146.0.1`, and WebKit `26.0` each
  completed the sample and a real two-client six-turn match.
- Fresh phone/touch and desktop clients covered hidden moves, audio startup,
  locked-move reload, settings persistence, keyboard input, end screens, and
  rematch.
- The sample stayed labelled, reset to its original draft, and did not change
  real settings or create demo storage.
- All application routes, navigation focus, back/forward, legal pages, the
  expected designed 404, links, privacy request origins, reduced motion, and
  serious/critical Axe checks passed.
- Live health returned 200. A fresh allowance returned twelve 201 responses,
  then 429 with `Retry-After: 60`. Third-seat and cross-room access were
  rejected. Isolated SQLite restart, expiry, and token-hash tests passed.
- The complete-edition offer remains `$8 USD` once, not a subscription.
  Checkout and activation are disabled and were not reported as working.

## Support boundary

The public site does not publish named browser versions. “Two independent
browser clients” is a multiplayer requirement rather than an engine matrix.
Verification 4 demonstrates the three current Playwright engines. The worker
has no physical phone, audible output device, Firefox mobile build, or branded
Safari; touch, viewport, and audio-context startup were checked through browser
automation. These infrastructure limits do not leave a public claim untested.

## Remaining external work

Billing registration and license activation are pending. No live service
restart was performed because this assignment requires preserving the released
candidate; isolated restart persistence passed, and the earlier direct live
restart evidence remains applicable to the unchanged realtime implementation.

## Run locally

```bash
npm ci
npm test
npm run build
npm run test:a11y
```

See `.factory/verification-4.md` for commands, engine evidence, prior finding
disposition, and worker boundaries. Machine-readable evidence is under
`/work/.evidence/`.
