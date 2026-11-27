# 134 and 136 · Listening lab on the day side (27 Nov 2026)

Martin, 27 Nov 2026, 20:23: Frequency29 (Instagram @frequency.29) as material "to utilize and make even much much better … also to be included in our app". Drafts 134–137 in the project doc `entwurf-134-137-frequency29.md`. 20:36: "134 und 136 go; ich hätte sehr gern animationen die auf diesen aufbauen - speziell das mit dem hirn ist cool". 20:39: "put the rest in to do" (135, 137 and the collaboration are on the to-do list).

Nothing from Frequency29 is used: no sound, picture or text. Only the idea of the two formats, done our way, with sources.

## What is on the page

A new section `#dHear` right after the frequency lab (`#dLab`), day side only, laptop and phone.

**134 · Hearing sweep: "Where does the tone fade for you?"**
- A quiet sine tone climbs from 250 Hz to 20 kHz in 26 seconds.
- It is quieter between 2 and 5 kHz, where the ear is most sensitive, and a little louder at both ends. It is always soft.
- You tap "I can’t hear it any more", and the page says where the tone faded.
- The drawing:
  - A travelling wave runs along a golden cochlea and peaks at the place that hears the tone (Greenwood 1990: high tones at the entrance, low tones at the tip). The hair cells light up there.
  - Signals run up the hearing nerve, through the brainstem, to the hearing cortex. The cortex lights up at the matching place, because it is sorted by pitch like the cochlea.
  - The brain is golden line art with folds and a dot cloud.
  - A frequency axis below shows where the tone is.
- The text says plainly that this is not a hearing test. It also says that hearing comes down with age, highest tones first (NIDCD), and when to see an ear doctor.

**136 · One minute of humming**
- Six rounds: 4 s breathing in through the nose, 6 s humming out.
- "Hum along with a tone" is a switch, on by default. It plays a soft low drone (C3 with two overtones) while you hum.
- The drawing:
  - A head in profile. The hum rings through the skull.
  - The sinuses glow and release nitric oxide, which drifts out of the nose. Breathing in shows air going in.
  - The brain shimmers along.
  - A ring counts the breath and the six rounds.
- The meter "Nitric oxide in the nose" rises quickly to about fifteen-fold and then slowly falls (Weitzberg & Lundberg 2002; Maniscalco 2003).
- The honest limit is stated: a 2024 study found no better short-term thinking or emotion processing. It is a minute to slow down, not a treatment.

Both parts:
- say "The drawings are models, not measurements";
- carry their sources in a "+" fold ("Sources and limits");
- stop when another sound on the page starts (`ss:audio`), when the tab is hidden, and when the page switches to night;
- respect "reduce motion" (still drawings, slow updates);
- on iPhone, set `navigator.audioSession.type = "playback"` where Safari offers it, so the tone also plays with the ring switch on silent.

## Files

- `hear.html`: the section. `hear.css`: its style. `hear.js`: both animations and the sound (ES5, no libraries).
- `apply.py [index.html] [--check]`: writes the section after `#dLab` and the style and script before `</body>`, between markers `hear134-html` and `hear134`. It is safe to run again.
- `tr134.py`: the 37 texts in twelve languages. `add134.py` adds them to `i18n/*.json`; a second run adds nothing. 7 texts are under `"runtime"`, because the page writes them while it runs.
- Sources are in `data/facts.json` → `quellen_klang` (backup `data/facts_before_134.bak.json`). The paper references stay English: `i18n/keep-en.json`, 4 entries (backup `keep-en_before_134.bak.json`).

## How it went live

1. Backups: `index_before_hear134.bak.html` and `99_Archiv/i18n_before_134_2026-11-27/`.
2. `python3 source/hear134/apply.py index.html`
3. `python3 source/hear134/add134.py`
4. `python3 source/i18n/apply.py`, then `index.html` put back from the copy made just before. Reason: `apply.py` also rewrites the switcher from `source/i18n/switch.js`, which carries the unpublished change of item 132. This is the same as item 131. Only the 13 `i18n/*.js` come from `apply.py`.

**Also fixed (pure repair, rule C14):** the day cursor's sand plate (item 108) threw "radius is negative" now and then. `R=Math.max(0,p.R*fly)` was changed in `source/cursorsilk/day.js` (backup `day_before_radius.bak.js`) and in `index.html`.

## Checked

- Checks:
  - `check_site.py`: OK, including `check_lang.py` (1,262 texts, every text in all languages).
  - `check_facts.py`: only the two known lines in the item 114 draft of another chat.
  - `kits/apply.py --check`, `cursorsilk/apply.py --check` and `hear134/apply.py --check`: OK.
- Chrome:
  - 1440 × 900 and 390 × 844 (phone): sweep runs, result shows, the humming minute counts its rounds.
  - No script errors and no sideways scroll.
- Languages:
  - German and Upper Sorbian at 1280 px, Arabic and Chinese at 390 px (Chinese also with "reduce motion").
  - Headings, result text, round counter and phases appear in the language.
- WebKit 2.52 (Safari's engine), 1440 × 900 and 450 × 860: the same, with no script errors.
- Night side: the section is not visible there.

**Not checked:** the sound on a real phone and on Martin's Mac. Real Safari on the Mac and a real iPhone remain untested.

Translated by Claude, not by native speakers.

## For the app (PREZISION)

`hear.js` stands on its own. It needs only the section markup and the CSS above. Where the app's code lives is not known here; ask Martin.
