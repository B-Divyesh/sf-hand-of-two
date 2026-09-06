# Verification 2 — PASS

Date: 6 September 2026
Work order: `hand-of-two-repair-2`
Live URL: <https://hand-of-two.sociobot.in>
Implementation deployed: `7158d8607ef02094bc105fb16f7fc1cb44fedab7`

## Verdict

**PASS — the prior critical live multiplayer finding is repaired; no current minor findings.**

## What changed

The static client now receives its public, product-owned realtime URL from the tracked production build input `.env.production`. The deployed JavaScript calls `https://hand-of-two-realtime.sociobot.in` for room HTTP and WebSocket traffic. The realtime container was rebuilt from the same implementation commit with its existing single-replica durable `/data` configuration preserved.

An outcome-based browser regression uses a static client on one local origin and the actual room service on another. It creates a room, reaches the room-ready state, and verifies that the creation POST uses the configured realtime origin rather than the static origin.

## Clean verification

From the documented clean dependency setup, these all passed:

```bash
npm test
npm run build
npm run test:a11y
npm test -- --grep @claim:demo-sandbox
npm test -- --grep @claim:six-turn-match
npm test -- --grep @claim:private-requests
npm test -- --grep @claim:two-client-room
npm test -- --grep @claim:one-turn-reconnect
npm test -- --grep @claim:settings-persist
npm test -- --grep @claim:one-time-offer
npm run test:unit -- --testNamePattern @claim:deterministic-sample
npm run test:unit -- --testNamePattern @claim:room-retention
npm run test:unit -- --testNamePattern @claim:fixed-deck
```

The 13-browser-test suite passed; Axe found zero serious or critical findings across the application routes. The built JavaScript is 10.65 KB gzip and CSS is 3.66 KB gzip.

## Live verification

- The deployed static asset contains the realtime origin, and a fresh browser sends room creation to it.
- Fresh desktop and phone first screens show the named card-drafting job, audience, sample action, and active-play preview.
- Fresh demo starts populated in one click, keeps the persistent sample label, resets, preserves a pre-existing real setting, and reaches a six-turn end screen.
- Two fresh browser contexts created and joined one room, drafted privately, demonstrated hidden first moves, completed all six turns, reached matching end states, and rematched.
- Reload after a locked move restored that move. A live single-replica restart preserved a locked move and resolved it after health recovered.
- A live third-player join returned 409. Health returned 200. A fresh rate test returned twelve 201 responses followed by 429 with `Retry-After: 60`.
- Live route titles, h1/main structure, designed 404, reduced-motion context, and Axe scan passed. No console errors occurred during the demo or two-client run.

## Earlier findings

Verification 1 reported one critical static-build configuration defect and no minor findings. It is resolved. The existing billing-registration, cohort-duration, and cohort-rematch notes remain named external or measurement gaps, not claims of completed checkout or measured production results.
