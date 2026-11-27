#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Item 148: adds the ten texts to i18n/source-en.json and to the twelve language files, each at the same position
(a second run adds nothing), and the equation and reference lines to i18n/keep-en.json.
    python3 source/ux148/add148.py [--check]     then: python3 source/i18n/apply.py
Run it after source/ux148/apply.py --live: a text that does not stand in the page's markup goes under "runtime".
Model: source/myth135/add135.py."""
import io, json, os, re, sys, collections
from html.parser import HTMLParser
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE)); I18N = os.path.join(ROOT, "i18n")
CHECK = "--check" in sys.argv
NS = {}; exec(compile(io.open(os.path.join(HERE, "tr148.py"), encoding="utf-8").read(), "tr148.py", "exec"), NS)
KEYS, TR, KEEP = NS["KEYS"], NS["TR"], NS["KEEP_EN"]
norm = lambda t: re.sub(r"\s+", " ", t).strip()
def load(name):
    p = os.path.join(I18N, name); return p, json.loads(io.open(p, encoding="utf-8").read(), object_pairs_hook=collections.OrderedDict)
def save(p, d): io.open(p, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=1) + "\n")
class Seen(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.skip = 0; self.found = set()
    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style"): self.skip += 1
        for k, v in attrs:
            if k in ("alt", "aria-label", "title", "placeholder") and v and norm(v): self.found.add(norm(v))
    def handle_endtag(self, tag):
        if tag in ("script", "style") and self.skip: self.skip -= 1
    def handle_data(self, data):
        if not self.skip and norm(data): self.found.add(norm(data))
sp = Seen(); sp.feed(io.open(os.path.join(ROOT, "index.html"), encoding="utf-8").read())
pe, en = load("source-en.json")
have = set(norm(t) for t in en["strings"])
add = [i for i, k in enumerate(KEYS) if norm(k) not in have]
pk, keep = load("keep-en.json")
more = [k for k in KEEP if k not in keep["exact"]]
if CHECK:
    ok = not add and not more
    print("OK: the texts of item 148 are in the language sources" if ok else "CHANGES: %d texts and %d keep-en lines of item 148 are missing; run without --check" % (len(add), len(more)))
    sys.exit(0 if ok else 1)
if more:
    keep["exact"].extend(more); save(pk, keep); print("keep-en.json: %d lines added" % len(more))
if not add: print("nothing to add"); sys.exit(0)
missing = [KEYS[i] for i in add if i < 6 and norm(KEYS[i]) not in sp.found]
if missing: sys.exit("STOP: index.html does not carry item 148 yet (run source/ux148/apply.py --live first). Nothing was written to the language files.")
rt = en.setdefault("runtime", [])
n0 = len(en["strings"])
codes = [c for c in TR]
for c in codes:
    p, d = load(c + ".json")
    if len(d["strings"]) != n0: sys.exit("STOP: i18n/%s.json has %d texts, English %d. Nothing was written." % (c, len(d["strings"]), n0))
for i in add:
    en["strings"].append(KEYS[i])
    if ("{x}" in KEYS[i] or norm(KEYS[i]) not in sp.found) and KEYS[i] not in rt: rt.append(KEYS[i])
save(pe, en)
for c in codes:
    p, d = load(c + ".json")
    for i in add: d["strings"].append(TR[c][i])
    save(p, d)
print("added %d texts to %d languages (%d -> %d each); %d of them under runtime" % (len(add), len(codes), n0, n0 + len(add), sum(1 for i in add if KEYS[i] in rt)))
