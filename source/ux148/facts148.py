#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Item 148: the five papers behind the wave atlas go into data/facts.json -> quellen_klang (rule A1: facts first).
    python3 source/ux148/facts148.py [--check]      a second run adds nothing; backup data/facts_before_148.bak.json
Checked on 27 Nov 2026 against the publishers' pages, Scilit, NASA ADS and JSTOR."""
import io, json, os, shutil, sys, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
P = os.path.join(ROOT, "data", "facts.json"); B = os.path.join(ROOT, "data", "facts_before_148.bak.json")
NEW = collections.OrderedDict([
 ("wellenatlas_gabel", {"befund": "Wellenfront-Versetzung: eine Linie, an der die Amplitude null ist und eine Wellenfront endet", "quelle": "Nye JF, Berry MV. Dislocations in wave trains. Proc R Soc Lond A 1974;336(1605):165-190", "doi": "10.1098/rspa.1974.0012", "fuer": "Punkt 148"}),
 ("wellenatlas_wabe", {"befund": "Faraday-Wellen: stehende Muster auf einer geschuettelten Fluessigkeitsschicht, zuerst von Faraday beschrieben", "quelle": "Faraday M. On a peculiar class of acoustical figures; and on certain forms assumed by groups of particles upon vibrating elastic surfaces. Philos Trans R Soc Lond 1831;121:299-340", "url": "https://www.jstor.org/stable/107936", "fuer": "Punkt 148"}),
 ("wellenatlas_quasi", {"befund": "Zwoelfzaehliges Quasimuster in Faraday-Wellen: geordnet, aber ohne Wiederholung", "quelle": "Edwards WS, Fauve S. Parametrically excited quasicrystalline surface waves. Phys Rev E 1993;47:R788-R791", "doi": "10.1103/PhysRevE.47.R788", "fuer": "Punkt 148"}),
 ("wellenatlas_airy", {"befund": "Airy-Wellenpaket: laeuft ohne Verformung und beschleunigt dabei, die Bahn ist eine Parabel", "quelle": "Berry MV, Balazs NL. Nonspreading wave packets. Am J Phys 1979;47(3):264-267", "doi": "10.1119/1.11855", "fuer": "Punkt 148"}),
 ("wellenatlas_airy_licht", {"befund": "Erste Beobachtung von Airy-Strahlen in Licht", "quelle": "Siviloglou GA, Broky J, Dogariu A, Christodoulides DN. Observation of accelerating Airy beams. Phys Rev Lett 2007;99:213901", "doi": "10.1103/PhysRevLett.99.213901", "fuer": "Punkt 148"}),
])
d = json.loads(io.open(P, encoding="utf-8").read(), object_pairs_hook=collections.OrderedDict)
q = d.get("quellen_klang")
if q is None: sys.exit("STOP: facts.json has no quellen_klang")
add = [k for k in NEW if k not in q]
if "--check" in sys.argv:
    print("OK: the five sources of the wave atlas are in facts.json" if not add else "CHANGES: %d sources are missing; run without --check" % len(add)); sys.exit(0 if not add else 1)
if not add: print("nothing to add"); sys.exit(0)
raw = io.open(P, encoding="utf-8").read()
if not os.path.exists(B): shutil.copy2(P, B)
for k in add: q[k] = NEW[k]
indent = 1 if raw.startswith('{\n "') else 2 if raw.startswith('{\n  "') else 1
io.open(P, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=indent) + ("\n" if raw.endswith("\n") else ""))
print("facts.json: %d sources added under quellen_klang (backup %s)" % (len(add), os.path.basename(B)))
