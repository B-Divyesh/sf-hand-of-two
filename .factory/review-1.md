# Review 1 — PASS

Date: 6 September 2026
Work order: `hand-of-two-review-1`
Live URL: <https://hand-of-two.sociobot.in>
Implementation candidate reviewed: `56f111fc186ec8ee79d667dbdaa591f85660b238`
Documentation baseline reviewed: `f41f62b9b4a7149f657e917b0bf11cc62152c054`

## Verdict

**PASS — 0 findings; 0 untested declared claims.**

Hand of Two does the stated job: couples and friends can draft weather cards,
hide simultaneous choices from each other, and finish a six-turn shared duel in
two independent browsers. Before scrolling, fresh desktop and 390 by 844 phone
browsers state the job (**Draft cards and predict the other player’s moves**),
the audience, and the first action (**Try it with sample data**). The active
game preview is also present on that screen.

## Candidate and clean setup

The commits after implementation `56f111f` through documentation baseline
`f41f62b` are report-only; they do not change product code. A fresh clone at
that baseline used Node `v22.23.2`, npm `10.9.8`, and `npm ci`. Installation
reported zero vulnerabilities.

- `npm test` passed: 6 unit/SQLite tests and 15 Chromium tests.
- `npm run build` passed and produced `dist/`.
- `npm run test:a11y` passed with no serious or critical Axe issue.
- A fresh default production build exactly hash-matched the live `index.html`
  and JavaScript: index `c5d29756c33c68af52f6b36ad1278a99fcaf5ffc463d2c3d6097bdfc0f3daf29`;
  JavaScript `b935921839009534da66432deac1924d535baf92fc2e6483b70900afb34cfaeb`.
  CSS also matched (`da134129eb070b075045d01404510c06f8fbebacb65dafb1c8fc056e73af4c54`).

## Declared claims

Every exact command from `.factory/claims.json` was run independently from the
clean clone and passed.

| Claim | Command | Result |
| --- | --- | --- |
| demo-sandbox | `npm test -- --grep @claim:demo-sandbox` | Pass |
| six-turn-match | `npm test -- --grep @claim:six-turn-match` | Pass |
| private-requests | `npm test -- --grep @claim:private-requests` | Pass |
| two-client-room | `npm test -- --grep @claim:two-client-room` | Pass |
| one-turn-reconnect | `npm test -- --grep @claim:one-turn-reconnect` | Pass |
| settings-persist | `npm test -- --grep @claim:settings-persist` | Pass |
| one-time-offer | `npm test -- --grep @claim:one-time-offer` | Pass |
| deterministic-sample | `npm run test:unit -- --testNamePattern @claim:deterministic-sample` | Pass |
| room-retention | `npm run test:unit -- --testNamePattern @claim:room-retention` | Pass |
| fixed-deck | `npm run test:unit -- --testNamePattern @claim:fixed-deck` | Pass |

The public page, README, legal pages, and claim inventory agree. The offer is
clearly `$8 USD` once, says it is not a subscription, and keeps purchase and
activation inactive. It does not claim completed checkout.

## Fresh live checks

- The one-click sample began with six populated cards. Its **Demo — sample
  data, nothing is saved** label stayed visible through a six-turn `You win the
  expedition` end screen and six history rows. Reset returned to six cards.
  A pre-existing real settings value was unchanged and there were no `demo:`
  storage keys.
- Two independent fresh contexts created and joined a real room. The host's
  locked first move did not change the guest's score display. Reloading the
  host preserved that locked move. Both clients completed six turns, reached
  complementary win/loss end screens with six history rows, and mutually
  returned to a new draft through rematch.
- The current live health endpoint returned 200. Room creation correctly
  enforced its live allowance: responses became 429 with `Retry-After: 60`.
  The local authoritative SQLite suite covers restart persistence, token-hash
  isolation, expiry, invalid inputs, and cross-room rejection. The last
  independent verification directly restarted the unchanged product-owned
  realtime revision while a move was locked; its persisted state resolved on
  reconnect. This remains applicable because the reviewed realtime
  implementation is unchanged and the static artifact above exact-matches.
- The provided `verify-url.sh` passed against the live root with title, `lang`,
  one heading, one main landmark, no unlabeled buttons or images missing `alt`,
  and no console errors. Fresh live Axe scans of `/`, `/demo`, `/play`,
  `/settings`, `/privacy`, `/terms`, and the designed HTTP 404 had zero serious
  or critical violations. Every route had its own title, one h1, and one main.
- At 200% root text in a 390 px phone context, `scrollWidth` remained 390 px.
  A reduced-motion context had effectively zero transition duration. Same-origin
  links and the one factory link returned 200. Browser traffic during the
  checked paths used only product-owned origins.

## Earlier findings

- Verification 1's critical static-to-realtime-origin fault remains fixed: the
  hash-matched client creates real rooms through the product-owned realtime
  service.
- Verification 2's four minor findings remain fixed: the 200% phone preview
  does not overflow, checked controls meet the target-size regression test,
  social metadata serves the 1200 by 630 PNG, and the expected 404 includes the
  shared header, navigation, skip link, main, footer, and recovery link.
- Verification 3's PASS evidence is consistent with this fresh review. The
  deliberate HTTP 404 is expected behavior, not a defect.

## Evidence

- `/work/.evidence/review-1-desktop-first-screen.png`
- `/work/.evidence/review-1-phone-first-screen.png`
- `/work/.evidence/review-1-phone-200-percent.png`
- `/work/.evidence/review-1-demo-end.png`
- `/work/.evidence/review-1-live-host-end.png`
- `/work/.evidence/review-1-live-guest-end.png`
- `/work/.evidence/review-1-verify-url/verify.json`

No credential, access token, cookie value, player identifier, or room code is
included in this report or named evidence.
