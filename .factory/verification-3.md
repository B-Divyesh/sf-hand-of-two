# Repair verification 3 — PASS

Date: 6 September 2026
Work order: `hand-of-two-repair-3`
Live URL: <https://hand-of-two.sociobot.in>
Static implementation: `56f111fc186ec8ee79d667dbdaa591f85660b238`
Realtime implementation: `7158d8607ef02094bc105fb16f7fc1cb44fedab7` (unchanged)
Documentation candidate: pending report commit

## Verdict

**PASS — the four minor findings from Verification 2 are fixed. All declared
claims passed, and no current product defect remains open.**

## Finding disposition

### Verification 2 minor 1 — fixed

The small-screen score grid no longer uses two inflexible 4 rem columns. Its
two numeric columns are bounded inside the available width. In a fresh 390 px
phone browser with the root text size increased from 16 px to 32 px, every
rendered score cell had a visible rectangle between x=0 and x=390. The `Other`
column was no longer clipped.

Evidence: `/work/.evidence/repair-3-live-phone-200-percent.png`.

### Verification 2 minor 2 — fixed

Navigation, demo-banner, and footer links now render at least 44×44 CSS pixels.
The regression check measures every affected element in fresh 390 px and 1280
px contexts. The live check repeated the measurement.

### Verification 2 minor 3 — fixed

Both social-card tags now resolve to the same original 1200×630 PNG. A browser
request received HTTP 200 and `image/png`; the PNG header reported dimensions
of 1200×630. The 85 KB image is a raster export of the hand-authored SVG and
introduces no third-party asset.

### Verification 2 minor 4 — fixed

An unknown URL still returns the deliberate HTTP 404. The rendered response now
has the standard skip link, wordmark header, main navigation, one main landmark,
one h1, footer navigation, version line, and home recovery action. Axe reports
no serious or critical issue on that page.

Evidence: `/work/.evidence/repair-3-live-404.png`.

### Earlier Verification 1 critical finding — remains fixed

The live static bundle still calls the product-owned realtime origin. The final
candidate completed an independent two-client match, and live HTML, JavaScript,
and CSS matched the local production build byte for byte.

## Clean setup and quality gates

Setup used Node `v22.23.2`, npm `10.9.8`, and `npm ci`. npm reported zero
vulnerabilities.

| Gate | Result |
| --- | --- |
| `npm test` | Pass: 6 unit/SQLite and 15 Chromium tests |
| `npm run build` | Pass: `dist/` produced |
| `npm run test:a11y` | Pass: six routes, no serious/critical Axe issue |
| Factory `verify-url.sh` | Pass: HTTPS 200, required structure, zero console errors |
| Standalone Axe CLI 4.13.0 | Pass: 0 violations |
| Lighthouse mobile | 100 Performance, 100 Accessibility, 100 Best Practices, 100 SEO |

The standalone Axe command first required the tool's documented matching
Chrome/ChromeDriver prerequisite. After installing that prerequisite, the live
scan completed successfully. No declared product command required an
undocumented dependency.

Production bundle measurements:

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| JavaScript | 32.52 KB | 10.62 KB |
| CSS | 12.76 KB | 3.70 KB |

Lighthouse reported LCP 946 ms, CLS 0, and total blocking time 25 ms. A
two-second requestAnimationFrame sample in a fresh phone context measured 60.6
frames per second. The public product makes no frame-rate claim.

## Declared claims

Every exact command in `.factory/claims.json` ran against the final candidate:

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

The live copy and README were cross-checked with the inventory. Checkout and
activation remain explicitly inactive, so neither is claimed as working.

## Live browser-game run

Fresh desktop and 390×844 phone contexts showed the actual game before
scrolling. The first screen names the job, identifies couples and friends, and
offers the one-click sample next to its outcome.

The sample began with six real cards and the Crosswind pass. The persistent
banner remained through all six turns. The run reached `You win the expedition`
with six history rows. Restart and Reset demo restored the untouched draft.
A pre-existing real settings value did not change.

Two independent fresh contexts then created and joined a live room. The first
host move stayed hidden from the guest. Reload restored that locked move. Both
clients completed six turns, reached their own matching end states, and started
a rematch. A third seat was rejected.

Evidence:

- `/work/.evidence/repair-3-live-demo-end.png`
- `/work/.evidence/repair-3-live-two-client-host-run.webm`
- `/work/.evidence/repair-3-live-two-client-guest-run.webm`
- `/work/.evidence/repair-3-live-two-client-host-end.png`
- `/work/.evidence/repair-3-live-two-client-guest-end.png`

## Backend and isolation

- `GET /api/health` returned 200 with the expected status-only response.
- A player identifier from one room was rejected when sent for another room.
- Restarting only `sf-hand-of-two-realtime` while one move was locked preserved
  the move; both clients reconnected and resolved turn 1.
- The exact product resource remains at one minimum/maximum replica with `/data`
  mounted.
- A new allowance bucket produced twelve 201 responses, then 429 with
  `Retry-After: 60`.

No identifier, access token, cookie, secret, or credential was logged or added
to evidence.

## Routes, privacy, recovery, and links

`/`, `/demo`, `/play`, `/settings`, `/privacy`, and `/terms` returned 200 with
their route-specific titles, one h1, and one main landmark. Same-origin links
resolved. Keyboard selection, visible focus, reduced motion, saved settings,
invalid room input, offline room-creation recovery, and deliberate 404 behavior
passed in the candidate suite. Browser traffic during claim tests stayed on the
static product and its product-owned realtime origin.

## Offer and open external work

The complete edition remains `$8 USD` as a one-time price for the fixed
18-card nine-card-type tactical set, six map modifiers, and future scenario
packs for this edition. It is not a subscription. Public metadata with only the
required offer fields is at `/work/.evidence/billing-offer.json`.

Billing registration and license activation remain an external dependency.
The purchase control is disabled, and neither checkout nor entitlement is
claimed as verified. The free sample and two-player core remain available.

The 10–15 minute match duration and 30% immediate-rematch figures are research
targets without production cohort data. They are not presented as measured
public claims.
