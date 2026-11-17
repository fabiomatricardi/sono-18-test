# CUCCIAFLIX

A private little cinema for our 18th anniversary — 22 November 2026.

An iPhone-friendly web app that looks like a TV ambient screen (Netflix style),
with the family photo, a live clock, our two videos and a letter.

## How it works

No build step, no dependencies. Plain HTML, CSS and JavaScript.

```
index.html            the app
css/style.css         all the styling
js/app.js             clock, intro sound, player, letter, settings
assets/               family photo, video thumbnails, fonts, icons
manifest.webmanifest  makes it installable on the iPhone home screen
sw.js                 offline shell
```

## Deploy (GitHub Pages)

1. Push this folder to the repository.
2. On GitHub: **Settings → Pages → Build and deployment**
   - Source: *Deploy from a branch*
   - Branch: `main`, folder: `/ (root)`
3. Wait ~1 minute. The app will be at
   `https://fabiomatricardi.github.io/sono-18-test/`

## Put it on the iPhone

1. Open the URL in **Safari** (not Chrome).
2. Tap **Share → Aggiungi a Home**.
3. Open it from the home screen icon: it runs full screen, like an app.
4. Turn the phone **horizontally** (the app is designed for landscape).
   If it does not rotate, disable orientation lock in the Control Center.

> **Why "Aggiungi a Home"?** Safari on iPhone cannot hide its own toolbars:
> the Fullscreen API is still not available on iPhone (WebKit bug 206854,
> open since 2020). Adding the site to the home screen is the only way to get
> true full screen. The app shows these instructions on the splash screen and
> in the "Ruota il telefono" screen.

## Editing

- Video list and titles: `js/app.js`, the `VIDEOS` object at the top.
- Letter text: `index.html`, the `<article class="letter-card">` block.
- Names / date / eyebrow: `index.html`, the `.titleblock` block.

After changing any cached file, bump `CACHE = 'cucciaflix-v1'` in `sw.js`
so the iPhone picks up the new version.

## Credits

- Background photo: family archive, 8 July 2022.
- Videos: YouTube (embedded with `youtube-nocookie.com`).
- Fonts: Cormorant Garamond and Bebas Neue (SIL Open Font License).
