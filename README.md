# uncompiled thoughts

Jeff's personal tech blog: thinking out loud about AI and software.

Built with [Astro](https://astro.build) as a static site. The design comes from the prototypes in the
Obsidian vault (`tech-blog/design-reference/`); the plan is the architecture map in
`tech-blog/system-design/`.

## Commands

| Command                | What it does                                    |
| ---------------------- | ----------------------------------------------- |
| `npm install`          | Install everything (also turns on the git hook) |
| `npm run dev`          | Local site at http://localhost:4321             |
| `npm run build`        | Check images, then build the site into `dist/`  |
| `npm run preview`      | Serve the built `dist/` folder                  |
| `npm run check`        | Type-check and check formatting                 |
| `npm run format`       | Format every file with Prettier                 |
| `npm run images:strip` | Remove metadata (EXIF, GPS...) from all images  |

## Where things live

```
src/
  styles/tokens.css      every color, the two fonts, the 28px line rhythm
  styles/global.css      base page styles
  content.config.ts      post schema: title, date, tags
  content/posts/         one Markdown file per post
  assets/                images (the About photo)
  components/            LabelHeader, Terminal, Prompt, PageTabs, Paper, Stamp,
                         Polaroid, PostBar, PostList
  layouts/Base.astro     header + paper + post bar, used by every page
  scripts/               the only browser JavaScript: terminal.ts, post-bar.ts
  lib/                   site data (pages, links) and post helpers
  pages/                 one file per page, plus posts/[slug].astro and feed.xml.ts
scripts/images.mjs       image metadata check/strip
.githooks/pre-commit     strips image metadata before every commit
```

## Writing a post

Add `src/content/posts/my-post.md`:

```md
---
title: My post
date: 2026-11-01
tags: [ai, local-models]
---

The post, in Markdown.
```

The file name becomes the URL (`/posts/my-post/`). A missing title or date fails the build. Once
the first post exists, the Posts page lists it and the post bar starts browsing.

## Images and privacy

Photos can carry hidden details such as GPS location and phone model. Two guards keep them out:

- The **pre-commit hook** strips metadata from any image you commit and re-stages the clean file.
- **`npm run build`** fails if any image in `src/` or `public/` still has metadata, so the deploy
  can't publish one either.

## Publishing

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `main`. In the
repository settings, set Pages → Source to "GitHub Actions". If the repository is not named
`zlyxero.github.io`, set `base` in `astro.config.mjs` to `'/<repo-name>'`.
