#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Items 134 and 136 (27 Nov 2026): the listening lab on the day side, after the frequency lab (#dLab).
    python3 source/hear134/apply.py [index.html]            writes the section, its style and its script (idempotent)
    python3 source/hear134/apply.py [index.html] --check    changes nothing, says whether the page carries the current files
Reads hear.html, hear.css and hear.js beside it."""
import io, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:] if not a.startswith("--")]
CHECK = "--check" in sys.argv
p = args[0] if args else os.path.join(os.path.dirname(os.path.dirname(HERE)), "index.html")
rd = lambda n: io.open(os.path.join(HERE, n), encoding="utf-8").read().strip()
s = io.open(p, encoding="utf-8").read(); s0 = s
H1, H2 = "<!-- hear134-html:start -->", "<!-- hear134-html:end -->"
A1, A2 = "<!-- hear134:start -->", "<!-- hear134:end -->"
html = H1 + "\n" + rd("hear.html") + "\n" + H2
asset = A1 + "\n<style>\n" + rd("hear.css") + "\n</style>\n<script>\n" + rd("hear.js") + "\n</script>\n" + A2

def put(s, a, z, block, where):
    if a in s:
        i = s.index(a); j = s.index(z, i) + len(z)
        return s[:i] + block + s[j:]
    return where(s, block)

def after_dlab(s, block):
    i = s.find('<section class="flab" id="dLab"')
    if i < 0: sys.exit("hear134: #dLab not found")
    depth = 0
    for m in re.finditer(r"<section\b|</section>", s[i:]):
        if m.group().startswith("<section"): depth += 1
        else:
            depth -= 1
            if depth == 0:
                k = i + m.end(); return s[:k] + "\n\n" + block + s[k:]
    sys.exit("hear134: end of #dLab not found")

def before_body(s, block):
    k = s.rfind("</body>")
    if k < 0: sys.exit("hear134: </body> not found")
    return s[:k] + block + "\n" + s[k:]

s = put(s, H1, H2, html, after_dlab)
s = put(s, A1, A2, asset, before_body)
if CHECK:
    print("OK: index.html carries the listening lab (134, 136)" if s == s0 else "CHANGES: index.html does not carry the current listening lab; run without --check")
    sys.exit(0 if s == s0 else 1)
if s != s0: io.open(p, "w", encoding="utf-8").write(s); print("hear134: written")
else: print("hear134: nothing to change")
