# Hand of Two visual system

## Direction

Hand of Two uses a field-notebook cartography style. The screen resembles one shared expedition map placed between two players, not a collectible-card storefront. Thin contour lines, stamped labels, uneven corners, and compact score marks provide identity without obscuring the game.

The design is intentionally single-mode. A warm paper surface keeps the two-client game visually consistent across devices and supports the printed-map premise. The interface does not follow the operating system’s dark setting.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| paper | `#f3ecd8` | page background |
| paper-deep | `#e5d7b9` | grouped controls |
| ink | `#142c28` | body text and rules |
| muted | `#50625b` | secondary text |
| forest | `#173c36` | primary actions and game table |
| lichen | `#b5cb83` | demo state and table emphasis |
| rust | `#9d351f` | turn stamps and card symbols |
| sky | `#d5e5df` | map-rule surface |
| focus | `#005fcc` | keyboard focus |
| danger | `#8b1e17` | actionable errors |

Text combinations meet WCAG AA contrast. State also uses words, borders, and shapes, so color is never the only cue.

## Type and spacing

Georgia is the display face because its broad forms suit a map title block. Trebuchet MS is the quiet interface face. Both are local system fonts, so the site makes no font requests.

Spacing follows a 4/8-pixel rhythm. Major sections use 64–144 pixels. Controls use 12–24 pixels. All interactive targets are at least 44 CSS pixels.

## Shapes and interaction grammar

- Cards use one clipped round corner and one square corner, like clipped field notes.
- Primary buttons use the same asymmetric corners and a short pressed-paper shadow.
- A rust circular stamp identifies each card family.
- Ridge, river, and camp use a triangle, wave, and shelter mark plus their written names.
- Hidden choices are described in text. They never depend on face-down animation.

## Motion and sound

Hover and press transitions last 160 milliseconds and move only by a few pixels. Nothing loops. The operating system reduced-motion setting disables transitions, and the in-game setting can do the same. A short oscillator tone can confirm a resolved online turn after the player enables sound. Sound defaults off and persists only in the browser.

This turn-based game does not need a continuous simulation. Rendering is event-driven; the browser paints short interface transitions with `requestAnimationFrame`. Hidden tabs do no game work because the server owns match state.

## Responsive decisions

Desktop play separates the score from the hand. At widths below 900 pixels, they stack. At widths below 620 pixels, cards become a horizontal, touch-sized row and the header stacks above navigation. No control needs precise timing.

## Difficulty and return loop

The sample uses six card types and one map rule. The first three turns teach movement, guard, and disruption. The second three add fresh reserve cards and reward reading whether the other player will choose the same location. The complete paid edition keeps the deck fixed at 18 cards while adding three card types and five more map modifiers. A rematch increments the seed and deals a new mix.

## Original asset provenance

All shipped art is original, code-made work created for this repository on 6 September 2026:

- `public/contours.svg`: hand-authored topographic line field.
- `public/favicon.svg` and `public/apple-touch-icon.svg`: hand-authored twin-peak mark.
- `public/og-image.svg`: hand-authored social composition derived from the same lines, mark, palette, and typography.
- `public/og-image.png`: browser-rasterized 1200×630 export of `public/og-image.svg` for Open Graph and Twitter card support.
- Card symbols and location marks are Unicode geometry arranged by original CSS, not copied game icons.

The image-generation skill was considered. Raster generation was not used because deterministic SVG and CSS better fit the small asset budget, sharp game symbols, and established code-native visual system. No third-party or generated artwork ships.

## Prompt sheet if raster art is added later

Subject: a shared expedition map with two opposing routes and six weather cards. World: compact mountain field station. Materials: worn paper, ink stamp, canvas, stone. Light: diffuse morning light. Palette: paper, deep forest, lichen, rust, pale sky. Composition: top-down with clear negative space for the actual interface. Avoid: people, hands, text, logos, watermarks, brands, trading-card frames, fantasy weapons, and collectible-card references.
