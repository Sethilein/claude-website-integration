#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Item 135 (27 Nov 2026): "Myth or evidence?" on the day side, right after the listening lab (#dHear, items 134/136).
    python3 source/myth135/apply.py [index.html]            writes the section and its style (idempotent)
    python3 source/myth135/apply.py [index.html] --check    changes nothing, says whether the page carries the current files
Reads myth.html and myth.css beside it. No script: the cards are <details>."""
import io, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:] if not a.startswith("--")]
CHECK = "--check" in sys.argv
p = args[0] if args else os.path.join(os.path.dirname(os.path.dirname(HERE)), "index.html")
rd = lambda n: io.open(os.path.join(HERE, n), encoding="utf-8").read().strip()
s = io.open(p, encoding="utf-8").read(); s0 = s
H1, H2 = "<!-- myth135-html:start -->", "<!-- myth135-html:end -->"
A1, A2 = "<!-- myth135:start -->", "<!-- myth135:end -->"
html = H1 + "\n" + rd("myth.html") + "\n" + H2
asset = A1 + "\n<style>\n" + rd("myth.css") + "\n</style>\n" + A2
AFTER = "<!-- hear134-html:end -->"
def put(s, a, z, block, where):
    if a in s:
        i = s.index(a); j = s.index(z, i) + len(z); return s[:i] + block + s[j:]
    return where(s, block)
def after_hear(s, block):
    if s.count(AFTER) != 1: sys.exit("myth135: the listening lab (item 134) must be on the page first")
    k = s.index(AFTER) + len(AFTER); return s[:k] + "\n\n" + block + s[k:]
def before_body(s, block):
    k = s.rfind("</body>")
    if k < 0: sys.exit("myth135: </body> not found")
    return s[:k] + block + "\n" + s[k:]
s = put(s, H1, H2, html, after_hear)
s = put(s, A1, A2, asset, before_body)
if CHECK:
    print("OK: index.html carries Myth or evidence (135)" if s == s0 else "CHANGES: index.html does not carry the current item 135; run without --check")
    sys.exit(0 if s == s0 else 1)
if s != s0: io.open(p, "w", encoding="utf-8").write(s); print("myth135: written")
else: print("myth135: nothing to change")
