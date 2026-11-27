#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Item 148: shareable views, one master for the labs' sound, structured data, link and picture hygiene, folds,
and the two ways to book pointing at each other.

    python3 source/ux148/apply.py                 reads index.html, writes the draft index_ux148_entwurf.html
    python3 source/ux148/apply.py --live          writes index.html itself (only after Martin's "go 148"; back up first)
    python3 source/ux148/apply.py --check [FILE]  changes nothing; says whether FILE (default index.html) carries item 148
    python3 source/ux148/apply.py --in A --out B  any other pair of files

It is safe to run again: every step looks first whether it is already done. It also patches source/hear134/hear.js
and the two section files that carry links (hear134/hear.html, myth135/myth.html), so their own apply.py keeps
what this one wrote. Reads ux_head.js, ux.css, ux.js and atlas.html beside it. No library needed.

Facts: this script types none. The structured data (events, papers) is read from the page's own rows, which
apply_facts.py writes; picture sizes are read from the picture files."""
import io, json, os, re, struct, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HERE))
argv = sys.argv[1:]
CHECK, LIVE = "--check" in argv, "--live" in argv
def opt(name):
    return argv[argv.index(name) + 1] if name in argv and argv.index(name) + 1 < len(argv) else None
rest = [a for i, a in enumerate(argv) if not a.startswith("--") and (i == 0 or argv[i - 1] not in ("--in", "--out", "--site"))]
SITE = opt("--site") or SITE
SRC = opt("--in") or (rest[0] if rest else os.path.join(SITE, "index.html"))
OUT = SRC if (LIVE or CHECK) else (opt("--out") or os.path.join(os.path.dirname(SRC), "index_ux148_entwurf.html"))
BASE = "https://sethschwarz.com/"
# Links that open a new tab already carry rel="noopener" (that is the protection). "noreferrer" on top would hide from
# YouTube, Bandcamp and the others that a visit came from sethschwarz.com. Off since 28 Nov 2026 (Martin asked which is
# better; advice: off). Set it to True and run again to switch it on everywhere.
NOREFERRER = False
notes = []

def rd(p):
    return io.open(p, encoding="utf-8").read()
def part(n):
    return rd(os.path.join(HERE, n)).rstrip("\n")
def stop(msg):
    sys.exit("ux148: " + msg)

def once(s, old, new, what):
    """Replace old by new where old stands exactly once; do nothing where new already stands."""
    if new in s:
        return s
    n = s.count(old)
    if n != 1:
        stop("%s: expected the old code once, found it %d times. The page has changed here; look before going on." % (what, n))
    return s.replace(old, new)

def block(s, name, body, place):
    """Write body between <!-- ux148-NAME:start/end -->; place(s, block) puts it in the first time."""
    a, z = "<!-- ux148-%s:start -->" % name, "<!-- ux148-%s:end -->" % name
    b = a + body + z
    if a in s:
        i = s.index(a); j = s.index(z, i) + len(z)
        return s[:i] + b + s[j:]
    return place(s, b)

def before(anchor, what, nth=0, tail="\n"):
    def f(s, b):
        idx = [m.start() for m in re.finditer(re.escape(anchor), s)]
        if len(idx) <= nth:
            stop("%s: anchor not found" % what)
        k = idx[nth]
        return s[:k] + b + tail + s[k:]
    return f

# ---------------------------------------------------------------------------------------------------------------
# 1. sound: one controller, one master, soft ramps
# ---------------------------------------------------------------------------------------------------------------
OUTX = "(window.SSAudio?window.SSAudio.out(c):c.destination)"

def sound(s):
    s = block(s, "audio", "<script>\n" + part("ux_head.js") + "\n</script>", before("<!-- audio123:start -->", "audio controller", tail=""))
    # frequency lab (both sides share this code)
    s = once(s, 'function ctx(){ if(!ac){ ac=new AC(); } if(ac.state==="suspended") ac.resume(); return ac; }',
                'function ctx(){ var SSA=window.SSAudio, shared=SSA?SSA.ctx():null; if(shared){ ac=shared; return ac; } if(!ac){ ac=new AC(); } if(ac.state==="suspended") ac.resume(); return ac; }', "lab ctx")
    s = once(s, 'out.gain.setValueAtTime(0.0001,c.currentTime); out.gain.exponentialRampToValueAtTime(coarse?0.18:0.09,c.currentTime+0.6); out.connect(c.destination);',
                'out.gain.setValueAtTime(0,c.currentTime); out.gain.setTargetAtTime(coarse?0.18:0.09,c.currentTime,0.12); out.connect(' + OUTX + ');', "lab start")
    s = once(s, 'try{ oOut.gain.cancelScheduledValues(t0); oOut.gain.setValueAtTime(Math.max(0.0001,oOut.gain.value),t0); }catch(e){} oOut.gain.setTargetAtTime(0.0001,t0,0.03);',
                'oOut.gain.setTargetAtTime(0,t0,0.03);', "lab crossfade, old bus")
    s = once(s, 'nOut.gain.setValueAtTime(0.0001,t0); nOut.gain.setTargetAtTime(coarse?0.18:0.09,t0+0.02,0.05); nOut.connect(c.destination);',
                'nOut.gain.setValueAtTime(0,t0); nOut.gain.setTargetAtTime(coarse?0.18:0.09,t0+0.02,0.05); nOut.connect(' + OUTX + ');', "lab crossfade, new bus")
    s = once(s, 's.out.gain.setTargetAtTime(0.0001,c.currentTime,0.12);', 's.out.gain.setTargetAtTime(0,c.currentTime,0.05);', "lab stop")
    # brain model
    s = once(s, 'if (!ac) ac = new AC(); if (ac.state === "suspended") ac.resume();\n      var c = ac, t = c.currentTime,',
                'var SSA = window.SSAudio, shared = SSA ? SSA.ctx() : null; if (shared) ac = shared; else { if (!ac) ac = new AC(); if (ac.state === "suspended") ac.resume(); }\n      var c = ac, t = c.currentTime,', "brain ctx")
    s = once(s, 'out.gain.setValueAtTime(0.0001, t); out.gain.exponentialRampToValueAtTime(k === "bin" ? .13 : .09, t + .6); out.connect(c.destination); s.out = out;',
                'out.gain.setValueAtTime(0, t); out.gain.setTargetAtTime(k === "bin" ? .13 : .09, t, .12); out.connect(SSA ? SSA.out(c) : c.destination); s.out = out;', "brain start")
    s = once(s, 's.out.gain.cancelScheduledValues(t); s.out.gain.setTargetAtTime(0.0001, t, .12);', 's.out.gain.setTargetAtTime(0, t, .05);', "brain stop")
    # biofeedback
    s = once(s, 'if (!ac) { try { ac = new AC(); } catch (e) { return null; } master = ac.createGain(); master.gain.value = 0.7; master.connect(ac.destination); }\n    if (ac.state === "suspended")',
                'var SSA = window.SSAudio, shared = SSA ? SSA.ctx() : null;\n    if (!ac) { if (shared) ac = shared; else { try { ac = new AC(); } catch (e) { return null; } } master = ac.createGain(); master.gain.value = 0.7; master.connect(SSA ? SSA.out(ac) : ac.destination); }\n    if (ac.state === "suspended")', "biofeedback")
    return hear(s, "page")

def hear(s, what):
    """The listening lab: the same four changes go into the page and into source/hear134/hear.js."""
    s = once(s, '      if (!ac) { try { ac = new AC(); } catch (e) { return null; } }\n      try { if (navigator.audioSession)',
                '      var SSA = window.SSAudio, shared = SSA ? SSA.ctx() : null;\n      if (!ac) { if (shared) ac = shared; else { try { ac = new AC(); } catch (e) { return null; } } }\n      try { if (navigator.audioSession)', "listening lab ctx (%s)" % what)
    s = once(s, 'o.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + T + .35);',
                'o.connect(g); g.connect(window.SSAudio ? window.SSAudio.out(c) : c.destination); o.start(t0); o.stop(t0 + T + .35);', "sweep out (%s)" % what)
    s = once(s, 'lp.connect(m); m.connect(c.destination); st.nodes = { m: m, os: os };',
                'lp.connect(m); m.connect(window.SSAudio ? window.SSAudio.out(c) : c.destination); st.nodes = { m: m, os: os };', "hum out (%s)" % what)
    s = once(s, 'st.g.gain.cancelScheduledValues(n); st.g.gain.setTargetAtTime(0, n, .03); st.osc.stop(n + .2);',
                'if (st.g.gain.cancelAndHoldAtTime) st.g.gain.cancelAndHoldAtTime(n); else st.g.gain.cancelScheduledValues(n); st.g.gain.setTargetAtTime(0, n, .03); st.osc.stop(n + .2);', "sweep stop (%s)" % what)
    return s

# ---------------------------------------------------------------------------------------------------------------
# 2. the view in the link
# ---------------------------------------------------------------------------------------------------------------
LAB_API = ('lab.__ssLab={get:function(){ return {f:f,mode:mode,sch:sch,schN:schN,pitch:pitch,on:!!snd,coarse:!!coarse}; },'
           'set:function(o){ o=o||{}; if(typeof o.pitch==="number"&&isFinite(o.pitch)) setPitch(o.pitch);'   # sets the view, starts no sound
           ' if(o.sch){ sch=true; schN=(o.schN>=0&&o.schN<SCH.length)?o.schN:-1; setF(schN<0?7.83:SCH[schN][0],"beat",true); schUI(); }'
           ' else if(typeof o.f==="number"&&isFinite(o.f)){ if(sch){ sch=false; schUI(); } setF(Math.max(FMIN,Math.min(FMAX,o.f)),o.mode==="club"?"club":"beat"); }'
           ' if(calm) wake(); }};   // item 148: the link reads and sets the lab through this\n    ')
SHARE = '<div class="ux-row"><button type="button" class="ux-share">Copy link to this view</button><p class="ux-st" role="status" aria-live="polite"></p></div>'

def view(s):
    s = once(s, '(function(){ var d=document, r=d.documentElement, s=null, h=(location.hash||"").replace("#","");',
                '(function(){ var d=document, r=d.documentElement, s=null, h=(location.hash||"").replace("#","").split("&")[0];', "first paint")
    s = once(s, 'function fromHash(){ var h=(location.hash||"").replace("#","");',
                'function fromHash(){ var h=(location.hash||"").replace("#","").split("&")[0];', "fromHash")
    s = once(s, 'var api={stop:stopSnd};', LAB_API + 'var api={stop:stopSnd};', "lab api")
    s = block(s, "share-d", SHARE, before('      <p class="fl-sst" hidden>', "share row, day lab", 0, "\n"))
    s = block(s, "share-n", SHARE, before('      <p class="fl-sst" hidden>', "share row, night lab", 1, "\n"))
    s = block(s, "atlas", "\n" + part("atlas.html") + "\n  ", before('  <p class="wa-note">', "atlas fold", 0, "\n"))
    return s

# ---------------------------------------------------------------------------------------------------------------
# 3. structured data, read from the page
# ---------------------------------------------------------------------------------------------------------------
MON = {"Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6, "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12}
EVENT_TAGS = ("Performance", "Keynote", "Panel", "Panel host", "Masterclass", "Opening", "Talk", "Workshop")

def text(h):
    h = re.sub(r"<[^>]+>", "", h)
    for a, b in (("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"), ("&quot;", '"'), ("&#39;", "'"), ("&nbsp;", " ")):
        h = h.replace(a, b)
    return re.sub(r"\s+", " ", h).strip()

def dates(y):
    """'7 Nov 2026' | '21–22 Oct 2026' | 'Oct 2023' | '2023' -> (start, end or None) in ISO form."""
    y = y.replace("–", "-").strip()
    m = re.match(r"^(\d{1,2})(?:-(\d{1,2}))? ([A-Z][a-z]{2}) (\d{4})$", y)
    if m and m.group(3) in MON:
        d = "%s-%02d-" % (m.group(4), MON[m.group(3)])
        return d + "%02d" % int(m.group(1)), (d + "%02d" % int(m.group(2))) if m.group(2) else None
    m = re.match(r"^([A-Z][a-z]{2}) (\d{4})$", y)
    if m and m.group(1) in MON:
        return "%s-%02d" % (m.group(2), MON[m.group(1)]), None
    m = re.match(r"^(\d{4})$", y)
    return (m.group(1), None) if m else (None, None)

def rows(html):
    out = []
    for m in re.finditer(r'<div class="row"><span class="yr">(.*?)</span><p class="main"><b>(.*?)</b><span>(.*?)</span>(?:<a class="lk" href="([^"]+)"[^>]*>(.*?)</a>)?</p><span class="tagx">(.*?)</span></div>', html, re.S):
        out.append({"yr": text(m.group(1)), "name": text(m.group(2)), "desc_html": m.group(3), "desc": text(m.group(3)), "href": m.group(4), "link": text(m.group(5) or ""), "tag": text(m.group(6))})
    return out

def place(name, desc):
    """Where it was, taken from the row's own words: what follows the first comma of the title if it reads as a
    name, otherwise the last part of the line below it. Returns (event name, place name or None)."""
    if ", " in name:
        head, tail = name.split(", ", 1)
        if tail[:1].isupper():
            return head, tail
    if ", " in desc:
        tail = desc.rsplit(", ", 1)[1]
        if tail[:1].isupper() and len(tail.split()) <= 5 and not re.search(r"[.!?”\"]$", tail):
            return name, tail
    return name, None

def slug(t):
    t = t.lower().replace("æ", "ae")
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")[:40]

def jsonld(s):
    m = re.search(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)
    if not m:
        stop("structured data: the page's JSON-LD block was not found")
    data = json.loads(m.group(1))
    graph = data["@graph"]
    martin = BASE + "#martin"
    person = [n for n in graph if n.get("@id") == martin]
    if not person:
        stop("structured data: the Person node #martin was not found")
    person = person[0]
    keep = [n for n in graph if not (str(n.get("@id", "")).startswith(BASE + "#ev-") or n.get("@type") in ("ScholarlyArticle", "Thesis"))]

    # appearances: the rows under "One booking, two slots."
    i = s.find("<h2>One booking, two slots.</h2>")
    if i < 0:
        stop("structured data: the list of appearances was not found")
    sec = s[i:s.index("</section>", i)]
    events = []
    for r in rows(sec):
        if r["tag"] not in EVENT_TAGS:
            continue
        a, z = dates(r["yr"])
        if not a:
            notes.append("structured data: no date read from %r, row left out" % r["yr"]); continue
        nm, where = place(r["name"], r["desc"])
        e = {"@type": "Event", "@id": BASE + "#ev-" + a + "-" + slug(nm), "name": nm, "startDate": a}
        if z: e["endDate"] = z
        e["description"] = r["desc"]
        if where: e["location"] = {"@type": "Place", "name": where}
        else: notes.append("structured data: no place read for %r" % nm)
        e["performer"] = {"@id": martin}
        if r["href"] and "youtube.com" not in r["href"] and "youtu.be" not in r["href"]:
            e["url"] = r["href"]
        events.append(e)

    # research: the rows under "Research" in #dRecord
    i = s.find('<section class="blk col" id="dRecord">')
    if i < 0:
        stop("structured data: #dRecord was not found")
    rec = s[i:s.index("</section>", i)]
    a = rec.find('<div class="rec-h">Research</div>'); z = rec.find('<div class="rec-h">Press</div>')
    papers = []
    for r in rows(rec[a:z if z > a else len(rec)]):
        if not r["href"]:
            continue
        if r["tag"] == "Thesis":
            title, _, org = r["name"].partition(", ")
            n = {"@type": "Thesis", "@id": r["href"], "name": title, "description": r["desc"], "author": {"@id": martin}, "datePublished": r["yr"], "url": r["href"]}
            if org: n["sourceOrganization"] = {"@type": "CollegeOrUniversity", "name": org}
            if "Written in German" in r["desc"]: n["inLanguage"] = "de"
            papers.append(n); continue
        m2 = re.match(r"^(?P<au>.+?), et al\. (?P<ti>.+)\. (?P<vol>[0-9][0-9():–\-]*)\.$", r["desc"])
        if not m2:
            notes.append("structured data: citation not read: %r" % r["desc"][:60]); continue
        authors = []
        for name in m2.group("au").split(", "):
            authors.append({"@id": martin} if name.startswith("Zschornak") else {"@type": "Person", "name": name})
        n = {"@type": "ScholarlyArticle", "@id": r["href"], "headline": m2.group("ti"), "name": m2.group("ti"), "author": authors,
             "isPartOf": {"@type": "Periodical", "name": r["name"]}, "datePublished": r["yr"], "url": r["href"]}
        doi = re.match(r"^https://doi\.org/(.+)$", r["href"])
        if doi: n["identifier"] = {"@type": "PropertyValue", "propertyID": "DOI", "value": doi.group(1)}
        v = re.match(r"^(\d+)(?:\((\d+)\))?:(.+)$", m2.group("vol"))
        if v: n["pagination"] = v.group(3)
        papers.append(n)

    if events: person["performerIn"] = [{"@id": e["@id"]} for e in events]
    if "In English or German." in s: person["knowsLanguage"] = ["en", "de"]
    langs = re.search(r"var LANGS=(\[\[.*?\]\]);", s)
    if langs:
        codes = re.findall(r'\["([a-z]{2,3})"', langs.group(1))
        for n in keep:
            if n.get("@type") == "WebSite" and codes: n["inLanguage"] = codes
    data["@graph"] = keep + events + papers
    out = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    notes.append("structured data: %d events, %d publications" % (len(events), len(papers)))
    return s[:m.start(1)] + out + s[m.end(1):]

# ---------------------------------------------------------------------------------------------------------------
# 4. links and pictures
# ---------------------------------------------------------------------------------------------------------------
def links(s):
    """Every link that opens a new tab carries rel="noopener"; with NOREFERRER also "noreferrer"."""
    if NOREFERRER:
        s = s.replace('rel="noopener"', 'rel="noopener noreferrer"').replace("rel='noopener'", "rel='noopener noreferrer'")
        s = s.replace("'_blank','noopener')", "'_blank','noopener,noreferrer')")
    spans = [(m.start(), m.end()) for m in re.finditer(r"<(script|style)\b.*?</\1>", s, re.S)]
    bare = [m.group(0)[:80] for m in re.finditer(r'<a\b[^>]*target="_blank"[^>]*>', s) if "noopener" not in m.group(0) and not any(a <= m.start() < z for a, z in spans)]
    if bare: stop("links: %d link(s) open a new tab without rel=\"noopener\": %s" % (len(bare), bare[0]))
    return s

def dialog(s):
    """The enlarged cover in the dialog says what it shows (the page already has "Cover of {x}" in every language)."""
    return once(s, "if(src){mImg.src=src;mImg.style.display='block';", "if(src){mImg.src=src;mImg.alt='Cover of '+t;mImg.style.display='block';", "cover dialog")

def imgsize(p):
    """(width, height) of a PNG, GIF, JPEG or WebP file, read from its header."""
    with open(p, "rb") as f:
        b = f.read(64)
        if b[:8] == b"\x89PNG\r\n\x1a\n":
            return struct.unpack(">II", b[16:24])
        if b[:6] in (b"GIF87a", b"GIF89a"):
            return struct.unpack("<HH", b[6:10])
        if b[:4] == b"RIFF" and b[8:12] == b"WEBP":
            k = b[12:16]
            if k == b"VP8 ":
                w, h = struct.unpack("<HH", b[26:30]); return w & 0x3FFF, h & 0x3FFF
            if k == b"VP8L":
                n = struct.unpack("<I", b[21:25])[0]; return (n & 0x3FFF) + 1, ((n >> 14) & 0x3FFF) + 1
            if k == b"VP8X":
                return int.from_bytes(b[24:27], "little") + 1, int.from_bytes(b[27:30], "little") + 1
        if b[:2] == b"\xff\xd8":
            f.seek(2)
            while True:
                m = f.read(4)
                if len(m) < 4 or m[0] != 0xFF: break
                n = struct.unpack(">H", m[2:4])[0]
                if m[1] in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                    d = f.read(5); h, w = struct.unpack(">HH", d[1:5]); return w, h
                f.seek(n - 2, 1)
    return None

def pictures(s, site):
    """Every <img> of the markup (not the ones scripts write) gets the width and height of its file."""
    spans = [(m.start(), m.end()) for m in re.finditer(r"<(script|style)\b.*?</\1>", s, re.S)]
    def inside(k):
        for a, z in spans:
            if a <= k < z: return True
        return False
    out, last, added, missing = [], 0, 0, []
    for m in re.finditer(r"<img\b([^>]*)>", s):
        if inside(m.start()): continue
        at = m.group(1)
        if re.search(r'\bwidth="', at) and re.search(r'\bheight="', at): continue
        src = re.search(r'\bsrc="([^"]*)"', at)
        if not src or not src.group(1) or re.match(r"^(https?:|data:|//)", src.group(1)): continue
        p = os.path.join(site, src.group(1).split("?")[0])
        wh = imgsize(p) if os.path.isfile(p) else None
        if not wh:
            missing.append(src.group(1)); continue
        k = m.start(1) + src.end()
        out.append(s[last:k]); out.append(' width="%d" height="%d"' % wh); last = k; added += 1
    out.append(s[last:])
    s = "".join(out)
    # (The three phone crops of the moon pictures keep their <source> as source/moon106/apply.py writes it:
    #  a size there would make that script's own check say "not yet".)
    if added: notes.append("pictures: width and height added to %d" % added)
    if missing: notes.append("pictures: no file or no size for %s" % ", ".join(sorted(set(missing))[:8]))
    return s

# ---------------------------------------------------------------------------------------------------------------
# 5. the two ways to book point at each other
# ---------------------------------------------------------------------------------------------------------------
def booking(s):
    # the addresses themselves are never typed here (rule A3): the page carries them, written from facts.json
    fine = re.search(r'<p class="fine">Shows are booked separately, as Seth Schwarz, through Schwarzbooking: [^<]+</p>', s)
    if not fine: stop("booking: the line under the speaking enquiry was not found")
    s = block(s, "cross-d", '<button type="button" class="ux-cross" data-book="night">Request a date</button>',
              lambda s, b: s[:fine.end()] + "\n        " + b + s[fine.end():])
    if 'id="nMail"' not in s:
        mail = list(re.finditer(r'(<div><div class="lab">Email</div><p class="val")(>[^<]+</p>)(</div>)', s))
        if len(mail) != 1: stop("booking: the agency's address in #book was not found")
        m = mail[0]
        s = (s[:m.start()] + m.group(1) + ' id="nMail"' + m.group(2)
             + '<!-- ux148-copy-n:start --><button type="button" class="copy ux-copy" data-copy="nMail">Copy address</button><!-- ux148-copy-n:end -->'
             + m.group(3) + s[m.end():])
    talks = '<div><div class="lab">Talks</div><p class="val">Booked as Dr. Martin Zschornak, on the day side</p>'
    if talks not in s: stop("booking: the Talks cell in #book was not found")
    s = block(s, "cross-n", '<button type="button" class="ux-cross" data-book="day">Invite him to speak</button>',
              lambda s, b: s.replace(talks, talks + b, 1))
    return s

# ---------------------------------------------------------------------------------------------------------------
def page(s, site):
    s = sound(s)
    s = view(s)
    s = booking(s)
    s = links(s)
    s = dialog(s)
    s = pictures(s, site)
    s = jsonld(s)
    k = s.rfind("</body>")
    if k < 0: stop("</body> not found")
    js = part("ux.js").replace("var NOREF = false;", "var NOREF = %s;" % ("true" if NOREFERRER else "false"))
    s = block(s, "page", "\n<style>\n" + part("ux.css") + "\n</style>\n<script>\n" + js + "\n</script>\n", lambda s, b: s[:k] + b + "\n" + s[k:])
    return s

def sources(site, write):
    """Keep the other items' own sources in step, so their apply.py does not undo this one."""
    changed = []
    for rel, fn in (("source/hear134/hear.js", lambda t: hear(t, "hear.js")), ("source/hear134/hear.html", links), ("source/myth135/myth.html", links)):
        p = os.path.join(site, rel)
        if not os.path.isfile(p):
            notes.append("source not here, left as it is: " + rel); continue
        t = rd(p); u = fn(t)
        if u != t:
            changed.append(rel)
            if write: io.open(p, "w", encoding="utf-8", newline="").write(u)
    return changed

s0 = rd(SRC)
s1 = page(s0, SITE)
said = list(notes); del notes[:]
s2 = page(s1, SITE)
del notes[:]
if s2 != s1:
    stop("not stable: a second run would change the page again. Nothing written.")
if CHECK:
    ch = sources(SITE, False)
    ok = s1 == s0 and not ch
    print("OK: %s carries item 148" % os.path.basename(SRC) if ok else "CHANGES: %s does not carry the current item 148%s; run without --check" % (os.path.basename(SRC), (" (sources: " + ", ".join(ch) + ")") if ch else ""))
    sys.exit(0 if ok else 1)
ch = sources(SITE, True)
if s1 != s0 or OUT != SRC:
    io.open(OUT, "w", encoding="utf-8", newline="").write(s1); print("ux148: written " + OUT)
else:
    print("ux148: nothing to change in " + OUT)
if ch: print("ux148: sources brought in step: " + ", ".join(ch))
for n in said + notes: print("  " + n)
