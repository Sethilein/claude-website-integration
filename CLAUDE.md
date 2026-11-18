# Rules for work on this site

Read this first. It is short on purpose; the full story is in the working folder on Martin's Mac
(`~/Documents/WEB PAGE-Doctor Martin Zschornak/START_HERE.md`, then `sethschwarz-site/README.md`).

## The one thing that goes wrong
Two sessions change `index.html` at the same time and one overwrites the other. So:
1. Before any change: `git fetch` and compare with the folder's `sethschwarz-site/index.html`. Start from the newest.
2. Change the folder's file first (backup: `index_before_<topic>.bak.html`, never overwrite a backup), then copy to
   `github-upload/`, then push here. A change that only lives here must be written back to the folder in the same session.
   A change that waits for Martin's go does not lie in `index.html`: it waits as its own draft file
   (`index_<topic>_entwurf.html`, built by a script that can be run again), and `START_HERE.md` names it. So the
   folder's `index.html` is always the live page, and an upload from another conversation cannot take an unapproved
   change with it (Martin's rule, 18 Nov 2026).
3. Never upload a whole file from memory or from a preview page. Merge; do not replace.
4. Before publishing, and again right after it, look whether another conversation has changed the folder in the
   meantime: `python3 source/check_sync.py` in the working folder shows where every copy stands. If something came
   in, merge it and publish again (Martin's rule, 17 Nov 2026).
5. One writer per folder: if another conversation is writing into the same folder right now, stop, leave a note next
   to the files and ask Martin which conversation finishes (Martin's rule, 18 Nov 2026).

## Before publishing
These run in the working folder (`sethschwarz-site/`); `source/` is deliberately not in this repository.
- `python3 source/check_site.py` prints OK (it also checks that every picture, font and sound file the page names is there).
- `python3 source/check_facts.py` prints OK (the page, the scripts and the documents carry what the facts say; see below).
- The page loads without script errors on both sides, at desktop and phone width. Tests: `source/tests/` (Playwright).
- After a new picture: `python3 source/polish/make_assets.py` (writes the WebP copies and thumbnails).
- The page is edited directly. The old generator is retired (Martin's word, 17 Nov 2026): `build_site.py`,
  `package.py` and `add_modules.py` stop with a note and write nothing; the page holds work they never knew.
- `python3 source/polish/apply.py` can be run again safely (own fonts, light pictures, the curtain between the sides,
  the arcade record). The two blocks at the end of the page have their sources in `source/vortex/vortex.html` (the
  vortex) and `source/labplay/labplay.html` (the lab's sound button).
- The page is not enough on its own: `fonts/`, `img/` (with the WebP copies), `audio/`, `i18n/` and `kits/` go up with it.
- Kit downloads (since 18 Nov 2026): the PDFs lie in `kits/`. `python3 source/kits/apply.py` writes the buttons from `data/facts.json` ("kits") and reads each size from the file. After a kit is rebuilt: new PDF into `kits/`, run the script, upload `index.html` and `kits/`.

## Rules of content (Martin's, not negotiable)
- Games: invented names only. No real art car, camp or stage without the crew's written consent.
- No fees, salaries, home address, phone numbers or birth dates. No healing claims for music.
- "Dr." never next to a sponsor or a brand. Anything unconfirmed is marked as such.
- Never "Wildwind". Not in his own texts: "legend", "legendary", "insane", "best in the world".
- Shows: hello@schwarzbooking.com. Talks: doctor.martin@icloud.com.
- Facts (numbers, lines, contacts, links, credits, spellings) are changed in `data/facts.json` first, a gig in
  `data/places.json`. Then `python3 source/apply_facts.py` writes them into the pages; kits, Brand Book, bio and
  profiles follow. City and country counts are counted from `data/places.json`, never typed. The plays figure has
  its own rule (`source/plays_links.py`) and is not written by that script. `data/facts.json` stays in the working
  folder and never comes into this repository (Martin's rule, 17 Nov 2026).

## Code
One file, ES5 style (`var`, `function`), no framework, no build step. Canvases run only while on screen.
"Reduce motion" is respected. Nothing is loaded from another server.

## Not decided here
Label clearance for the audio excerpts, real names in the burn history, the newsletter service, the legal notice
(Impressum) and privacy page. Ask Martin; do not decide.
