# Hand of Two handoff

Date: 6 September 2026
Work order: `hand-of-two-builder-2`
Artifact class: `browser-game`
Live product: <https://hand-of-two.sociobot.in>
Realtime health: <https://hand-of-two-realtime.sociobot.in/api/health>
Implementation SHA deployed to both services: `ebf7cbf067c64078929220119ff061fe9692bb72`

## What was built

- A deterministic, finite duel using one fixed 18-card shared deck.
- A real draft: each player keeps three of six private cards, then receives three reserve cards after turn three.
- Six simultaneous turns across ridge, river, and camp, with movement, guard, disruption, prediction bonuses, and a map rule.
- A scored win, loss, or draw screen, a six-turn review, and mutual rematch with a new seed.
- Real room-code play for two independent browser clients. The server hides moves, validates hands, resolves turns, and rejects a third player.
- Reconnect support that retains a move already locked during the current turn.
- A one-click deterministic demo with a clearly named practice bot, persistent sample banner, reset, and memory-only state.
- Keyboard, touch, 200% text, reduced-motion, opt-in sound, invalid-room, offline-request, rate-limit, and recovery states.
- `/`, `/demo`, `/play`, `/settings`, `/privacy`, `/terms`, and a designed HTTP 404.
- A product-specific field-notebook visual system with original SVG/CSS art and no remote fonts or scripts.
- A public $8 USD one-time Complete Edition offer. The free sample remains available; checkout is honestly disabled.

## Runtime and data

The Vite client is hosted by `sf-hand-of-two`. It connects only to the product-owned `sf-hand-of-two-realtime` service. The service uses Hono and WebSockets, keeps authoritative room state, and writes a standard SQLite file to its fleet-created `/data` Azure Files mount after each transaction.

The realtime app is in single-revision mode with one minimum and one maximum replica. Its active revision was healthy after deployment and after an explicit restart. The first deployment exposed unsupported native SQLite file locking on the network mount. The final adapter uses SQLite compiled to WebAssembly and atomic file replacement. Initial failed revisions never served traffic or accepted rooms; their unused empty database attempts are harmless. Live state is in `rooms-v3.sqlite`.

Rooms expire after 24 hours. Player identifiers are hashed before storage. Demo state is memory-only. Real browser settings use `hand-of-two:settings`. There are no analytics, trackers, accounts, chat records, or payment credentials.

## Verification

From a clean local clone at the implementation SHA:

```bash
npm ci
npm test
npm run build
npm run test:a11y
```

- `npm test`: 6 unit/integration tests and 12 Chromium tests passed.
- Every command in `.factory/claims.json` passed separately from the clean clone.
- `npm run build`: passed; `dist/` created.
- Initial JavaScript: 32.45 KB raw / 10.62 KB gzip.
- Initial CSS: 12.39 KB raw / 3.66 KB gzip.
- Playwright axe: zero serious or critical findings on all six application routes.
- Invalid room, full room, forged card, offline create, 429 with `Retry-After: 60`, keyboard card selection, and recovery paths passed.
- Local cross-origin topology created and joined a room without console errors.

Local Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.29 s, CLS 0, TBT 23 ms.

Live cold checks:

- Factory `verify-url.sh`: HTTPS 200, correct title/lang/main/h1, no missing alt text, and no console errors.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 0.95 s, CLS 0, TBT 18 ms.
- Fresh 390×844 phone: job, audience, game state, and first action visible; no horizontal overflow at 100% or 200% text.
- Measured phone animation loop: 60.8 frames per second over two seconds.
- Fresh demo: drafted, resolved six turns, reached **You win the expedition**, displayed six history rows, kept the demo label, and sent no third-party requests.
- Two fresh live browser contexts: created and joined one room, kept the first move hidden, reconnected with it locked, completed all six turns, reached matching end states, and reset to a rematch draft.
- Live service restart: health recovered and the disposable room’s locked draft remained present.
- Live `/privacy` and `/terms`: 200 with route titles. The designed unknown route intentionally returns 404 and links home.
- Live axe scan: zero serious or critical findings on `/`, `/demo`, `/play`, `/settings`, `/privacy`, and `/terms`.

Evidence is in `/work/.evidence/live/`, including `two-client-end.png`, `demo-end-screen.png`, desktop and phone captures, `verify.json`, and `lighthouse.json`.

## Offer handoff

Public offer metadata is in `.factory/billing-offer.json` and copied to `/work/.evidence/billing-offer.json`.

- Slug: `hand-of-two-complete`
- Name: Hand of Two Complete Edition
- Price: $8 USD one time
- Paid content: nine-card tactical set, six map modifiers, and future scenario packs for this edition
- Return URL: `https://hand-of-two.sociobot.in/`
- License validation path: not assigned

No checkout, entitlement, or activation is claimed. The billing operator must register the offer and provide the license-validation path before purchase can open.

## Known gaps and next steps

1. Billing registration and license validation are external dependencies. Keep the paid content gated until both are verified end to end.
2. The 10–15 minute session range and 30% rematch target have no production cohort yet. They remain research targets, not measured claims.
3. Online rooms require a connection. There is no offline-play claim; the low-connectivity feature is reconnecting without losing the current locked move.
4. Future scenario packs named in the one-time offer are future deliverables. The current complete engine already contains the promised nine card types and six map modifiers.

## Deploy again

```bash
npm ci
npm test
WO_DATA_DIR=/data /opt/fleet/lib/deploy-container.sh hand-of-two-realtime /work/repo Dockerfile 8080
VITE_REALTIME_ORIGIN=https://hand-of-two-realtime.sociobot.in npm run build
/opt/fleet/lib/deploy-static.sh hand-of-two /work/repo/dist
```

Do not increase the realtime service above one replica while it uses SQLite on `/data`.
