# 148 · Views you can share, one master for the labs' sound, structured data, hygiene (28 Nov 2026)

Martin, 27 Nov 2026, 22:57: a brief for a "UX upgrade" in four parts (shareable URL state for the wave atlas and the frequency lab; a hardened audio engine; structured data, link and picture hygiene, accessibility; folds and two clear ways to book). 23:58: "go148".

**Status: live since 28 Nov 2026, about 00:30** (commit: see `START_HERE.md`). It went up together with item 132 (`source/lang132/`).

## What changed for a visitor

**1. The view lives in the link**
- Example: `sethschwarz.com/#day&lab=theta&beat=bin&sch=14.3&st=-3&atlas=hex`
- `lab`: `theta`, `gamma`, `club`, also `delta`, `alpha`, `beta`, or a number of hertz from 1 to 45.
- `sch`: `all` or one rate alone (`7.83`, `14.3`, `20.8`, `27.3`, `33.8`).
- `st`: pitch in semitones, −24 to 24, steps of 0.1. A phone starts one octave up; only a change from the start is written.
- `beat`: `bin`, `mon`, `pul`, the sound chosen for the brain model (day side).
- `atlas`: `fork`, `hex`, `quasi`, `airy`.
- The night lab works the same way: `#night&lab=club&st=2`.
- Written with `history.replaceState`, 0.35 s after the last change: the back button keeps its meaning. 81 slider steps make one write.
- Opening such a link sets everything up, moves the page to the lab or the atlas, and **plays nothing**. No audio context is made. A line in the lab says: "This link opened a saved view. Sound stays off until you press play."
- New button in both labs and under the atlas: "Copy link to this view".
- A plain `#day`, `#night`, `#book` and every game link work as before.

**2. Wave atlas: a picture can be chosen**
- Each of the four pictures has a small "+". A press (or a click anywhere on the card) marks it and opens its entry under the grid: the equation, one sentence on what to look for, and the paper as a link.
- Without a choice, the fold "Equations and sources" lists all four. It also works without JavaScript.

**3. Sound**
- The frequency lab, the brain model, the biofeedback and the listening lab share **one** audio context (four before) and one master: bus → limiter → trim → fade → speakers. `window.SSAudio`, in the head.
- Limiter: hard knee at −9 dB, 20:1, 3 ms attack. Single sounds stay below it and pass at their own level; sums are held back.
- Every level moves by `setTargetAtTime` only. Start, stop and a change of sound cannot collide any more.
- **Repaired on the way:** before, play and a stop a quarter of a second later let the lab's tone come back at full level for about half a second and then cut it.
- Tab hidden: the master fades within a few hundredths of a second, the context is suspended. Coming back starts nothing; the lab says "Sound stopped while this tab was in the background. Press play to start again."

**4. Folds and booking**
- The note under the biofeedback folds. Its first line stays in sight as the fold's title: "A demonstration, not a medical device. Nothing is recorded or sent."
- Day side, under the enquiry: a button "Request a date" (opens the show dialog of item 142). Night side, in the contact row: "Copy address" under the agency's email and "Invite him to speak" under Talks. All three reuse texts the page already had.

**Not visible, but there**
- Structured data: 8 `Event` nodes, 2 `ScholarlyArticle`, 1 `Thesis`, linked to the `Person`. `apply.py` reads them from the page's own rows ("One booking, two slots." and "Research"), so they follow `facts.json` through `apply_facts.py`. The site's 13 languages are named.
- Links that open a new tab: every one carries `rel="noopener"` (`apply.py` stops if one does not; a last check at the moment of the click covers links written later). **`noreferrer` is off** (`NOREFERRER = False` in `apply.py`): Martin asked which is better; with it, YouTube, Bandcamp and the others would no longer see that a visit came from sethschwarz.com. One word in `apply.py` switches it on everywhere.
- 102 pictures got `width` and `height` from their files. One CSS line keeps the height following the width.
- The enlarged cover in its dialog has an alt text ("Cover of …").
- Kit links say `hreflang` and `type="application/pdf"` (set while the page runs; the buttons themselves stay as `source/kits/apply.py` writes them).

## Files

- `apply.py`: writes everything. Safe to run again; stops with a clear line if the page has changed at one of its anchors.
  - `python3 source/ux148/apply.py` → `index_ux148_entwurf.html`
  - `python3 source/ux148/apply.py --check` → says whether `index.html` carries item 148
  - `python3 source/ux148/apply.py --live` → writes `index.html`
- `ux_head.js`: `SSAudio`. Goes into the head, before item 123's wrapper (markers `ux148-audio`).
- `ux.css`, `ux.js`: style and script, before `</body>` (markers `ux148-page`).
- `atlas.html`: the fold under the atlas (markers `ux148-atlas`).
- `tr148.py`: the ten new texts in twelve languages. `add148.py [--check]`: adds them to `i18n/source-en.json` and the language files (four under `runtime`) and nine lines to `i18n/keep-en.json`.
- `facts148.py [--check]`: the five papers of the wave atlas in `data/facts.json` → `quellen_klang` (`wellenatlas_…`).
- Other markers: `ux148-share-d`, `ux148-share-n`, `ux148-cross-d`, `ux148-cross-n`, `ux148-copy-n`.

`apply.py` also changes code that is not between its own markers. Each change is one exact replacement:
- first paint and `fromHash()`: the side is read from the part of the hash before `&`;
- frequency lab: `ctx()`, start, crossfade, stop, and a small `lab.__ssLab` (`get`, `set`) that the link uses;
- brain model: context, start, stop; biofeedback: context and master; listening lab: context, two outputs, sweep stop;
- cover dialog: one alt text.

It keeps `source/hear134/hear.js` in step, so that `hear134/apply.py` does not undo it (backup `hear_before_148.bak.js`).

**For other chats:** after a run of an older item's `apply.py` (brain, biofeedback, polish120, labplay, wave atlas, book), run `python3 source/ux148/apply.py --check`. If it says CHANGES, run it with `--live`. If it stops, the older source has to get the same change by hand; the message names the place. `source/i18n/apply.py` moves its block behind this one; that is fine.

## How it went live (28 Nov 2026)

1. Note for other chats: `NOTIZ_2026-11-28_0010_148_schreibt.md`. Backups: `index_before_ux148.bak.html`, `99_Archiv/i18n_before_148_2026-11-28/`, `data/facts_before_148.bak.json`, `source/hear134/hear_before_148.bak.js`, `START_HERE_before_148.bak.md`.
2. `python3 source/ux148/facts148.py` (facts first, rule A1).
3. `python3 source/ux148/apply.py --live`
4. `python3 source/ux148/add148.py`, `python3 source/lang132/apply.py`, then `python3 source/i18n/apply.py` (13 languages, 1,310 texts each).
5. Checks, then the upload.

## Checked

In the folder, on the final `index.html` (1,406,132 bytes, SHA-256 `07f6be1b91e00c2d…`):
- `check_site.py`: OK, with the language check. `check_facts.py`: OK.
- `--check` of kits, hear134, myth135, book142, lazygames, ep_tracks, moon106: OK.

In the cloud, headless Chrome, on exactly that file (1440 × 900 and 390 × 844):
- `tests/check_merged.py`: 46 of 46. `tests/check_overtone.py`: 170 of 170. `tests/check_brain.py`: 58 of 58.
- Loads on both sides at both widths: no script error, no failed request, no sideways scroll, no audio context on load.
- Link, 34 checks: restore (full link, Schumann overtone, night club, atlas only, a broken link), write, one history entry, round trip, side switch, copy, `hashchange`, phone start pitch.
- Sound, 11 checks, measured on the audio thread: after a quick stop the level is 0.005 after 150 ms (before: 0.18, full level); a tour through frequency, club, Schumann, one overtone, pitch and stop has no jump (largest step 0.009, the slope of the sound itself); limiter rendered offline: 0.09 → 0.09, 0.18 → 0.18, 1.0 → 0.38, 4.0 → 0.42; tab hidden (simulated): suspended, button released; tab back: still suspended; a new press: running.
- Languages: the ten texts in twelve languages, each read back from the page, 120 of 120.
- Browser language (item 132): 22 of 22.
- With item 142: the two new buttons open the four-step dialog in the right mode; the phone's fixed button covers none of the new buttons.
- Pictures: 656 boxes compared with the page before. One differs, on purpose: the hand photo beside the enquiry grows 54 px with the new button.

**Not checked:** Safari and Firefox; a real phone; the sound on real speakers; a screen reader. Firefox has no `cancelAndHoldAtTime`: the hearing sweep stops there as it did before.

Translated by Claude, not by native speakers.

## Good to know

- The author lists of the two papers on the page end in "et al."; the structured data carries the names the page shows.
- Structured data, place of an event: read from the row itself. What follows the first comma of the title if it starts with a capital ("Music Frontiers, Berlin"), else the last part of the line below ("…, Kongress Palais Kassel"). A new row that fits neither gets no place; `apply.py` says so.
- The limiter sits 6 ms ahead of the sound (the browser's look-ahead). Nothing on the page depends on that.
- Item 137 (`source/listen137/`) brings its own sound. It can go through `SSAudio` later: `window.SSAudio.ctx()` for the context, `window.SSAudio.out(ctx)` instead of `ctx.destination`.

## Found on the way, not changed

- Alt text of `img/n-crowd.webp`: it says "Seth Schwarz playing violin in the foreground". The picture shows the crowd from behind the decks and, at the lower right, an arm with a bow. Suggestion: "…, his bow arm raised in the foreground".
- Kit PDFs: the two speaker sheets have no language set inside the file (`/Lang`), and the Sorbian one carries the English title. Both belong to the kit build.
- Kit buttons: `hreflang` and `type` would be better written by `source/kits/apply.py` itself.
- No `canonical` link: that is item 145.
- Upper Sorbian: the atlas captions say "wjel" for wave, "Myth or evidence?" says "žołma". The new texts use "žołma". For the aunt.
- Arabic: buttons in the mono capitals style are letter-spaced, which pulls Arabic letters apart. Fixed for the new buttons only.
- `source/cursorsilk/apply.py` and `source/pointerfx/apply.py` take `--check` for a file name and stop with an error (nothing is written).
