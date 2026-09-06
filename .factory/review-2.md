# Review 2 — PASS

Date: 6 September 2026
Work order: `hand-of-two-review-2`
Live URL: <https://hand-of-two.sociobot.in>
Implementation candidate reviewed: `56f111fc186ec8ee79d667dbdaa591f85660b238`
Documentation candidate reviewed: `e270ea0a72a33099fbdd7dfe7763f30412e0d7fe`

## Verdict

**PASS — 0 findings; 0 untested declared claims.**

Hand of Two is a two-browser card duel for couples and friends. Before
scrolling, fresh 1280 by 900 desktop and 390 by 844 phone browsers stated the
job, **Draft cards and predict the other player’s moves**, identified the
audience, and offered **Try it with sample data**. The active-game preview was
on the first screen in both layouts.

## Candidate and local verification

`56f111f` is the last implementation commit. All later commits through
`e270ea0` change only `.factory` reports and release documentation. A clean
Node 22.23.2 and npm 10.9.8 setup ran `npm ci` with zero vulnerabilities.

- `npm test` passed: 6 unit/SQLite tests and 15 Chromium tests.
- `npm run build` passed and produced `dist/`.
- `npm run test:a11y` passed with no serious or critical Axe violation.
- The production build exactly matched live: `index.html`
  `c5d29756c33c68af52f6b36ad1278a99fcaf5ffc463d2c3d6097bdfc0f3daf29`,
  JavaScript `b935921839009534da66432deac1924d535baf92fc2e6483b70900afb34cfaeb`,
  and CSS `da134129eb070b075045d01404510c06f8fbebacb65dafb1c8fc056e73af4c54`.

Every exact command declared by `.factory/claims.json` passed independently:

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

The landing copy, README, legal pages, and claims inventory agree. The $8 USD
complete edition is clearly one-time, not a subscription. Checkout and license
activation are explicitly inactive, so no checkout success is claimed.

## Live game and device checks

- The one-click sample started with six populated cards. Its persistent
  **Demo — sample data, nothing is saved** label remained through a six-turn
  end screen and six history entries. Keyboard card selection worked. Both
  sample restart and Reset demo returned to the fresh six-card draft.
- Two fresh, independent browser contexts created and joined one live room.
  A third join was rejected. The host’s first locked move did not change the
  guest score or reveal the move. Reloading the host retained that lock; the
  guest then resolved turn one. Both clients completed six turns, reached their
  end screens with six history entries, and mutually started a fresh rematch.
- A credential from one room was rejected for a different room. No credential,
  player identifier, cookie value, or room code appears in this report or its
  saved end-screen evidence.
- A phone at 200% root text retained a 390 px document width. Checked header
  and footer controls met the 44 px target. Normal page loads had no console
  errors. Demo and room traffic used only the static product and its
  product-owned realtime origin.
- Sound and reduced-motion settings persisted after reload; reduced motion
  removed the checked transition. Invalid room entry and offline room creation
  showed recovery guidance.

## Routes, accessibility, backend, and privacy

`verify-url.sh` passed for the live root: title, `lang`, one h1, main landmark,
image alternatives, labeled buttons, and zero console errors. Playwright Axe
found no serious or critical issues on `/`, `/demo`, `/play`, `/settings`,
`/privacy`, `/terms`, or the designed HTTP 404. Each application route returned
200 with its own title, one h1, and one main. The deliberate 404 returned 404,
kept the shared header and footer, and provided a home link.

The product-owned realtime health endpoint returned 200. A fresh live allowance
bucket produced 12 room creations, then 429 with `Retry-After: 60`. The current
cross-room rejection proves tenant separation. The `room-retention` SQLite
claim command passed restart-persistence coverage locally. The direct live
restart-persistence evidence in Verification 3 remains applicable because the
realtime implementation is unchanged at `7158d8607ef02094bc105fb16f7fc1cb44fedab7`;
this review’s static artifact exactly matches the unchanged implementation
candidate.

## Earlier findings

- Verification 1’s critical static-to-realtime routing fault remains fixed:
  this fresh live run created, joined, reconnected, completed, and rematched
  through the product-owned realtime service.
- Verification 2’s four minor findings remain fixed: 200% phone layout did
  not overflow; checked touch targets were at least 44 px; the social image is
  a 1200 by 630 PNG; and the expected 404 has the shared site skeleton.
- Verification 3 and Review 1 PASS evidence is consistent with this review.
  The HTTP 404 is deliberate expected behavior, not a defect.

## Evidence

- `/work/.evidence/review-2-desktop-first-screen.png`
- `/work/.evidence/review-2-phone-first-screen.png`
- `/work/.evidence/review-2-demo-end.png`
- `/work/.evidence/review-2-live-host-end.png`
- `/work/.evidence/review-2-live-guest-end.png`
- `/work/.evidence/review-2-live-404.png`
- `/work/.evidence/review-2-verify-url/verify.json`
