# Hand of Two

Draft three weather cards, predict a friend’s move, and settle a six-turn expedition duel in two browsers. It is for couples and friends who want a small tactical game without accounts, collectible cards, or a long rules lesson.

The brief targets a 10–15 minute session. Launch has no measured timing data yet. Each match always has six simultaneous turns.

## Try the sample

Open `/demo` or select **Try it with sample data** on the first screen. The deterministic sample uses seed 1701 and a practice bot. The banner remains visible, reset returns to the original draft, and leaving discards all sample state. The bot is not evidence of a second player.

## Play with two browsers

One player creates a room and shares its five-character code. A second independent browser joins. Each client drafts a private hand and locks one move per turn. The Node service validates the move, keeps it hidden, and resolves the pair from shared SQLite state. A reload reconnects without losing a locked move from the current turn.

The sample and complete modes each use a fixed 18-card shared deck. The sample contains six card types and one map. The complete edition contains nine card types and six maps.

## Complete edition

The complete edition costs **$8 USD once**. It includes the nine-card tactical set, six map modifiers, and future scenario packs for this edition. It is not a subscription and does not sell stronger cards during play.

Checkout and license activation are not active. The separate billing operator must register the public offer in `/work/.evidence/billing-offer.json`. The free sample remains playable without billing.

## Local setup

Requirements: Node.js 22.5 or later and npm.

```bash
npm ci
npm run build
PORT=4173 DATA_DIR=.data npm run start
```

Open `http://127.0.0.1:4173`. The server serves `dist/`, the room API, and WebSocket connections from one origin.

For client-only development, run `npm run dev` and `npm run dev:server` in separate terminals. Vite proxies `/api` and `/ws` to port 8787.

## Verification

```bash
npm test
npm run build
npm run test:a11y
```

`npm test` runs deterministic rule and SQLite tests, then Playwright tests against a production build. Browser checks cover the sample, two clients, hidden state, reconnect, and rematch. They also cover keyboard structure, mobile layout, legal routes, rate limits, and the 404. Every public claim and its exact command is listed in `.factory/claims.json`.

## Architecture and data

- Vite and vanilla TypeScript produce the static client in `dist/`.
- Hono and `ws` expose the room API and WebSocket service.
- Node’s SQLite module stores room state on `DATA_DIR`.
- Rooms expire after 24 hours. Random player identifiers are stored only as SHA-256 hashes.
- Settings use the `hand-of-two:settings` localStorage key. Demo state uses memory only.
- No analytics, third-party scripts, remote fonts, chat, accounts, or payment details are collected.

For production, the static client sets `VITE_REALTIME_ORIGIN=https://hand-of-two-realtime.sociobot.in`. The realtime container mounts its fleet-created durable volume at `/data` and stays at one replica because it owns SQLite.

## Deploy

The factory owns deployment. Build and deploy the product-specific realtime service first. Deploy the static client second.

```bash
npm ci
npm test
npm run build
WO_DATA_DIR=/data /opt/fleet/lib/deploy-container.sh hand-of-two-realtime /work/repo Dockerfile 8080
VITE_REALTIME_ORIGIN=https://hand-of-two-realtime.sociobot.in npm run build
/opt/fleet/lib/deploy-static.sh hand-of-two /work/repo/dist
```

Do not add payment-provider code or credentials. Billing uses only the Sociobot billing API after offer registration.

## License

MIT. See `LICENSE`.
