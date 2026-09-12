# Shawaiz Ali — Portfolio (Pure HTML/CSS/JS)

A polished, responsive portfolio for Shawaiz Ali, Data Scientist and AI/ML Engineer.

## Included

- The original single-page structure and all original content
- No navbar, contact section, footer, framework, package manager, or build step
- Animated spectrum gradients, background light fields, card glows, and avatar ring
- Scroll reveal effects, animated proficiency bars, and pointer-aware highlights
- Responsive layouts from desktop to 320px mobile screens
- Reduced-motion support, keyboard focus states, semantic HTML, and alt text
- Existing project screenshots, profile photo, links, social metadata, sitemap, and icons

## Structure

```text
index.html
site.webmanifest
robots.txt
sitemap.xml
assets/
  css/style.css
  js/app.js
  img/
```

## Run

No package installation or build command is required. Use a local HTTP server
to test PWA features; service workers do not run from a `file://` URL.

For local testing, you can also run a basic static server from this folder:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy

Upload these files to any static host or push them to a GitHub Pages repository. If the final domain changes, update the canonical and social URLs in `index.html`, `robots.txt`, and `sitemap.xml`.

## Installable PWA

The portfolio now includes a root-scoped service worker, offline caching of
all local portfolio images and core files, install guidance, a native install
button when the browser makes it available, and a user-controlled update prompt.
The original content, images, and main design are unchanged.

### Publish on your existing GitHub Pages site

1. Extract the delivery ZIP. Copy the files inside `portfolio/` into the root
   of `Shawaiz-Project/Shawaiz-Project.github.io`, preserving folder structure.
2. Commit and push the changes to the branch your GitHub Pages settings use.
   Alternatively use GitHub's **Add file → Upload files** and upload the extracted
   files/folders, not the ZIP itself. Do not add a nested `portfolio/` directory.
3. Wait for the Pages deployment to succeed, then open
   `https://shawaiz-project.github.io/` with HTTPS enabled.
4. Wait for the “Portfolio saved for offline use” message before testing offline.

This package targets your account-root site. To deploy under a project subpath,
adjust the manifest's `id`, `start_url`, `scope`, shortcuts, service worker
registration path/scope, precache URLs, and offline links together.

### Install on a device

- Android: use Chrome, tap **Install portfolio** when shown, or open the browser
  menu and use **Install app / Add to Home screen**.
- Windows PC: use Chrome or Edge and choose the install option in the address bar
  or browser menu. It will open in its own app window.
- iPhone/iPad: use Safari's Share menu, then **Add to Home Screen**.

The browser controls eligibility and wording. A custom button cannot force
installation. No APK/EXE or app-store listing is included. Launcher icons and
launch screens are browser/OS-controlled using the existing icons and manifest.

### Offline limits

After the first successful online setup, the portfolio and all local images
are cached. External demos, GitHub, LinkedIn, email services, and other external
destinations still need internet. Google Fonts are not precached; the existing
system-font fallbacks are used offline. Browser storage can be cleared or evicted,
so offline availability is not a permanent backup.

### Publishing later updates — important

Whenever you change a cached file, increment `VERSION` in `sw.js` (for example
`v1` → `v2`) in the same commit. Add new required local assets to `PRECACHE`.
The old installed version stays coherent until the new files finish caching.
Users see **Update now / Later**. Update now activates the worker and reloads
the requesting app window. Other open windows may need reloading.

Avoid deleting old assets before a rollout has completed. An essential missing
asset aborts the new worker installation and keeps the previous version available.

### Manual acceptance checks after publishing

Automated source-level checks passed with `node tests/pwa.test.cjs`, JavaScript
syntax checks, and `git diff --check`. These cover the manifest, actual PNG
dimensions, every precached path, offline fallback behavior, external/POST
bypass, preservation of online 404s, cache cleanup scope, and update consent.
Browser/device installation and visual checks have not been completed: the test
browser was unavailable and its download timed out. Verify the following after
publishing before considering device acceptance complete.

- Confirm manifest and service worker have no errors in browser DevTools.
- Install on your actual Android phone and PC and open from the launcher.
- Close/reopen the installed app without internet after offline setup succeeds.
- Check profile/project images and in-page section links offline.
- Confirm external links fail normally offline and work again online.
- Publish a bumped service worker version and verify both update choices.
