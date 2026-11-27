#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Item 132, second part (Martin, 28 Nov 2026, 00:00 "go 132", 00:01 "sprache immer wie von browser standort",
"es sei denn vpn aktive"): the page opens in the first of the browser's languages that the site speaks.

    python3 source/lang132/apply.py [--check]     changes source/i18n/switch.js (backup beside it);
                                                  then python3 source/i18n/apply.py carries it into index.html

Before: only a German browser got its language. Now every one of the 13 does. A chosen language and ?lang= still
come first; a browser whose first language is English, or one the site does not speak, gets English.
The browser's language is used, not the place: the place would need a look-up on another server (the page loads
nothing from elsewhere), and a VPN would falsify it. The browser's language stays the same behind a VPN."""
import io, os, shutil, sys
HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(os.path.dirname(HERE), "i18n", "switch.js"); B = os.path.join(os.path.dirname(HERE), "i18n", "switch.before-all-browser-langs.js")
OLD = '    else if(/^de\\b/i.test(navigator.language||"")) want="de";'
NEW = ('    else { var nl=(navigator.languages&&navigator.languages.length)?navigator.languages:[navigator.language||""];   /* item 132: the first of the browser\'s languages that the site speaks; English if none */\n'
       '      for(var i=0;i<nl.length;i++){ var c=String(nl[i]||"").toLowerCase().split("-")[0]; if(known(c)){ want=c; break; } } }')
s = io.open(P, encoding="utf-8").read()
done = NEW in s
if "--check" in sys.argv:
    print("OK: switch.js follows the browser's languages" if done else "CHANGES: switch.js still knows only German; run without --check"); sys.exit(0 if done else 1)
if done: print("lang132: nothing to change"); sys.exit(0)
if s.count(OLD) != 1: sys.exit("lang132: the line for German browsers was not found once in switch.js (found %d). Nothing written." % s.count(OLD))
if not os.path.exists(B): shutil.copy2(P, B)
io.open(P, "w", encoding="utf-8", newline="").write(s.replace(OLD, NEW))
print("lang132: switch.js written (backup %s). Now run source/i18n/apply.py" % os.path.basename(B))
