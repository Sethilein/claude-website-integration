# Seth Schwarz · Dr. Martin Zschornak — Day and Night site

One page, two sides: by day Dr. Martin Zschornak (speaker), by night Seth Schwarz (DJ and electric violinist).
Live: https://sethilein.github.io/claude-website-integration/ (the domain sethschwarz.com follows).

## What is here
- `index.html` — the whole site in one file (HTML, CSS, JavaScript). No framework, no build step.
- `img/`, `audio/`, `fonts/`, `data/` — pictures, eight 28-second excerpts, the self-hosted fonts, the gig list.
- `day/`, `night/` — two tiny pages that carry each side's link preview and send visitors on to the main page.
- `404.html`, `favicon.png`, `apple-touch-icon.png`, `.nojekyll` (GitHub Pages must not filter files; keep it).

## How a change gets here
The working folder on Martin's Mac is the source: `sethschwarz-site/index.html`, with its README, tests and backups.
1. Change the file there (backup first, `python3 source/check_site.py` must print OK).
2. Copy the changed files to `github-upload/` and push them here.
3. Never the other way round without writing the result back to the folder: on 16 Nov 2026 a deploy from an older
   copy briefly undid a newer build.

`CLAUDE.md` holds the same rules for any Claude session that works in this repository.

## Fonts and pictures
Chivo, Inter, IBM Plex Mono and Bodoni Moda are open-source (SIL Open Font License, see `fonts/LICENSE.txt`) and are
served from this site, so no visitor's address goes to a font service. Photo credits are on the page.
