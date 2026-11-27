#!/usr/bin/env python3
"""Item 133: booking window in Safari (Mac).
Safari collapsed the booking dialog to a 2 px line: the form and its body used flex:1 (base size 0%)
inside a dialog that only has a max-height, and WebKit resolves that base to 0. flex:1 1 auto keeps
the shrink and the scroll, and gives Safari the content height.
Second Safari quirk: an empty date field shows today's date, so it looks filled. Empty date fields are
now dimmed until a date is picked.
Usage: python3 apply.py [path/to/index.html]   (idempotent; prints what it changed)"""
import sys, io
p = sys.argv[1] if len(sys.argv) > 1 else "index.html"
s = io.open(p, encoding="utf-8").read(); n0 = s
R = [
 (".bk .bk-form{display:flex;flex-direction:column;flex-wrap:nowrap;gap:0;min-height:0;flex:1;margin:0}",
  ".bk .bk-form{display:flex;flex-direction:column;flex-wrap:nowrap;gap:0;min-height:0;flex:1 1 auto;margin:0}"),
 (".bk-body{flex:1;min-height:0;overflow:auto;",
  ".bk-body{flex:1 1 auto;min-height:0;overflow:auto;"),
 (".bk-fields input::placeholder,",
  ".bk-fields input.bk-empty::-webkit-datetime-edit{opacity:.42}   /* fix133: Safari shows today's date in an empty date field */\n.bk-fields input::placeholder,"),
 ('function read() { each.call(q.fields.querySelectorAll("input,select,textarea"), function (n) { vals[n.name] = n.value; }); }',
  'function read() { each.call(q.fields.querySelectorAll("input,select,textarea"), function (n) { vals[n.name] = n.value; if (n.type === "date") n.classList.toggle("bk-empty", !n.value); }); }'),
]
done = 0
for a, b in R:
    if b in s: continue
    c = s.count(a)
    if c != 1: sys.exit("fix133: anchor found %d times: %s" % (c, a[:60]))
    s = s.replace(a, b); done += 1
if s != n0: io.open(p, "w", encoding="utf-8").write(s)
print("fix133: %d change(s), %s" % (done, "already applied" if done == 0 else "written"))
