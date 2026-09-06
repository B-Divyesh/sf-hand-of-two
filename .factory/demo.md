# Demo sandbox

- URL: `https://hand-of-two.sociobot.in/demo`
- Local URL: `http://127.0.0.1:4173/demo`
- Entry: select **Try it with sample data** on the first screen.

The sample uses seed 1701, six card types, the Crosswind pass rule, and a deterministic practice bot. It contains a complete draft and six-turn match, including a real win, loss, or draw result.

The demo keeps state only in JavaScript memory. It does not read or write localStorage, sessionStorage, IndexedDB, or the room service. The persistent banner says **Demo — sample data, nothing is saved**. **Reset demo** restores the original draft. **Start for real** discards the sample and opens online room setup. Leaving the demo also discards it.

The practice bot is not multiplayer evidence. The two-client Playwright test creates a real room, joins from a separate browser context, locks hidden moves, reconnects, and reaches the end screen through the authoritative service.
