# 135 · "Myth or evidence?" on the day side (27 Nov 2026)

On 27 Nov 2026, Martin said "135 go" (21:54). The idea came from the Frequency29 drafts in `entwurf-134-137-frequency29.md`. Nothing from Frequency29 is used.

## What is on the page

The section `#dMyth` sits right after the listening lab (`#dHear`, items 134/136), on the day side only. Heading: "Five claims about sound, checked by a doctor."

There are five cards (`<details>`, no script). Each card shows:
- the claim as a quote;
- a verdict bar: No evidence, Mixed evidence or Solid evidence;
- three parts: "The claim", "What studies show", "What remains";
- the sources as links.

| # | Claim | Verdict | Sources |
|---|---|---|---|
| 01 | 528 Hz repairs your DNA. | No evidence | Akimoto 2018 (9 people; the authors themselves: Solfeggio effects have no scientific basis) |
| 02 | 1150 Hz kills parasites. | No evidence | AAP FactCheck 2024; Full Fact (Cancer Research UK on Rife machines); pointer to histotripsy |
| 03 | A CIA file proves that humming heals. | No evidence | McDonnell 1983, CIA reading room; pointer to the humming minute (nitric oxide, item 136) |
| 04 | Binaural beats tune your brainwaves. | Mixed evidence | Garcia-Argibay 2019 (22 studies, g = 0.45); Ingendoh 2023 (14 EEG studies, entrainment not reliable); pointer to Dr. Martin's two planned trials |
| 05 | Music lowers stress. | Solid evidence | de Witte 2020 (104 RCTs, 9,617 people); Bradt 2013 (Cochrane, pre-operative anxiety) |

At the bottom: "Checked by Dr. Martin Zschornak, radiation oncologist, in November 2026. Not medical advice."

## Facts and languages

- Every source is in `data/facts.json` → `quellen_klang` (`solfeggio_528`, `rife_1150`, `gateway_1983`, `binaurale_beats`, `musik_op_angst`, `musik_stress`). Backup: `facts_before_135.bak.json`.
- 31 texts are in all 13 languages (`tr135.py`). `add135.py` adds them and is safe to run again. Each language now has 1,293 texts.
- The references stay English: `i18n/keep-en.json`, 8 entries (`KEEP_EN` in `tr135.py`). Backup: `keep-en_before_135.bak.json`.
- Order of work:
  1. `apply.py`
  2. `add135.py`
  3. `source/i18n/apply.py`, then `index.html` restored from the copy made just before it, because of item 132 (as in items 131 and 134).
- In Arabic the quotation marks around the claims are switched off, because in right-to-left text they land on the wrong side.

## Files

- `myth.html`: the section.
- `myth.css`: its style.
- `apply.py [index.html] [--check]`: writes the section between the markers `myth135-html` (right after `hear134-html:end`) and `myth135` (style, before `</body>`).
- `tr135.py`, `add135.py`.

## Checked

- Checks:
  - `check_site.py`: OK, including the language check.
  - `check_facts.py`: only the two known lines from the item 114 draft.
  - `kits/apply.py --check`, `hear134/apply.py --check` and `myth135/apply.py --check`: OK.
  - `check_sync.py`: OK.
- Chrome:
  - 1440 px with cards 01 and 04 open, and 390 px (phone): no script errors and no sideways scroll.
  - German and Upper Sorbian at 1280 px, Arabic and English at 390 px: heading, claim, verdict and text appear in the language.

Translated by Claude, not by native speakers.

## For later

- New claims can be added as further cards in `myth.html` (new texts go into a new `tr` file, rule C13).
- The cards are meant as the first series for a Dr. Martin Instagram profile (to-do list).
