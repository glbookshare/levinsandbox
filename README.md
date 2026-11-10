# Pocket Physics — Phase 1

A tablet-first, child-friendly physics playground. TypeScript, Phaser 3 / Matter.js, Vite, IndexedDB, and an offline PWA. No backend, analytics, external runtime services, or paid hosting.

## Run

Requires Node 22+: `npm ci`, then `npm run dev`. Run `npm test` and `npm run build` for verification. Serve `dist` over HTTPS for PWA installation (localhost is also supported).

## GitHub Pages

1. Put the contents of this folder at the root of your GitHub repository and commit the lockfile.
2. In **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions**.
3. Push to `main`. The included workflow tests, builds, uploads `dist`, and deploys Pages automatically. Enable Actions if the repository has disabled them.
4. Visit the URL shown by the deployment job. On Android use the browser's Install app menu. On iPad use Safari → Share → Add to Home Screen.

The workflow reads the repository base path from `configure-pages`. For a manual project build use `VITE_BASE_PATH=/your-repository/ npm run build`. Default `/` supports local development or a custom-domain root. Vite asset URLs, manifest scope/start URL, icons and service worker use this base. Do not move an installed app to a different origin: browser storage belongs to the origin.

After the first online visit finishes precaching, the game works offline. Service worker updates wait for existing sessions to close. Cache cleanup only touches application caches, never IndexedDB. Ordinary deploys preserve worlds. Private browsing, manually clearing site data, browser eviction, or uninstall options can remove local data.

## Phase 1 controls

Choose an object, then tap to add it. Select mode lets you tap and drag toys. Pause allows precise placement; the rotation handle above a selection turns it, and the rotate button turns by 15°. Two fingers pan and pinch to zoom; the pan tool, zoom buttons and wheel also work on desktop. Platforms stay fixed. Reset restores the starter scene. Gravity offers Earth, Moon, Float and Jupiter settings. Backgrounding pauses simulation and requests a checkpoint; returning respects the chosen pause state.

The scene caps objects at 150, enables Matter sleeping, limits zoom, and uses simple procedural artwork with no downloaded images. A single playground is saved with debouncing and ten-second checkpoints. An IndexedDB transaction replaces a validated snapshot atomically, preserving the prior record if a write fails. Browser shutdown can still lose changes since the last successful checkpoint. Storage errors are shown in the interface.

## Architecture and next phases

- `src/scene.ts`: physics, world drawing and pointer gestures.
- `src/world.ts`: version 1 snapshot format and validation; unknown versions fail safely. Version 1 is the initial schema, so no older migration exists yet. Add explicit migration functions and fixtures when introducing version 2.
- `src/storage.ts`: IndexedDB persistence; separate worlds and preferences stores.
- `src/main.ts`, `src/style.css`: responsive interface and app lifecycle.
- `vite.config.ts`: base-aware PWA generation and offline cache.

Phase 2: ropes, springs, hinges, motors, friendly articulated characters, explicit build/play modes and undo/redo. Phase 3: named multi-world library, manual save/load, JSON import/export, preferences/progress, expanded migration and persistence tests. Phase 4: mechanisms, challenges, rendering/performance profiling and device polish.

This deliverable intentionally implements Phase 1 plus deployment/PWA and a single-world persistence foundation. It is not the complete four-phase game. The object limit is a safety bound, not a verified 60 FPS guarantee; physical iPad and Android tablet testing is still required. No injury or combat mechanics are included.

## Languages

Use the header language selector for English or Deutsch. On the first visit, the app uses German when the browser's primary language is German, otherwise English. The choice is saved in the IndexedDB `preferences` store, separately from playground data. Changing language translates controls, accessibility labels, help, hints and notifications without restarting physics. The Pocket Physics brand and saved world data remain unchanged. Both language packs are bundled for offline use.
