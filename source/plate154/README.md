# Item 154 · The plate in the frequency lab follows the tone you hear

Live 28 Nov 2026 (Martin, 14:40: "der pitch wirkt sich überhaupt nicht auf die chladni mandala aus - wieso?";
14:41: "bitte verwende unser knowledge aus der database um es echt zu machen"; 20:16: "go 124", read as "go 154",
because 124 has been live since 25 Nov and 154 was the only item waiting for a go).

## What was wrong
The plate (day: Chladni plate, night: mandala) chose its figure only from the pulse rate f, the 1-45 Hz slider.
The pitch fader bent every tone you hear, but the plate never read it. So moving the pitch changed nothing.

## What a real plate does (knowledge base: "Cymatics: What the Physics Shows, and Where the Claims Begin",
https://claude.ai/artifact/3novDzo3wKARUb5JubbRgn; Chladni 1787, Germain 1816, Harvard and UCSB lecture demonstrations)
- Every note gives its own figure; the plate moves at the frequency that drives it.
- It is a high-Q resonator: a clear figure only when the tone sits on a resonance; between two, the plate hardly
  moves and the sand stays where it lies.
- Square plate: mode (n, m) rings near a frequency proportional to n^2 + m^2
  (figure cos(n pi x)cos(m pi y) - cos(m pi x)cos(n pi y), as before).
- Round plate: Chladni's law, f proportional to (m + 2n)^2 (m diameters, n circles).

## What the page does now
- The figure is chosen by the tone you hear: beat presets 200 Hz x pitch + f/2 (the middle of the two tones),
  124 BPM the 110 Hz pad x pitch, Schumann the 100 Hz drone x pitch.
- Sand moves hard near a resonance and slowly between two (resonance width 3.5 %).
- While sound plays, the drive swells with the pulse, so the grains jump in the rhythm you hear.
- Sizes (a choice, the rules are physics): the square plate gives at 200 Hz the same figure as before (mode 2-5);
  the round plate gives m + 2n = 8 at 200 Hz. The mandala uses modes with at least three diameters.
- Night: the mandala no longer changes its figure every four bars on its own; it changes with the tone.
- Day caption: the number is now the tone in Hz ("Chladni plate · mode 3–7 · 403 Hz"). No new text.

## Files
- `apply.py`: `python3 source/plate154/apply.py index.html` (writes), `--check` (OK / CHANGES), `--out <file>`.
- After anything that rewrites the frequency lab script (for example `source/klon105/apply.py`), run it again.

## Checked
Cloud, Chrome 1280 px: day pitch -24 / -12 / 0 / +7 / +12 / +24 st gives modes 1-3 / 1-4 / 2-5 / 3-6 / 3-7 / 4-10
(53 to 803 Hz); night 4 / 4 / 6 / 4 / 9 / 8-fold; slider to 45 Hz moves the day plate to 3-5 (223 Hz);
no script errors. Not checked: a real phone, Safari.
