# Verification 2 — FAIL

Date: 6 September 2026
Work order: `hand-of-two-verify-2`
Live URL: <https://hand-of-two.sociobot.in>
Implementation candidate reviewed: `7158d8607ef02094bc105fb16f7fc1cb44fedab7`
Documentation candidate reviewed: `5b7f1368d0ea03cdd24825421a9880d74510a32a`

## Verdict

**FAIL — 4 minor findings; 0 failed declared claims; 0 untested declared claims.**

The repaired live multiplayer path works end to end. The failure is due to four
remaining accessibility and site-structure defects. A successful test run does
not override those findings.

## Findings

### Minor 1 — 200% text clips the active-game preview

In a fresh 390×844 phone context, increasing the root text size from 16 px to
32 px causes the landing preview score grid to extend beyond the viewport. The
`Other` heading and values reach about 442 px while the 390 px first-screen
container uses `overflow: hidden`. The content is clipped rather than wrapped
or made horizontally scrollable. This fails the requirement that text resize
to 200% without loss.

Evidence: `/work/.evidence/verification-2-phone-200-percent.png`.

Repair: let the score columns shrink or stack at enlarged text sizes, and do not
clip functional preview content in the first-screen container.

### Minor 2 — several phone touch targets are below 44×44 CSS px

At 390 px wide, the `Play` header link measured 34.4×44 px. `Start for real`
and the footer links measured 24.8 px high. These links remain usable, but they
do not meet the attached 44×44 px touch-target contract. The same footer defect
is present on every application route.

Repair: give navigation, demo-banner, and footer links a minimum 44×44 px hit
area without changing their visible labels.

### Minor 3 — the declared social-card image uses an unsupported format

Both `og:image` and `twitter:image` point to `/og-image.svg`, served as
`image/svg+xml`. The declared `summary_large_image` Twitter card does not
support SVG, so its image is not a reliable social preview. The file has the
correct 1200×630 dimensions and original product art; the defect is the public
metadata format.

Repair: export the existing composition as an optimized 1200×630 PNG or JPEG
supported by the target card consumers and update both image metadata fields.

### Minor 4 — the 404 page omits the required shared site skeleton

An unknown URL correctly returns HTTP 404 and shows a designed recovery link.
However, `404.html` contains only `<main>`: it has no shared wordmark header,
navigation, skip link, or footer. The site-structure contract requires the
consistent header and footer on every route. The HTTP 404 itself is expected
and is not the defect.

Repair: add the standard header, skip link, and footer to the styled 404 while
preserving the 404 status and home recovery link.

## Candidate and live artifact comparison

A clean checkout at documentation SHA `5b7f136` built the production static
artifact. The live HTML, JavaScript, and CSS matched that build byte for byte:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `54fb5e7fdbf614846b4978e6fff1db9906c1f1bcafb6be1759d9a8157b77cc40` |
| JavaScript | `5a5bbcc7ac7472949180baddba7959545bdc098120ea3bde0d5a614d082b1f2d` |
| CSS | `11372c7464d381a96325a347f28b774d1ae98c5d5261766e1e47333a90dd17b2` |

The live JavaScript contains the product-owned realtime origin. The later
commits `eb3bedb` and `5b7f136` are documentation-only; they do not require a
new product image.

## Clean-checkout verification

Setup used Node `v22.23.2`, npm `10.9.8`, and `npm ci` from a fresh clone.
The install reported zero vulnerabilities.

- `npm test`: pass — 6 unit/integration tests and 13 Chromium tests.
- `npm run build`: pass — `dist/` produced.
- `npm run test:a11y`: pass — all six routes had no serious or critical Axe
  violations.
- Production JavaScript: 32.52 KB raw / 10.65 KB gzip.
- Production CSS: 12.39 KB raw / 3.66 KB gzip.

Every exact command in `.factory/claims.json` was run independently:

| Claim | Declared command | Result |
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

The live copy and README were cross-checked against the claim inventory. No
material public claim was missing from the inventory, false, or left untested.
Checkout and activation remain explicitly inactive and were not treated as
passed.

## Live product evidence

### First screen and demo

- Fresh desktop and 390×844 phone contexts showed the job, audience, sample
  action, and active game before scrolling.
- The sample opened in one click with six real cards and the Crosswind pass.
- `Demo — sample data, nothing is saved` remained visible through all six
  turns.
- Reset restored the seeded six-card draft. Restart after the end screen also
  restored a fresh draft.
- A pre-existing real sound/motion setting was unchanged. The demo created no
  demo storage key.
- The deterministic run reached `You win the expedition`, showed all six
  history rows, and supplied a one-click restart.

Evidence:

- `/work/.evidence/verification-2-desktop-first-screen.png`
- `/work/.evidence/verification-2-phone-first-screen.png`
- `/work/.evidence/verification-2-demo-end.png`

### Real two-client game

- Two independent fresh browser contexts created and joined one room through
  `https://hand-of-two-realtime.sociobot.in`.
- Both players drafted private cards. The first locked move left the other
  client's score and choice screen unchanged.
- Reloading the host after locking that move restored the waiting state. The
  guest move then resolved turn one.
- Both clients completed six turns, reached matching end states with six
  history rows, and mutually started a fresh rematch.
- A third join returned 409.
- A token from a separate room was rejected when used against another room.
  No token, cookie, or credential was written to evidence.

Evidence:

- `/work/.evidence/verification-2-host-hidden-move.png`
- `/work/.evidence/verification-2-guest-hidden-move.png`
- `/work/.evidence/verification-2-two-client-host-end.png`
- `/work/.evidence/verification-2-two-client-guest-end.png`
- `/work/.evidence/verification-2-two-client-host-run.webm`
- `/work/.evidence/verification-2-two-client-guest-run.webm`

### Backend durability and allowances

- The exact product resource `sf-hand-of-two-realtime` had one active healthy
  replica, one minimum/maximum replica, and its product-owned `/data` mount.
- That revision was restarted while the host had a move locked. Health returned
  200, both clients reconnected, the locked move remained, and the guest move
  resolved the match to turn two.
- A fresh allowance bucket returned twelve 201 responses followed by 429 with
  `Retry-After: 60`.
- The health endpoint returned 200 with only the expected status response.

Evidence: `/work/.evidence/verification-2-restart-persistence.png`.

### Routes, accessibility, privacy, and performance

- `/`, `/demo`, `/play`, `/settings`, `/privacy`, and `/terms` returned 200
  with route-specific titles, one `<h1>`, one `<main>`, and no serious or
  critical Axe results.
- The provided `verify-url.sh` passed with zero console errors, a title, `lang`,
  one h1, a main landmark, and no missing image alternatives.
- Keyboard skip-link order, visible 3 px focus, card selection, route focus,
  back/forward navigation, saved settings, and reduced motion passed.
- Short and unknown room inputs, offline room creation, and recovery copy
  passed.
- The deliberate unknown URL returned a designed HTTP 404 with a way home; its
  missing shared skeleton is Finding 4.
- Browser requests during the tested flows went only to the static product and
  its product-owned realtime service. There were no console errors.
- A two-second phone sample measured 60.6 animation frames per second. The game
  makes no public frame-rate claim and uses event-driven rendering.
- Lighthouse mobile scores were Performance 100, Accessibility 100, Best
  Practices 100, and SEO 100. LCP was 1.0 s, CLS 0, and total blocking time
  10 ms.

Evidence:

- `/work/.evidence/verification-2-lighthouse.json`
- `/work/.evidence/verify-url/verify.json`

## Earlier findings and gaps

- Verification 1's critical live room-creation defect is resolved. The live
  static asset now uses the realtime origin, and the independent two-client
  match, reconnect, rematch, third-seat rejection, restart persistence, health,
  and rate-limit checks all passed.
- Verification 1 listed no minor findings. The four findings above come from
  the expanded 200% text, touch-target, metadata-format, and shared-404 checks.
- Billing registration remains an external dependency. The product honestly
  publishes one `$8 USD` one-time offer and a disabled purchase action. No
  subscription or completed checkout is claimed.
- The researched 10–15 minute duration and 30% immediate-rematch targets still
  lack production cohort data. They are presented as targets, not measured
  claims.

## Acceptance result

Finding count: **4**
Untested claim count: **0**
Final verdict: **FAIL**
