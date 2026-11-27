/* ===== ux148.js ===== */
/* Item 148 (source/ux148). ES5, no library, nothing loaded from elsewhere, nothing stored.
   1. The view of the wave atlas and of the frequency lab lives in the link:
        #day&lab=theta&beat=bin&sch=14.3&st=-3&atlas=hex
      lab    theta | gamma | club | delta | alpha | beta | a number of hertz from 1 to 45
      sch    all | 7.83 | 14.3 | 20.8 | 27.3 | 33.8      (the Schumann switch, all rates or one alone)
      st     pitch in semitones, -24 to 24, steps of 0.1
      beat   bin | mon | pul                              (the sound chosen for the brain model, day side)
      atlas  fork | hex | quasi | airy
      It is written with history.replaceState, a third of a second after the last change, so the back button keeps
      its meaning. Opening such a link sets everything up and plays nothing: sound starts on a press, as before.
   2. One quiet status line per lab says what just happened (a link was opened, the tab was away).
   3. The note under the biofeedback folds; its first line stays in sight.
   4. Links that open a new tab carry "noopener", also the ones scripts write later.
   5. The kit downloads say which language and which kind of file they are. */
(function () {
  "use strict";
  if (window.__ux148) return; window.__ux148 = 1;
  var root = document.documentElement, each = Array.prototype.forEach;
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return (c || document).querySelectorAll(s); }
  function side() { return root.getAttribute("data-side") === "night" ? "night" : "day"; }
  function up(el, sel) { return el && el.closest ? el.closest(sel) : null; }
  var calm = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var T_OPENED = "This link opened a saved view. Sound stays off until you press play.";
  var T_AWAY = "Sound stopped while this tab was in the background. Press play to start again.";
  var T_COPIED = "Link copied.";
  var T_BIO = "A demonstration, not a medical device. Nothing is recorded or sent.";

  /* ---------- the view in the link ---------- */
  var SCH = [7.83, 14.3, 20.8, 27.3, 33.8], BANDS = { delta: 2, theta: 6, alpha: 10, beta: 20, gamma: 40 };
  var KINDS = { bin: 1, mon: 1, pul: 1 }, ATLAS = { fork: 1, hex: 1, quasi: 1, airy: 1 };
  var labs = { day: document.getElementById("dLab"), night: document.getElementById("nLab") };
  var touched = { day: false, night: false }, seen = { day: "", night: "" }, beat = null, atlas = null, wtimer = 0, restoring = false, moved = false;
  function api(s) { var l = labs[s]; return l && l.__ssLab ? l.__ssLab : null; }
  function num(v) { return parseFloat(String(v).replace(",", ".")); }
  function show(n, d) { var s = n.toFixed(d); return s.indexOf(".") < 0 ? s : s.replace(/0+$/, "").replace(/\.$/, ""); }
  function key(s) { var a = api(s); if (!a) return ""; var g = a.get(); return [g.f.toFixed(3), g.mode, g.sch ? 1 : 0, g.schN, g.pitch].join("|"); }

  function parse(hash) {                                   /* "#day&lab=theta&st=-3" -> { side:"day", p:{ lab:"theta", st:"-3" }, any:true } */
    var parts = String(hash || "").replace(/^#/, "").split("&"), o = { side: null, p: {}, any: false };
    if (parts[0] === "day" || parts[0] === "night") o.side = parts.shift();
    else if (parts[0].indexOf("=") < 0) return o;          /* some other anchor of the page (#book, #nArcade): not ours */
    for (var i = 0; i < parts.length; i++) {
      var kv = parts[i].split("=");
      if (kv.length === 2 && /^(lab|beat|sch|st|atlas)$/.test(kv[0])) { try { o.p[kv[0]] = decodeURIComponent(kv[1]).toLowerCase(); o.any = true; } catch (e) {} }
    }
    return o;
  }
  function fromParams(p) {                                 /* the lab part of a link -> what the lab's own set() takes */
    var st = {}, has = false, v, i;
    if (p.st !== undefined) { v = num(p.st); if (isFinite(v)) { st.pitch = Math.round(Math.max(-24, Math.min(24, v)) * 10) * 10; has = true; } }
    if (p.sch !== undefined) {
      var n = -2;
      if (p.sch === "all" || p.sch === "on") n = -1;
      else { v = num(p.sch); if (isFinite(v)) { for (i = 0; i < SCH.length; i++) if (Math.abs(SCH[i] - v) < 0.06) n = i; if (n === -2 && v === Math.floor(v) && v >= 0 && v < SCH.length) n = v; } }
      if (n > -2) { st.sch = true; st.schN = n; has = true; }
    }
    if (!st.sch && p.lab !== undefined) {
      if (p.lab === "club") { st.f = 2.0667; st.mode = "club"; has = true; }
      else if (BANDS[p.lab]) { st.f = BANDS[p.lab]; st.mode = "beat"; has = true; }
      else { v = num(p.lab); if (isFinite(v)) { st.f = Math.max(1, Math.min(45, v)); st.mode = "beat"; has = true; } }
    }
    return has ? st : null;
  }
  function labParams(s) {                                  /* the lab of one side, as it stands -> "lab=theta&st=-3" */
    var a = api(s); if (!a) return "";
    var g = a.get(), out = [];
    if (g.sch) out.push("sch=" + (g.schN < 0 ? "all" : SCH[g.schN]));
    else if (g.mode === "club") out.push("lab=club");
    else out.push("lab=" + (Math.abs(g.f - 6) < 0.005 ? "theta" : Math.abs(g.f - 40) < 0.005 ? "gamma" : show(g.f, 2)));
    if (g.pitch !== (g.coarse ? 1200 : 0)) out.push("st=" + show(g.pitch / 100, 1));   /* a phone starts one octave up; only a change from the start is written */
    return out.join("&");
  }
  function compose(s) {
    var q = [];
    if (touched[s]) { var t = labParams(s); if (t) q.push(t); if (s === "day" && beat) q.push("beat=" + beat); }
    if (s === "day" && atlas) q.push("atlas=" + atlas);
    return "#" + s + (q.length ? "&" + q.join("&") : "");
  }
  function write(now) {
    clearTimeout(wtimer);
    var go = function () {
      var s = side(), h = compose(s);
      if (h === "#" + s && !parse(location.hash).any) return;   /* nothing of ours in the link and nothing to add: other anchors stay */
      if (location.hash === h) return;
      try { history.replaceState(history.state, "", location.pathname + location.search + h); } catch (e) {}
    };
    if (now) go(); else wtimer = setTimeout(go, 350);
  }
  function changed(s) {                                    /* has the lab moved since we last looked? then it belongs in the link */
    var k = key(s); if (!k || k === seen[s]) return false;
    seen[s] = k; if (!restoring) { touched[s] = true; write(); } return true;
  }

  /* one quiet line per lab */
  function line(lab) { return lab ? $(".ux-st", lab) : null; }
  function say(el, msg, kind) { if (!el) return; el.__k = kind || ""; if (el.textContent !== msg) el.textContent = msg; }   /* the kind is kept beside the words: the words may be translated */
  function clear(el, kind) { if (el && el.__k === kind) { el.__k = ""; el.textContent = ""; } }
  function hush(s) { var el = line(labs[s]); if (el && el.__k && el.__k !== "copied") { el.__k = ""; el.textContent = ""; } }

  /* the sound chosen for the brain model: marked, never started from here */
  function arm(k, tries) {
    var bs = $$(".brn-b"), found = false;
    each.call(bs, function (b) { var on = !!k && b.getAttribute("data-k") === k; b.classList.toggle("ux-armed", on); if (on) found = true; });
    if (k && !found && (tries || 0) < 20) setTimeout(function () { if (beat === k) arm(k, (tries || 0) + 1); }, 300);
  }

  function hookLab(s) {
    var lab = labs[s]; if (!lab) return;
    seen[s] = key(s);
    var look = function () { changed(s); };
    lab.addEventListener("input", function () { hush(s); look(); });
    lab.addEventListener("click", function (e) {
      var b = up(e.target, "button,[role=switch]"); if (!b || b.classList.contains("ux-share")) return;
      hush(s);
      if (s === "day") {
        if (b.classList.contains("brn-b")) { beat = b.getAttribute("data-k"); arm(null); touched.day = true; write(); }
        else if (b.classList.contains("fl-play")) { if (beat) { beat = null; arm(null); write(); } }
      }
      setTimeout(look, 0);
    });
    /* a change that did not come from a press inside the lab (the biofeedback can set the frequency) shows in the read-outs */
    if (window.MutationObserver) {
      var mo = new MutationObserver(look), o = { childList: true, characterData: true, subtree: true };
      var r1 = $(".fl-read", lab), r2 = $(".fl-pr", lab); if (r1) mo.observe(r1, o); if (r2) mo.observe(r2, o);
    }
  }

  function jump(el) {
    if (!el) return;
    var go = function () { if (!moved) { try { el.scrollIntoView({ block: "start" }); } catch (e) { el.scrollIntoView(true); } } };
    setTimeout(go, 60);
    if (document.readyState !== "complete") window.addEventListener("load", function () { setTimeout(go, 60); });
  }
  function restore(first) {
    var o = parse(location.hash); if (!o.any) return false;
    var s = o.side || side(), st = fromParams(o.p), a = api(s), lab = false, pic = false;
    restoring = true;
    try {
      if (st && a) { a.set(st); seen[s] = key(s); touched[s] = true; lab = true; }
      if (s === "day") {
        if (o.p.beat && KINDS[o.p.beat]) { beat = o.p.beat; arm(beat); touched.day = true; lab = true; }
        if (o.p.atlas && ATLAS[o.p.atlas] && pick) { pick(o.p.atlas, true); pic = !!atlas; }
      }
    } catch (e) {}
    restoring = false;
    if (lab) say(line(labs[s]), T_OPENED, "opened");
    if (lab || pic) { moved = false; jump(lab ? labs[s] : document.getElementById("dWaves")); }
    return lab || pic;
  }

  /* ---------- wave atlas: choose a picture ---------- */
  var wa = document.getElementById("dWaves"), fold = document.getElementById("waMore"), picks = {}, items = {}, pick = null;
  if (wa && fold) {
    each.call($$(".wa-m", fold), function (m) { items[m.getAttribute("data-wa-item")] = m; });
    each.call($$("figure.wa-c", wa), function (fig) {
      var cv = $("canvas[data-wa]", fig), k = cv && cv.getAttribute("data-wa"), b = $("figcaption b", fig);
      if (!k || !b || !items[k]) return;
      if (!b.id) b.id = "waT-" + k;
      var btn = document.createElement("button"); btn.type = "button"; btn.className = "wa-pick";
      btn.setAttribute("aria-pressed", "false"); btn.setAttribute("aria-controls", items[k].id); btn.setAttribute("aria-labelledby", b.id + " waSum");
      btn.innerHTML = '<span aria-hidden="true"></span>';
      fig.appendChild(btn); fig.classList.add("wa-can"); picks[k] = { fig: fig, btn: btn };
      fig.addEventListener("click", function () { pick(atlas === k ? null : k); });
    });
    pick = function (k, quiet, fromFold) {
      atlas = k && picks[k] ? k : null;
      for (var n in picks) { var on = n === atlas; picks[n].btn.setAttribute("aria-pressed", String(on)); picks[n].fig.classList.toggle("wa-on", on); items[n].hidden = !!atlas && !on; }
      wa.classList.toggle("wa-has", !!atlas);
      if (atlas && !fold.open) fold.open = true;
      if (!atlas && !fromFold && fold.open) fold.open = false;
      if (quiet) return;
      write();
      if (atlas) { var r = items[atlas].getBoundingClientRect(); if (r.bottom > (window.innerHeight || 0) || r.top < 0) { try { items[atlas].scrollIntoView({ block: "nearest", behavior: calm ? "auto" : "smooth" }); } catch (e) {} } }
    };
    fold.addEventListener("toggle", function () { if (!fold.open && atlas) pick(null, false, true); });
  }

  /* ---------- copy the link ---------- */
  function copyText(txt, done) {
    var fallback = function () {
      var ok = false, ta = document.createElement("textarea");
      ta.value = txt; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0";
      document.body.appendChild(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta); done(ok);
    };
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(function () { done(true); }, fallback); return; } } catch (e) {}
    fallback();
  }
  each.call($$(".ux-share"), function (b) {
    b.addEventListener("click", function () {
      var lab = up(b, ".flab"), s = lab ? (lab.id === "nLab" ? "night" : "day") : "day";
      if (lab) touched[s] = true;
      write(true);
      var st = $(".ux-st", b.parentNode), url = location.href;
      copyText(url, function (ok) { say(st, ok ? T_COPIED : url, "copied"); if (ok) setTimeout(function () { clear(st, "copied"); }, 4000); });
    });
  });

  /* ---------- the tab was away ---------- */
  document.addEventListener("ss:audio-return", function (e) {
    var c = e.detail && e.detail.control; if (!c || !document.body.contains(c)) return;
    var lab = up(c, ".flab"), el = null;
    if (lab) el = line(lab);
    else if (up(c, ".bio-ctl")) el = $(".bio-status", up(c, ".bio-ctl"));
    else if (up(c, ".hr-card")) { var card = up(c, ".hr-card"); el = $(".ux-st", card); if (!el) { el = document.createElement("p"); el.className = "ux-st"; el.setAttribute("role", "status"); el.setAttribute("aria-live", "polite"); card.appendChild(el); card.addEventListener("click", function () { clear(el, "away"); }); } }
    say(el, T_AWAY, "away");
  });

  /* ---------- the note under the biofeedback folds ---------- */
  function foldBio() {
    var n = 0;
    each.call($$(".bio .bio-note"), function (p) {
      n++; if (p.getAttribute("data-ux148")) return; p.setAttribute("data-ux148", "1");
      var d = document.createElement("details"), s = document.createElement("summary");
      d.className = "fold120 ux-biofold"; s.textContent = T_BIO; d.appendChild(s);
      p.parentNode.insertBefore(d, p); d.appendChild(p);
    });
    return n;
  }
  (function () { var k = 0; if (foldBio() >= 2) return; var iv = setInterval(function () { if (foldBio() >= 2 || ++k > 40) clearInterval(iv); }, 250); })();

  /* ---------- links and downloads ---------- */
  var NOREF = false;                                       /* apply.py sets this from its NOREFERRER */
  function safe(e) {
    var a = up(e.target, 'a[target="_blank"]'); if (!a) return;
    var r = (a.getAttribute("rel") || "").split(/\s+/).filter(function (x) { return x; });
    if (r.indexOf("noopener") < 0) r.push("noopener"); if (NOREF && r.indexOf("noreferrer") < 0) r.push("noreferrer");
    if (a.getAttribute("rel") !== r.join(" ")) a.setAttribute("rel", r.join(" "));
  }
  ["pointerdown", "click", "auxclick", "contextmenu"].forEach(function (t) { document.addEventListener(t, safe, true); });
  each.call($$('.kits a[href$=".pdf"]'), function (a) { a.setAttribute("type", "application/pdf"); a.setAttribute("hreflang", up(a, ".kits-hsb") ? "hsb" : "en"); });

  /* ---------- start ---------- */
  ["wheel", "touchmove", "keydown"].forEach(function (t) { window.addEventListener(t, function () { moved = true; }, { passive: true }); });
  hookLab("day"); hookLab("night");
  restore(true);
  window.addEventListener("hashchange", function () { restore(false); });
  if (window.MutationObserver) new MutationObserver(function () { write(); }).observe(root, { attributes: true, attributeFilter: ["data-side"] });

  window.__ssView = { parse: parse, compose: function () { return compose(side()); }, get: function () { return { side: side(), touched: touched, beat: beat, atlas: atlas }; } };
})();
