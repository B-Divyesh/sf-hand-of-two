# Verification 1 — FAIL

Date: 6 September 2026  
Work order: `hand-of-two-verify-1`  
Live URL: <https://hand-of-two.sociobot.in>  
Implementation candidate reviewed: `ebf7cbf067c64078929220119ff061fe9692bb72`  
Documentation candidate: `5946e7654ba5126347139f3c7414b31dc7783898`  
Repository tip reviewed: `2f02eb1a43f5cf7812ae78c2f9620fc515094448`

## Verdict

**FAIL — 1 critical finding; 0 untested declared claims.**

The implementation candidate passes locally, but the deployed static artifact is not configured to call the deployed realtime API. The actual two-person game cannot start from the live product.

## Finding

### Critical — live room creation is broken

On a fresh desktop Chromium context, opening `/play` and selecting **Create a room** sent:

```text
POST https://hand-of-two.sociobot.in/api/rooms → 405
```

The visible recovery message was:

```text
Failed to execute 'json' on 'Response': Unexpected end of JSON input Try again when the connection returns.
```

No room code was created. Consequently, two independent live browser clients could not draft, lock hidden moves, reconnect, reach an end screen, or rematch. This breaks the core advertised job: a real two-browser, server-authoritative duel.

The source candidate uses `VITE_REALTIME_ORIGIN` for `roomRequest`, but the deployed JavaScript asset `/assets/index-lwtRSPTN.js` contains zero references to `hand-of-two-realtime.sociobot.in`. The live artifact therefore falls back to the static origin for the HTTP room API. The actual realtime service is healthy and accepts room creation at its own product-owned origin, so this is a static-build configuration/deployment defect, not a deliberate 404 or an unavailable backend.

Repair: rebuild and deploy the static artifact with `VITE_REALTIME_ORIGIN=https://hand-of-two-realtime.sociobot.in`, then independently repeat a real two-context six-turn match, reconnect, and rematch on the live URL.

## Clean-checkout claim commands

Fresh clone at `2f02eb1`, Node `v22.23.2`, `npm ci`: passed with no package vulnerabilities. Every command declared in `.factory/claims.json` passed. These prove the local candidate but do not override the failed live runtime check above.

| Claim | Declared command | Result |
| --- | --- | --- |
| demo-sandbox | `npm test -- --grep @claim:demo-sandbox` | Pass |
| six-turn-match | `npm test -- --grep @claim:six-turn-match` | Pass |
| private-requests | `npm test -- --grep @claim:private-requests` | Pass |
| two-client-room | `npm test -- --grep @claim:two-client-room` | Pass locally; failed live as finding above |
| one-turn-reconnect | `npm test -- --grep @claim:one-turn-reconnect` | Pass locally; live flow blocked by room creation |
| settings-persist | `npm test -- --grep @claim:settings-persist` | Pass |
| one-time-offer | `npm test -- --grep @claim:one-time-offer` | Pass |
| deterministic-sample | `npm run test:unit -- --testNamePattern @claim:deterministic-sample` | Pass |
| room-retention | `npm run test:unit -- --testNamePattern @claim:room-retention` | Pass; includes SQLite restart persistence and hashed identifier coverage |
| fixed-deck | `npm run test:unit -- --testNamePattern @claim:fixed-deck` | Pass |

Additional clean-checkout gates passed:

```text
npm test          6 unit/integration tests + 12 Chromium tests passed
npm run build     passed; dist/ produced
npm run test:a11y passed; axe found zero serious or critical violations
```

The built client is 32.45 KB raw / 10.62 KB gzip JavaScript and 12.39 KB raw / 3.66 KB gzip CSS.

## Live checks

- Desktop first screen states the job, audience, and first action before scrolling: **Draft cards and predict the other player’s moves**; couples and friends; **Try it with sample data**. The active-game preview is present.
- Fresh 390×844 mobile context showed the same job, action, and game preview with `scrollWidth = 390`; screenshot: `/work/.evidence/verification-1-phone-first-screen.png`.
- The one-click sample was populated with six cards, retained **Demo — sample data, nothing is saved** through a deterministic six-turn end screen, showed six history rows, reset to six cards, and did not alter an existing real settings key. Screenshot: `/work/.evidence/verification-1-demo-end.png`.
- `/`, `/demo`, `/play`, `/settings`, `/privacy`, and `/terms` each returned 200, had their route-specific titles, exactly one `h1`, exactly one `main`, and zero axe serious/critical findings. Reduced-motion was requested in the accessibility context.
- The unknown route returned the expected designed HTTP 404, titled **Page not found — Hand of Two**, with **Return to Hand of Two**. Its HTTP 404 is expected, not an additional defect.
- Product static headers include CSP, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy`. No third-party script or font origin was observed in the demo path.
- Realtime health returned 200 with a status-only healthy response. A live product-owned API allowance check produced twelve 201 responses then a 429 with `Retry-After: 60`.
- Local authoritative persistence, invalid card/draft rejection, third-seat rejection, invalid room, offline request recovery, keyboard card choice, settings persistence, and restart persistence were covered by the passing candidate suite. Live reconnect/rematch are blocked by the critical room-creation failure.

## Earlier handoff items and disposition

- Billing registration and activation were already marked external. The live offer remains an honest public **$8 USD once** offer, says it is not a subscription, and keeps the purchase control disabled; this is not a finding.
- The 10–15 minute target and 30% rematch target remain unmeasured research targets, not public measured claims.
- The previous handoff claimed live two-client creation, reconnect, end state, rematch, and restart persistence. This verification contradicts the live two-client portion with repeatable HTTP 405 evidence. Local restart-persistence coverage continues to pass; live restart was not initiated because the ordinary room-entry path cannot first create a test room.
- Future scenario packs remain future content described by the preserved one-time offer; checkout and activation are still not claimed active.

## Required next verification

Deploy a static build with the realtime origin embedded, then verify from two fresh live browser contexts: room create and join, hidden first move, reconnect after a locked move, six-turn end screen in both clients, and mutual rematch. Re-run the rate-limit and health checks after the repaired deployment.
