# BlockForge v1.0.1 — player-test patch

## 1.0.1 changes

- Saves coalesced over 180 ms, flushed immediately on page hide / background.
- Hidden achievements and level-road panels no longer rebuilt on every move.
- Visible mission renders skipped when their displayed data has not changed.
- Shape packs can be enabled/disabled; new purchases start disabled and old ownership is preserved.
- First-clear and improved-star bonuses retained; unchanged campaign replays no longer repeat completion coin/XP bonuses. Normal gameplay earnings remain.
- Existing prices unchanged; Ember (240), Holo (360), Nebula (320), Foundry (450) added as longer-term cosmetic goals.
- Pointer cancellation and extra-pointer handling hardened.
- Versioned offline cache waits for existing tabs to close before activation.

Validation: automated logic checks cover economy, pack migration, active shapes, coalesced saves and corrupted-save recovery. Syntax and DOM references checked. Browser/device FPS, touch, install and offline end-to-end tests still require testing; this patch is intended for a small player test before broad release.

A responsive 8×8 block puzzle game built with vanilla HTML, CSS and JavaScript.

## What's new in v1.0

- Installable Progressive Web App with standalone display mode
- Offline-first service worker and automatic cache updates
- BlockForge app and maskable icons plus a branded launch screen
- Versioned, checksummed saves with automatic previous-save recovery
- Manual JSON save export and import controls
- Persistent-storage request and page-exit safety saves
- Mobile safe-area, compact-screen, landscape and standalone layouts
- Reduced-motion support and capped particle counts
- GitHub Pages deployment workflow for every main-branch update

## Included from v0.9

- 30-level campaign with escalating score, line and terrain objectives
- Limited moves, one-to-three-star ratings and persistent level progress
- Icy cells that break when covered and locked cells cleared through lines or powers
- Dedicated level-selection, objective HUD and result screens
- Four-step first-run tutorial with replay control in Settings
- Ambient, Focus and Arcade procedural soundtracks
- Low, Normal and High visual-effect intensity
- Color-blind mode with patterns, symbols and non-color placement feedback
- Undo snapshots hardened for campaign terrain and progression rewards

## Included from v0.8

- Level Road screen with visible milestones and upcoming unlocks
- Five player ranks from Apprentice to Forge Legend
- Small coin reward on every level and a booster chest every fifth level
- Level-gated special blocks: Bomb, Golden, Lasers, Rainbow and Mystery
- Level-earned Frost/Magma palettes and Dawn Forge/Void Core themes
- Mission pool that expands with new challenge types at higher levels
- Safe migration that prevents old profiles from reclaiming past level rewards

## Included from v0.7

- Seven-day Daily Reward streak with coins, boosters and a day-seven jackpot
- Three rotating Daily Missions with persistent progress and rewards
- Four boosters: Hammer, Shuffle, Undo and Second Chance
- Special blocks: Bomb, horizontal/vertical Laser, Golden, Rainbow and Mystery
- Six persistent achievements with coin and XP rewards
- Backward-compatible local save migration for existing players

## Core features

- Mouse, touch and stylus drag controls with cell-accurate previews
- Smooth requestAnimationFrame-powered dragging and animated tray refills
- Balanced three-piece generation that reacts to board occupancy
- Row and column clearing with combo scoring
- Particle explosions, landing animations and haptic feedback
- Procedural calm background music with no external audio files
- Separate music and sound-effect volume controls
- Persistent high score, coins, purchases and settings
- In-game shop for block skins, color palettes, themes and shape packs
- Player level, XP, Forge Orders and three game modes
- Classic, two-minute Timed and endless Zen modes
- Pause/resume, fullscreen controls and optional vibration
- Instant restart, game-over detection and Second Chance recovery

## Play

Live site (after GitHub Pages is enabled with **Source: GitHub Actions**): https://ayvazugurr.github.io/blockforge/

For local testing, open `index.html` in a modern browser. PWA installation and offline caching require HTTPS or localhost. Audio begins after the first click or touch because browsers block sound autoplay.

## Controls

- Drag a piece onto the 8×8 board.
- Complete a row or column to clear it and earn coins.
- Use the booster bar for Hammer, Shuffle and Undo.
- Second Chance is offered on eligible game-over screens.
- Press `R` to restart, `Space` to pause or `Esc` to close the active panel.

No build step or external JavaScript dependency is required.
