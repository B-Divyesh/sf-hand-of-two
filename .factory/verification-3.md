# Verification 3 — PASS

Date: 6 September 2026
Work order: `hand-of-two-verify-3`
Live URL: <https://hand-of-two.sociobot.in>
Implementation candidate reviewed: `56f111fc186ec8ee79d667dbdaa591f85660b238`
Documentation candidate reviewed: `a3ace4a4f25ea06bd222262dc6c7b9c1d967b98f`

## Verdict

**PASS — 0 findings; 0 untested declared claims.**

Hand of Two is a room-code, two-browser, six-turn card duel for couples and
friends. On the first screen, the job is **Draft cards and predict the other
player’s moves**. It identifies the audience and presents **Try it with sample
data** as the first action, with an active game preview already on screen.

## Prior finding disposition

All earlier findings are closed.

- Verification 1 critical: fixed. The deployed static build calls the
  product-owned realtime origin. A fresh live two-client match created, joined,
  hid the first move, reconnected after a locked move, reached both end screens,
  and started a rematch.
- Verification 2 minor 1: fixed. In a fresh 390 by 844 phone browser with root
  text set to 32 px, scroll width stayed 390 px and every preview score cell
  remained visible within the viewport.
- Verification 2 minor 2: fixed. The checked header, demo-banner, and footer
  controls met 44 by 44 CSS px on phone and desktop in the regression suite.
- Verification 2 minor 3: fixed. `og:image` and `twitter:image` resolve to the
  same HTTP 200 `image/png`; its PNG header is 1200 by 630.
- Verification 2 minor 4: fixed. The deliberate HTTP 404 now has the standard
  banner, main navigation, skip link, main landmark, footer, one h1, and a home
  recovery action. The 404 status itself is expected.

## Clean setup and quality gates

Clean setup used Node `v22.23.2`, npm `10.9.8`, and `npm ci`; npm reported zero
vulnerabilities.

| Gate | Result |
| --- | --- |
| `npm test` | Pass: 6 unit/SQLite tests and 15 Chromium browser tests |
| `npm run build` | Pass; `dist/` produced |
| `npm run test:a11y` | Pass; all six application routes had no serious or critical Axe issue |
| Live Axe scan | Pass; six application routes and the 404 had no serious or critical issue |
| Live Lighthouse mobile | 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO |

The independent Lighthouse run measured LCP 1.0 s, CLS 0, and total blocking
time 30 ms. The current production build is 32.52 KB JavaScript raw / 10.65 KB
gzip and 12.76 KB CSS raw / 3.70 KB gzip.

The live `index.html`, JavaScript, and CSS SHA-256 values exactly match a fresh
production build from `56f111f`. No later documentation-only commit was treated
as a new product image.

## Declared claims

Every exact command in `.factory/claims.json` ran independently and passed.

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

The live landing copy, legal pages, and README were compared with the claim
inventory. No false, missing, incomplete, or untested public claim was found.
Checkout and activation remain explicitly inactive and are not claimed to work.

## Live browser checks

Fresh desktop and 390 by 844 phone contexts loaded without console errors. Both
showed the job, audience, sample action, and game preview before scrolling. The
phone page had no horizontal overflow at normal or 200% text size.

The one-click sample opened a populated six-card Crosswind match. Its persistent
**Demo — sample data, nothing is saved** label remained through a six-turn
`You win the expedition` end screen with six history rows. Restart and Reset
demo returned to a fresh draft. A pre-existing real settings value remained
unchanged, and no demo storage key was created. Sample requests stayed on the
static product origin.

Two fresh, independent browser contexts then used a real room. The host's first
locked choice did not change the guest view. Reloading the host preserved that
locked choice; the guest resolved the turn. Both clients completed six turns,
showed complementary win/loss end screens with six history rows, and mutually
started a fresh rematch draft. A third independent client was rejected.

The tested routes `/`, `/demo`, `/play`, `/settings`, `/privacy`, and
`/terms` all returned 200, with their own titles, exactly one h1, and exactly
one main landmark. The link crawl found no broken same-origin links. Keyboard
selection, visible focus, reduced-motion persistence, invalid room input, and
offline request recovery passed in the candidate suite.

## Backend, privacy, and offer

- Realtime health returned HTTP 200 with the status-only healthy response.
- A player credential from one room was rejected for another room. No value was
  retained or written to evidence.
- A fresh live allowance bucket produced 12 HTTP 201 room creations, followed
  by HTTP 429 with `Retry-After: 60`.
- Browser traffic observed during the sample and game flows used only the static
  product and its product-owned realtime origin. No third-party scripts, fonts,
  analytics, accounts, or checkout traffic appeared.
- The complete edition consistently says `$8 USD` once, not a subscription. The
  purchase control is disabled and no checkout request occurs.

Billing registration and license activation remain the only external gap. This
is honestly disclosed; it is not an untested checkout claim. The researched
10–15 minute match duration and 30% rematch target are not presented as measured
production results.

## Evidence

- Desktop first screen: `/work/.evidence/verification-3-desktop-first-screen.png`
- Phone first screen and 200% text: `/work/.evidence/verification-3-phone-first-screen.png` and `/work/.evidence/verification-3-phone-200-percent.png`
- Demo end screen: `/work/.evidence/verification-3-live-demo-end.png`
- Real two-client end screens: `/work/.evidence/verification-3-live-two-client-host-end.png` and `/work/.evidence/verification-3-live-two-client-guest-end.png`
- Designed 404: `/work/.evidence/verification-3-live-404.png`
- Mobile Lighthouse JSON: `/work/.evidence/verification-3-lighthouse.json`

No credential, access token, cookie value, player identifier, or room code is
included in this report or named evidence.
