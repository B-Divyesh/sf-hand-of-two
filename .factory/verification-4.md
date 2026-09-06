# Verification 4 — PASS

Date: 6 September 2026
Work order: `hand-of-two-verify-4`
Live URL: <https://hand-of-two.sociobot.in>
Implementation candidate reviewed: `56f111fc186ec8ee79d667dbdaa591f85660b238`
Documentation baseline reviewed: `7aa79152a5b9113f43cb91d062293e4b7f5a32ac`

## Verdict

**PASS — 0 critical, 0 high, 0 medium, and 0 minor findings; 0 untested public claims.**

Hand of Two does the researched job for couples and friends: two independent
browser clients draft cards, lock hidden choices, and finish a six-turn duel
through a win, loss, or draw. Fresh desktop and 390 by 844 phone views state
the job, **Draft cards and predict the other player’s moves**, name the
audience, and show **Try it with sample data** beside the active game before
scrolling.

This qualification extends the earlier Chromium work. Complete live sample
and real multiplayer runs passed in Chromium, Firefox, and WebKit.

## Candidate and clean setup

`56f111f` is the last product implementation commit. Every later commit through
`7aa7915` changes only `.factory` reports and release documentation. The clean
checkout used Node `v22.23.2`, npm `10.9.8`, and Playwright `1.58.2`.
`npm ci` installed 69 packages with zero reported vulnerabilities.

The released static artifact exactly matches a fresh production build:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `c5d29756c33c68af52f6b36ad1278a99fcaf5ffc463d2c3d6097bdfc0f3daf29` |
| JavaScript | `b935921839009534da66432deac1924d535baf92fc2e6483b70900afb34cfaeb` |
| CSS | `da134129eb070b075045d01404510c06f8fbebacb65dafb1c8fc056e73af4c54` |

The production bundle is 32.52 KB JavaScript raw / 10.62 KB gzip and 12.76
KB CSS raw / 3.70 KB gzip. It remains well below the product budgets.

## Clean-checkout gates

| Gate | Result |
| --- | --- |
| `npm test` | Pass: 6 unit/SQLite tests and 15 Chromium browser tests |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:a11y` | Pass; all six application routes had no serious or critical Axe issue |
| `verify-url.sh` on live root | Pass; title, language, h1, main, alternatives, labels, and zero load errors |

The prior fresh Lighthouse result remains applicable because the live HTML,
JavaScript, and CSS are byte-identical to the reviewed candidate: 100
Performance, 100 Accessibility, 100 Best Practices, and 100 SEO; LCP 1.0 s,
CLS 0, and total blocking time 30 ms. This engine-extension run did not repeat
Lighthouse.

## Declared claims

Every exact command in `.factory/claims.json` was run independently from the
clean checkout and passed.

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

The landing page, README, privacy page, terms, and offer metadata were
cross-checked against the inventory. The complete content contains 18 card
instances across nine card types and six map modifiers. The public offer is
consistently `$8 USD` once, not a subscription. Checkout and activation remain
disabled and are not claimed to have passed.

## Browser-engine qualification

| Engine | Phone and desktop | Sample to ending | Independent live clients | Reload and rematch | Audio startup | Clean console | Root Axe serious/critical | Diagnostic rAF rate |
| --- | --- | --- | --- | --- | --- | --- | ---: | ---: |
| Chromium `145.0.7632.6` | Pass | Pass | Pass | Pass | 6 contexts | 0 errors | 0 | 61.6 fps |
| Firefox `146.0.1` | Pass | Pass | Pass | Pass | 6 contexts | 0 errors | 0 | 61.9 fps |
| WebKit `26.0` | Pass | Pass | Pass | Pass | 6 contexts | 0 errors | 0 | 62.7 fps |

Each engine used a fresh 390 by 844, 2x touch context for the phone player and
a fresh 1280 by 900 context for the other player. Chromium and WebKit used
Playwright mobile emulation. Playwright does not expose its `isMobile` option
for Firefox, so Firefox used the same phone viewport and touch input without a
mobile user-agent override.

The measured animation-frame rates are diagnostic observations on this worker,
not a public 60 fps claim. The game uses event-driven rendering. Sound was
enabled through a user gesture before play; each engine constructed a real
browser audio context on all six resolved turns without an error.

## Live gameplay evidence

For the sample in every engine:

- The one-click entry opened a populated six-card Crosswind draft.
- **Demo — sample data, nothing is saved** stayed visible through the end.
- A deterministic six-turn run reached an actual end screen and six history
  rows.
- **Reset demo** returned to the original six-card draft.
- A pre-existing real settings value was unchanged, and no `demo:` storage key
  appeared.

For real multiplayer in every engine:

- A touch client created a room and a separate desktop context joined it.
- Both clients drafted private cards. The first locked move stayed hidden and
  did not change the other score.
- Reloading the phone client preserved its locked move. The other client then
  resolved turn one, and both clients continued from turn two.
- Both clients completed all six turns, reached complementary end screens with
  six history entries, and mutually returned to a fresh draft through rematch.
- Keyboard Space selected a card in the desktop client. Touch input completed
  the phone client’s draft, moves, and rematch.

A third independent join was rejected with 409. A credential created for one
room was rejected against a different room. No credential, access token,
cookie value, player identifier, or room code is present in the report or
screenshots.

## Routes, accessibility, privacy, and recovery

- `/`, `/demo`, `/play`, `/settings`, `/privacy`, and `/terms` returned 200 in
  every engine with route-specific titles, one h1, and one main landmark.
- The deliberate unknown route returned the expected HTTP 404 with the shared
  header, navigation, skip link, main, footer, and home action. The 404 status
  is expected behavior, not a defect.
- Keyboard skip navigation moved focus into the main content. SPA navigation,
  back, and forward moved focus to the route h1 in all three engines. The
  keyboard focus outline measured at least 3 CSS pixels.
- The 390 px phone layout had no horizontal overflow at normal or 200% root
  text size. Reduced-motion settings removed the checked transition and
  persisted after reload. Checked navigation, demo, and footer targets remain
  at least 44 by 44 CSS pixels.
- Invalid room entry and offline room creation showed actionable recovery
  text. No offline-play or update behavior is publicly promised, and no
  service worker is shipped.
- Browser traffic during sample and real play used only
  `hand-of-two.sociobot.in` and the product-owned
  `hand-of-two-realtime.sociobot.in`. No third-party scripts, remote fonts,
  analytics, or checkout requests appeared.
- All linked application routes, static metadata assets, and the Param Factory
  external link returned 200. The social image remains a 1200 by 630 PNG.

WebKit logs a CSP warning when Playwright injects a temporary inline stylesheet
for a full-page screenshot or Axe scan. The verifier isolated those operations
and proved that the product load and gameplay itself produce zero console
errors. This is test instrumentation, not a product defect.

## Backend checks

- The live product-owned health endpoint returned 200 with `{"status":"ok"}`.
- A fresh allowance bucket returned twelve 201 responses, followed by 429 with
  `Retry-After: 60`.
- Live cross-room credential rejection and third-seat rejection passed.
- The isolated SQLite test reopened the database after a service shutdown and
  preserved both seats and shared draft state. The retention test confirmed a
  24-hour expiry and SHA-256 token hashes without storing the source token.
- The live service was not restarted in this work order because the assignment
  requires preserving the released candidate. Verification 2’s direct live
  restart evidence remains applicable; the realtime implementation is
  unchanged at `7158d8607ef02094bc105fb16f7fc1cb44fedab7`.

## Public support and worker boundaries

The public product does not name a minimum browser version or promise Firefox,
Safari, or another browser brand. “Two independent browser clients” describes
the multiplayer topology, not a browser support matrix. This run nevertheless
proves current Chromium, Firefox, and Playwright WebKit engine compatibility.

This worker has no physical phone, audible output device, or branded Safari
installation. Phone checks used browser touch emulation, audio startup was
verified through real audio-context construction, and WebKit `26.0` is the
Playwright engine rather than Safari. No required public claim remains untested
because none promises a particular physical device or branded browser.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| Verification 1 critical: live room creation used the static origin and returned 405 | Closed. The hash-matched client uses the product-owned realtime origin; all three engines created, joined, completed, reconnected, and rematched. |
| Verification 2 minor: active preview clipped at 200% text | Closed. The 390 px resize check retains all content without horizontal overflow. |
| Verification 2 minor: phone targets below 44 px | Closed. Candidate regression coverage and fresh phone interaction pass. |
| Verification 2 minor: SVG social image unsupported | Closed. Metadata serves the HTTP 200 1200 by 630 PNG. |
| Verification 2 minor: 404 omitted shared skeleton | Closed. The expected live 404 has the complete shared skeleton in all three engines. |
| Verification 3, Review 1, and Review 2 PASS results | Confirmed. Fresh clean-checkout and live evidence remains consistent. |

Billing registration remains external work, not a product defect. The site
honestly labels purchase setup as pending and keeps the free sample available.
The researched 10–15 minute duration and 30% rematch target remain targets, not
measured public results.

## Evidence

- Machine-readable browser matrix:
  `/work/.evidence/verification-4-browser-results.json`
- Live URL verifier: `/work/.evidence/verification-4-verify-url/verify.json`
- Phone first screens:
  `/work/.evidence/verification-4-{chromium,firefox,webkit}-phone-first-screen.png`
- Sample endings:
  `/work/.evidence/verification-4-{chromium,firefox,webkit}-demo-end.png`
- Real end screens:
  `/work/.evidence/verification-4-{chromium,firefox,webkit}-live-{host,guest}-end.png`
- Recorded phone-client runs: paths are listed in
  `/work/.evidence/verification-4-browser-results.json`

Finding count: **0**
Untested public claim count: **0**
Final verdict: **PASS**
