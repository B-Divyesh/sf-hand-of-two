# Hand of Two handoff

Date: 6 September 2026
Work order: `hand-of-two-repair-2`
Artifact class: `browser-game`
Live product: <https://hand-of-two.sociobot.in>
Realtime health: <https://hand-of-two-realtime.sociobot.in/api/health>
Implementation SHA deployed to the static site and realtime service: `7158d8607ef02094bc105fb16f7fc1cb44fedab7`

## Repair completed

Independent verification found that live room creation fell back to the static host and received HTTP 405. The static bundle had been built without `VITE_REALTIME_ORIGIN`.

The public product-owned realtime URL is now a tracked production build input in `.env.production`. A normal `npm run build` embeds `https://hand-of-two-realtime.sociobot.in` in the static client. The Docker build includes the same public input. Local and browser tests deliberately override that origin with a separate local realtime service, so they prove a real cross-origin API and WebSocket path rather than accidentally using the static server's API.

The browser regression creates a room from the configured static build and asserts the observable POST goes to the separate realtime origin, reaches the room-ready state, and is not sent to the static page origin. It does not inspect source strings.

## Product behaviour

- A deterministic finite duel with one fixed 18-card shared deck.
- Two independent clients draft private cards and play six simultaneous turns. The server validates, hides, and resolves both moves.
- A reload reconnects without losing a locked current-turn move. Mutual rematch starts a new draft.
- The one-click demo uses only memory, retains its sample label, resets to its seeded draft, and never changes real settings. Its bot is clearly practice only, never multiplayer evidence.
- The first screen names the actual play: **Draft cards and predict the other player’s moves**. It names couples and friends as the audience, shows the first sample action, and shows active play before scrolling.
- The complete edition remains a public **$8 USD one-time** offer. It includes the nine-card tactical set, six map modifiers, and future scenario packs. Checkout and activation remain unavailable until external billing registration; no subscription or successful purchase is claimed.

## Runtime and privacy

The Vite static client calls only the product-owned realtime service. Hono, WebSockets, and SQLite provide server-authoritative rooms. SQLite persists on the fleet-created `/data` mount; the realtime app remains one replica. Rooms expire after 24 hours and player identifiers are stored only as hashes. Browser settings use `hand-of-two:settings`; demo state is memory-only.

There are no accounts, analytics, third-party scripts, remote fonts, chat records, or payment credentials. The product makes no offline-play claim. It supports reconnecting an online room without losing a locked move.

## Verification

Clean setup:

```bash
npm ci
npm test
npm run build
npm run test:a11y
```

- `npm test`: 6 unit/integration tests and 13 Chromium tests passed.
- Every exact command in `.factory/claims.json` passed individually from the clean dependency install.
- `npm run build`: passed and produced `dist/`. The production client is 32.52 KB raw / 10.65 KB gzip; CSS is 12.39 KB raw / 3.66 KB gzip.
- `npm run test:a11y`: passed. Axe found zero serious or critical findings on all six application routes.
- The configured-origin regression, invalid room, third-seat rejection, offline recovery, keyboard selection, mobile layout, legal routes, reduced motion, SQLite restart persistence, 429 with `Retry-After: 60`, and designed 404 all passed locally.

Fresh live verification after deployment:

- The static asset contained the product-owned realtime origin. A new room POST went there, not to the static origin.
- Fresh desktop and 390×844 phone contexts showed the job, audience, first action, and active game preview before scrolling. The phone had no horizontal overflow.
- The live demo showed six cards, kept **Demo — sample data, nothing is saved**, reset correctly, reached an end screen with six history rows, and left a pre-existing real setting unchanged.
- Two fresh independent browser contexts created and joined a room, drafted, kept the first move hidden, completed all six turns, reached both end screens, and mutually rematched. Reloading after a locked move restored it and proceeded to turn two.
- A third join request against an occupied live room returned 409.
- The active product-owned realtime revision was restarted during a locked-move test. Health recovered, the locked move persisted, and the next move resolved successfully.
- Live `/`, `/demo`, `/play`, `/settings`, `/privacy`, and `/terms` returned 200 with route titles, one main landmark, and one h1. Live Axe found zero serious or critical findings. The designed unknown route returned the expected HTTP 404 and linked home.
- Live rate allowance returned twelve 201 responses then 429 with `Retry-After: 60`; health returned the status-only healthy response.
- No console errors occurred during the fresh demo and two-client run.

Evidence includes `/work/.evidence/repair-2-phone-first-screen.png`, `/work/.evidence/repair-2-demo-end.png`, and `/work/.evidence/repair-2-two-client-end.png`. The public billing offer and catalog description are copied to `/work/.evidence/`.

## Earlier verification disposition

`verification-1`'s sole critical finding is fixed. The static deployment now gets its public realtime origin from the durable production build input, and a fresh live two-client creation, reconnect, full match, rematch, restart-persistence, and rate-limit check passed. That report listed no minor findings. Billing registration, measured cohort duration, and rematch rate were explicitly known gaps rather than failed claims; they remain so.

## Known gaps and next steps

1. The external billing operator must register the public offer and supply a license-validation path before checkout can open. The paid content and $8 one-time terms remain preserved.
2. The researched 10–15 minute target and 30% immediate-rematch target have no production cohort data. They are not presented as measured results.
3. Future scenario packs are future paid deliverables. The current complete edition already has the advertised nine-card fixed deck and six map modifiers.

## Deploy

```bash
npm ci
npm test
npm run build
WO_DATA_DIR=/data /opt/fleet/lib/deploy-container.sh hand-of-two-realtime /work/repo Dockerfile 8080
/opt/fleet/lib/deploy-static.sh hand-of-two /work/repo/dist
```

Do not raise the realtime service above one replica while it uses SQLite on `/data`.
