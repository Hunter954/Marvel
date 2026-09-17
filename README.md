# Marvel · Pixel Defense

Mobile portrait tower defense, built on the existing Marvel project. Vanilla JavaScript ES modules, Canvas 2D pixel sprites, and a dependency-free Node HTTP server.

## Run

Requires Node 20 or later. `npm start` serves port 3000 (or `PORT`). `npm test` runs engine integration tests. Railway reads `railway.json` and checks `/health`.

## Gameplay

- 9 complete heroes; Spider-Man and Iron Man start unlocked.
- Four rotating biomes and seeded, connected procedural paths. Each mission generates a new route.
- 5–8 manually started waves, three enemy classes and an end-of-mission boss. Difficulty scales with campaign progress.
- Deployment uses mission energy; defeated enemies and completed waves grant energy. Up to 12 units can be placed, with duplicate heroes permitted.
- Ultimates charge only during active waves. A green bar indicates readiness; tap the unit to activate. Spider-Man pulls only webbed enemies by 3 cells; Iron Man has a directional 4-cell beam.
- Persistent gold is awarded after each mission. 100 gold converts to 1 diamond. Unlock costs range from 3 to 6 diamonds. Upgrades cost 100 × current level, capped at level 10.
- Animated native pixel sprite atlases: idle, attack, cast, and walking frames. Different silhouettes, palettes, equipment and combat effects for each hero.
- Pause, 2× speed, unit sale (65% energy), optional synthesized sound, help and installation instructions.

## Persistence / phones

Campaign progress is saved in localStorage under `pixel-defense-v2`; existing `mtd-save` progression is migrated. Progress belongs to the browser/device. Clearing site data clears the save. The currently active battle restarts if the page reloads or closes.

PWA manifest, icons and an offline service worker are included. Android requests fullscreen on Start when available. On iPhone, add to the Home Screen and launch the installed web app for a browser-chrome-free experience. Normal browser fullscreen behavior is controlled by the OS/browser. Safe areas and dynamic viewport sizes are supported; orientation is requested where supported.

## Structure

- `public/js/engine.js`: deterministic map generation, combat and economy, independent of the DOM.
- `public/js/art.js`: native pixel sprite atlases, environments, skyline.
- `public/game.js`: interface, rendering, inputs, persistence, sound.
- `tests/engine.test.js`: map validity, economy, nine heroes, ultimate bounds, rewards and complete first-stage simulations.

This is an unofficial fan game. Marvel characters belong to their respective owners.

## Version 3.0 changes

- Spider-Man deals **zero damage**. Web duration and ordinary slow are separate statuses, so other slows do not count as webs. Spiders skip enemies that already have web or an incoming web projectile from any Spider-Man. Webs can be applied again only after expiry.
- Spider-Man upgrades improve web duration, slow strength, range and firing rate; damage stays at zero. His ultimate pulls only webbed targets.
- A one-time 500 gold starter bonus is recorded by `starterGrant` without resetting an existing campaign. Spending persists after reload.
- Hero unlock quotes automatically combine owned diamonds with only the gold needed for missing diamonds, using the existing 100:1 exchange. Insufficient purchases are atomic and show the exact missing amount. The UI clearly distinguishes persistent gold from battle energy.
- The pause menu opens the shop and returns to the same paused battle. Permanent upgrades can also be bought in a unit's panel and apply immediately to all deployed units of that hero.
- Four PNG ground/paving texture pairs now render the procedural battle maps. Canvas fits its logical 3:4 ratio instead of stretching.
- New high-detail hero sprites remain pending: the first generation failed automatic image moderation and the following request reached the image-generation usage limit. Existing character animations are retained. No replacement hero images are claimed in this version.

Artwork: `public/assets/terrain-v3.png` was generated with the built-in image-generation tool. See `public/assets/ARTWORK.md` for its prompt and layout.
