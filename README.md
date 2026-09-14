# BlockForge v1.0

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

Live site: https://ayvazugurr.github.io/blockforge/

For local testing, open `index.html` in a modern browser. PWA installation and offline caching require HTTPS or localhost. Audio begins after the first click or touch because browsers block sound autoplay.

## Controls

- Drag a piece onto the 8×8 board.
- Complete a row or column to clear it and earn coins.
- Use the booster bar for Hammer, Shuffle and Undo.
- Second Chance is offered on eligible game-over screens.
- Press `R` to restart, `Space` to pause or `Esc` to close the active panel.

No build step or external JavaScript dependency is required.
