# 132 · The page opens in the visitor's language (28 Nov 2026)

- **First part (25 Nov, another conversation):** a German browser gets German. It went onto the live page on 27 Nov, 22:32, with the upload of item 114 (commit `056b280`), before a go. Martin, 28 Nov, 00:00: "go 132".
- **Second part (Martin, 28 Nov, 00:01: "sprache immer wie von browser standort", "es sei denn vpn aktive"):** every one of the 13 languages follows the browser, not only German.

## The rule now
1. `?lang=xx` in the address.
2. The language the visitor chose before (kept in the browser).
3. The first of the browser's languages that the site speaks (`navigator.languages`, in the visitor's own order). "pt-BR" counts as Portuguese, "zh-TW" as Chinese.
4. English.

A browser whose first language is English gets English, even if German stands further down its list.

## Why the browser's language and not the place
The place of a visitor can only be found by asking another server about the address, or by asking the visitor for permission. The page does neither (nothing is loaded from elsewhere). A VPN would also give the wrong country. The browser's language is the visitor's own setting and stays the same behind a VPN. So "unless a VPN is active" needs no special case.

## Files
- `apply.py [--check]`: changes one line in `source/i18n/switch.js` (backup `switch.before-all-browser-langs.js`). Then `source/i18n/apply.py` writes the switcher into `index.html`.

## Good to know
- The translations are by Claude. Native speakers have read German, Spanish, French and Upper Sorbian in parts. A visitor with, say, a Hindi browser now lands on the Hindi text without choosing it.
- Checked in Chrome with the browser set to de, es, fr, pt-BR, zh-TW, ar, hi, ru, tr, it, af, hsb, en-US and ja: see `source/ux148/README.md`, "Checked".
