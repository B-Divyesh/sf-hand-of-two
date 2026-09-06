# Review 3 — PASS

Date: 6 September 2026
Work order: `hand-of-two-review-3`
Live URL: <https://hand-of-two.sociobot.in>
Implementation candidate reviewed: `56f111fc186ec8ee79d667dbdaa591f85660b238`
Documentation baseline reviewed: `f20e5e30f2f3a6e4214657ad70ba6f37c9b86bae`

## Verdict

**PASS — 0 critical, 0 high, 0 medium, and 0 minor findings; 0 untested public claims.**

Hand of Two does the researched job for couples and friends: two independent
browser clients draft cards, lock hidden choices, and complete a six-turn
tactical duel. Before scrolling, fresh desktop and 390 by 844 touch browsers
showed the job, **Draft cards and predict the other player’s moves**, named the
audience, offered **Try it with sample data**, and displayed active play.

The separately named `factory-evidence/hand-of-two-verify-4/qa-report.md` was
not mounted in this worker. The complete repository report
`.factory/verification-4.md` was read, including its evidence summary and all
prior finding dispositions. This review recreated the required live evidence
instead of relying on the missing external copy.

## Candidate and clean setup

`56f111f` remains the last product implementation commit. Every later commit
through `f20e5e3` changes only `.factory` documentation. The clean setup used
Node `v22.23.2`, npm `10.9.8`, and Playwright `1.58.2`; `npm ci` installed 69
packages with zero reported vulnerabilities.

The live static artifact exactly matches a fresh production build:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `c5d29756c33c68af52f6b36ad1278a99fcaf5ffc463d2c3d6097bdfc0f3daf29` |
| JavaScript | `b935921839009534da66432deac1924d535baf92fc2e6483b70900afb34cfaeb` |
| CSS | `da134129eb070b075045d01404510c06f8fbebacb65dafb1c8fc056e73af4c54` |

The production bundle is 32.52 KB JavaScript raw / 10.62 KB gzip and 12.76
KB CSS raw / 3.70 KB gzip. It remains comfortably below the product budgets.

## Quality gates

| Gate | Result |
| --- | --- |
| `npm test` | Pass: 6 unit/SQLite tests and 15 Chromium browser tests |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:a11y` | Pass; six application routes had no serious or critical Axe issue |
| `verify-url.sh` on the live root | Pass; title, language, h1, main, alternatives, labels, and zero load errors |

The unchanged hash-matched artifact retains Verification 4's Lighthouse
scores of 100 Performance, 100 Accessibility, 100 Best Practices, and 100
SEO, with 1.0 s LCP, zero CLS, and 30 ms total blocking time. This review
measured a diagnostic 61.0 animation frames per second in Chromium. Frame rate
is not a public product claim; the turn-based game renders on state changes.

## Declared claims

Every exact command in `.factory/claims.json` was run separately and passed.

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-sandbox` | `npm test -- --grep @claim:demo-sandbox` | Pass |
| `six-turn-match` | `npm test -- --grep @claim:six-turn-match` | Pass |
| `private-requests` | `npm test -- --grep @claim:private-requests` | Pass |
| `two-client-room` | `npm test -- --grep @claim:two-client-room` | Pass |
| `one-turn-reconnect` | `npm test -- --grep @claim:one-turn-reconnect` | Pass |
| `settings-persist` | `npm test -- --grep @claim:settings-persist` | Pass |
| `one-time-offer` | `npm test -- --grep @claim:one-time-offer` | Pass |
| `deterministic-sample` | `npm run test:unit -- --testNamePattern @claim:deterministic-sample` | Pass |
| `room-retention` | `npm run test:unit -- --testNamePattern @claim:room-retention` | Pass |
| `fixed-deck` | `npm run test:unit -- --testNamePattern @claim:fixed-deck` | Pass |

Landing, game, legal, README, demo, and public offer copy were cross-checked
against the inventory. No missing, false, incomplete, or untested public claim
was found. The complete edition is consistently **$8 USD once**, not a
subscription, and includes the nine-card tactical set, six map modifiers, and
future scenario packs for this edition. Checkout and activation remain
disabled and are not claimed to work.

## Fresh live sample and game run

The one-click phone sample opened a populated six-card Crosswind draft. Its
**Demo — sample data, nothing is saved** label stayed present throughout. A
touch-controlled deterministic run reached **You win the expedition**, showed
all six history entries, and returned to a fresh draft through both replay and
**Reset demo**. A pre-existing real setting remained unchanged, and the sample
created no `demo:` storage key. Keyboard Space also selected a card.

For real multiplayer, a fresh desktop context created a room and a separate
fresh phone/touch context joined it. Both drafted private cards. The first
locked move remained hidden and did not change the other score. Reloading the
locked client preserved that move, and the second client resolved the game to
turn two. Both clients completed six turns, reached complementary end screens
with six history entries, and mutually returned to a fresh draft through
rematch. Enabled sound constructed a real browser audio context after a user
gesture. A third client was rejected with 409, and a player credential created
for another room was rejected by the authoritative WebSocket service.

The run is recorded as status-only machine evidence in
`/work/.evidence/review-3-live-results.json`; the sample and both end screens
are captured separately. No credential, access token, cookie value, player
identifier, or room code appears in the evidence or this report.

## Routes, accessibility, privacy, and recovery

- `/`, `/demo`, `/play`, `/settings`, `/privacy`, and `/terms` returned 200
  with unique route titles, one h1, one main landmark, and zero serious or
  critical live Axe findings.
- The deliberate unknown route returned HTTP 404 with its own title, the
  shared header, navigation, skip link, main, footer, and a home action. Its
  expected 404 status is not a defect.
- Keyboard skip navigation moved focus into main content. SPA navigation,
  back, and forward focused the route h1. Space selected a game card.
- At 390 px, normal and 200% text views had no horizontal overflow or clipped
  preview cells. Nine checked navigation, demo, and footer targets were at
  least 44 by 44 CSS pixels on phone and desktop.
- Reduced motion removed the checked transition. Sound and motion persistence
  passed the declared settings claim.
- Unknown-room and offline room-creation errors gave direct recovery text.
  The product makes no offline-play or update claim and ships no service
  worker.
- Sample and live-game traffic used only `hand-of-two.sociobot.in` and the
  product-owned `hand-of-two-realtime.sociobot.in`. No analytics, remote font,
  third-party script, or checkout request appeared.
- Privacy provides a deletion-request address and tells players not to send a
  player identifier. All application, metadata, and factory links returned
  200; the social image remains a supported 1200 by 630 PNG.
- Live responses retain CSP, HSTS, `X-Content-Type-Options`, Referrer Policy,
  and Permissions Policy headers.

## Backend checks

- The product-owned health endpoint returned 200 with `{"status":"ok"}`.
- A fresh allowance bucket returned twelve 201 responses, followed by 429
  with `Retry-After: 60`.
- Live third-seat and cross-room credential rejection passed.
- The clean local SQLite suite closed and reopened its database while
  retaining both seats and shared draft state. The retention claim also
  confirmed 24-hour expiry and SHA-256 player-token hashes without storing the
  source token.
- A live service restart was not repeated because the implementation is
  unchanged at `7158d8607ef02094bc105fb16f7fc1cb44fedab7`. Verification 2's
  direct live restart evidence remains applicable; this review independently
  repeated reload recovery and the isolated SQLite restart test.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1 critical: live room creation posted to the static origin | Closed. The hash-matched live client uses the product-owned realtime origin; fresh clients created, joined, reconnected, completed, and rematched. |
| Verification 2 minor: active preview clipped at 200% text | Closed. Fresh 390 px resize kept every preview cell visible with no overflow. |
| Verification 2 minor: phone targets below 44 px | Closed. All nine checked header, demo, and footer targets met 44 by 44 CSS pixels. |
| Verification 2 minor: SVG social image unsupported | Closed. Metadata serves an HTTP 200 1200 by 630 PNG. |
| Verification 2 minor: 404 omitted the shared skeleton | Closed. The fresh expected 404 retained the complete skeleton and had no serious or critical Axe issue. |
| Verification 3, Reviews 1–2, and Verification 4 PASS results | Confirmed by the clean commands and fresh live run above. |

Billing registration and license activation remain external work, not a
product defect. The site labels purchase setup as pending and keeps the sample
playable. The researched 10–15 minute duration and 30% immediate-rematch goal
remain targets rather than public measured results. A generative AI feature
would not improve the brief's deterministic shared-prediction job, so its
absence is not missed leverage.

## Evidence

- Machine-readable live run: `/work/.evidence/review-3-live-results.json`
- Live URL verifier: `/work/.evidence/review-3-verify-url/verify.json`
- First screens: `/work/.evidence/review-3-desktop-first-screen.png` and
  `/work/.evidence/review-3-phone-first-screen.png`
- Sample ending: `/work/.evidence/review-3-demo-end.png`
- Real endings: `/work/.evidence/review-3-live-host-end.png` and
  `/work/.evidence/review-3-live-guest-end.png`
- Designed expected 404: `/work/.evidence/review-3-live-404.png`

Finding count: **0**
Untested public claim count: **0**
Final verdict: **PASS**
