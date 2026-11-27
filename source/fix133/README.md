# 133 · Booking window in Safari (Mac) — fixed 27 Nov 2026

**What was broken:** In Safari on the Mac, "Request a date" / "Invite him to speak" opened only a thin line in the middle of the screen. No field and no button could be reached.

**Why:** The form inside the booking window used `flex:1` (base size 0). The window only has a maximum height, not a fixed one. Chrome stretches the form anyway; Safari (WebKit) takes the 0 literally, so the window collapsed to 2 px. On the phone the window has a fixed height (`100dvh`), so phones were fine.

**Fix (`apply.py`, idempotent):**
1. `.bk .bk-form` and `.bk-body`: `flex:1` → `flex:1 1 auto` (scrolling inside the window stays as before).
2. An empty date field is dimmed (`.bk-empty`), because Safari shows today's date in an empty field, which looks as if a date were already picked.

No new text, so nothing to translate (rule C13).

**Checked:** WebKit (WebKitGTK 2.52, Safari's engine) at 1440×900, 1280×720 and phone size, night and day; every field and button hit-tested; email, Copy text, Close. Chrome at laptop and phone size. check_site (incl. check_lang) OK, check_sync OK, kits OK, check_facts only the two known notes from caption114.

**Rerun:** `python3 source/fix133/apply.py index.html`. Backup: `index_before_fix133.bak.html`.
