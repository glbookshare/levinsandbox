# Pocket Physics — Phase 1

A tablet-first, child-friendly physics playground. TypeScript, Phaser 3 / Matter.js, Vite, IndexedDB, and an offline PWA. No backend, analytics, external runtime services, or paid hosting.

## Run

Requires Node 22+: `npm ci`, then `npm run dev`. Run `npm test` and `npm run build` for verification. Serve `dist` over HTTPS for PWA installation (localhost is also supported).

## GitHub Pages

The deployment workflow is already included. In **Settings → Pages**, set **Source** to **GitHub Actions**. Do not configure the suggested Jekyll or Static HTML templates.

To deploy now, open **Actions → Deploy to GitHub Pages → Run workflow**, choose **main**, and run it. Future pushes to `main` deploy automatically.

See the [step-by-step GitHub Pages setup and troubleshooting guide](docs/github-pages.md) for Pages settings guidance, permissions, installation, and saved-data behavior.

Expected site address after a successful deployment: https://glbookshare.github.io/levinsandbox/

The workflow reads the repository base path from `configure-pages`. For a manual project build use `VITE_BASE_PATH=/your-repository/ npm run build`. Default `/` supports local development or a custom-domain root. Vite asset URLs, manifest scope/start URL, icons and service worker use this base. Do not move an installed app to a different origin: browser storage belongs to the origin.

After the first online visit finishes precaching, the game works offline. Service worker updates wait for existing sessions to close. Cache cleanup only touches application caches, never IndexedDB. Ordinary deploys preserve worlds. Private browsing, manually clearing site data, browser eviction, or uninstall options can remove local data.

## Phase 1 controls

Tap any toy button to immediately add that object near the top-center of the current view. The new toy is selected automatically; drag it to place it. Select mode lets you tap and drag toys. Pause allows precise placement; the rotation handle above a selection turns it, and the rotate button turns by 15°. Two fingers pan and pinch to zoom; the pan tool, zoom buttons and wheel also work on desktop. Platforms stay fixed. Reset restores the starter scene. Gravity offers Earth, Moon, Float and Jupiter settings. Backgrounding pauses simulation and requests a checkpoint; returning respects the chosen pause state.

The scene caps physics bodies at 150 (a human uses six bodies), enables Matter sleeping, limits zoom, and uses simple procedural artwork with no downloaded images. A single playground is saved with debouncing and ten-second checkpoints. An IndexedDB transaction replaces a validated snapshot atomically, preserving the prior record if a write fails. Browser shutdown can still lose changes since the last successful checkpoint. Storage errors are shown in the interface.

## Architecture and next phases

- `src/scene.ts`: physics, world drawing and pointer gestures.
- `src/world.ts`: version 1 snapshot format and validation; unknown versions fail safely. Version 1 is the initial schema, so no older migration exists yet. Add explicit migration functions and fixtures when introducing version 2.
- `src/storage.ts`: IndexedDB persistence; separate worlds and preferences stores.
- `src/main.ts`, `src/style.css`: responsive interface and app lifecycle.
- `vite.config.ts`: base-aware PWA generation and offline cache.

The friendly human toy is available now: a smiling head, torso, arms and legs with permanent physics joints and paired spring attachments that hold its posture under gravity. It can stand on a level floor and remains dynamic when struck or pushed. Select any part to move, rotate or delete the whole figure. All parts’ positions, rotations and velocities are saved; older shape-only saves still load.

Phase 2 remaining: ropes, springs, hinges, motors, explicit build/play modes and undo/redo. Phase 3: named multi-world library, manual save/load, JSON import/export, preferences/progress, expanded migration and persistence tests. Phase 4: mechanisms, challenges, rendering/performance profiling and device polish.

This deliverable intentionally implements Phase 1 plus a friendly articulated human, deployment/PWA and a single-world persistence foundation. It is not the complete four-phase game. The object limit is a safety bound, not a verified 60 FPS guarantee; physical iPad and Android tablet testing is still required. No injury or combat mechanics are included.

## Languages

Use the header language selector for English or Deutsch. On the first visit, the app uses German when the browser's primary language is German, otherwise English. The choice is saved in the IndexedDB `preferences` store, separately from playground data. Changing language translates controls, accessibility labels, help, hints and notifications without restarting physics. The Pocket Physics brand and saved world data remain unchanged. Both language packs are bundled for offline use.

## Startup regression check

`src/app.test.ts` boots the real Phaser Canvas renderer and Matter physics in a simulated DOM with a native canvas implementation, then clicks all seven HTML toy buttons and checks that each adds and selects an object. It also waits for rendered game frames. Only service-worker registration and storage are mocked in that test. This covers initialization and DOM handler wiring that the smaller physics tests cannot cover. Physical browser and tablet testing is still required.

Game controls are disabled during scene creation and saved-world loading. Lifecycle callbacks and DOM handlers are attached before Phaser starts, so early startup cannot skip button registration or overwrite a new toy with a late save load.

## iPad gestures

On the playground, spread two fingers apart to zoom in, pinch them together to zoom out, and move both fingers together to pan. Lift both fingers before selecting or dragging another toy. The + and − buttons also work by touch. The game handles Safari's native Touch Events with non-passive listeners and suppresses page gestures only on its canvas. Mouse/pen Pointer Events and desktop wheel zoom remain supported. Window resizing no longer resets the chosen zoom.

Automated checks exercise native touch events against the real Phaser camera: pinch in/out, focal-point stability, two-finger pan, cancellation, the transition back to one finger, duplicate touch Pointer Events, and mouse-wheel zoom. These checks simulate Safari's event path; they do not replace a physical iPad test.

For an iPad release check, open the deployed game in Safari and from its Home Screen icon; try pinching both on empty space and over a toy, moving both fingers, lifting one finger first, then starting a new one-finger drag. Confirm that the game zooms rather than the whole page, that a toy does not jump when a finger lifts, and that rotation/backgrounding leaves no stuck drag. After an update, close every open game tab/app window and reopen online to activate the new service worker without clearing saved worlds.
