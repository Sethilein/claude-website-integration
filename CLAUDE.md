# Rules for work on this site

Read this first. It is short on purpose; the full story is in the working folder on Martin's Mac
(`~/Documents/WEB PAGE-Doctor Martin Zschornak/START_HERE.md`, then `sethschwarz-site/README.md`).

## The one thing that goes wrong
Two sessions change `index.html` at the same time and one overwrites the other. So:
1. Before any change: `git fetch` and compare with the folder's `sethschwarz-site/index.html`. Start from the newest.
2. Change the folder's file first (backup: `index_before_<topic>.bak.html`, never overwrite a backup), then copy to
   `github-upload/`, then push here. A change that only lives here must be written back to the folder in the same session.
   The folder can be ahead of this repository on purpose (a feature that waits for Martin's go): `START_HERE.md` says so.
3. Never upload a whole file from memory or from a preview page. Merge; do not replace.
4. Before publishing, and again right after it, look whether another conversation has changed the folder in the
   meantime: `python3 source/check_sync.py` in the working folder shows where every copy stands. If something came
   in, merge it and publish again (Martin's rule, 17 Nov 2026).

## Before publishing
These run in the working folder (`sethschwarz-site/`); `source/` is deliberately not in this repository.
- `python3 source/check_site.py` prints OK (it also checks that every picture, font and sound file the page names is there).
- The page loads without script errors on both sides, at desktop and phone width. Tests: `source/tests/` (Playwright).
- After a new picture: `python3 source/polish/make_assets.py` (writes the WebP copies and thumbnails).
- After anything that rebuilds the page or its module block: `python3 source/polish/apply.py` last (own fonts, light
  pictures, the curtain between the sides, the arcade record). It can be run again safely. Mind the folder README
  on `add_modules.py`: as it stands it would drop `nav_here` and the cursor dust.
- After a rebuild the two blocks at the end of the page go back in as well: the vortex (`source/vortex/vortex.html`)
  and the lab's sound button (`source/labplay/labplay.html`).
- The page is not enough on its own: `fonts/`, `img/` (with the WebP copies) and `audio/` go up with it.

## Rules of content (Martin's, not negotiable)
- Games: invented names only. No real art car, camp or stage without the crew's written consent.
- No fees, salaries, home address, phone numbers or birth dates. No healing claims for music.
- "Dr." never next to a sponsor or a brand. Anything unconfirmed is marked as such.
- Never "Wildwind". Not in his own texts: "legend", "legendary", "insane", "best in the world".
- Shows: hello@schwarzbooking.com. Talks: doctor.martin@icloud.com.
- Numbers (cities, countries, plays) come from `data/places.json` and the page; change them everywhere at once.

## Code
One file, ES5 style (`var`, `function`), no framework, no build step. Canvases run only while on screen.
"Reduce motion" is respected. Nothing is loaded from another server.

## Not decided here
Label clearance for the audio excerpts, real names in the burn history, the newsletter service, the legal notice
(Impressum) and privacy page, the public city count. Ask Martin; do not decide.
