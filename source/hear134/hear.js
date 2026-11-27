/* ===== hear134.js ===== */
/* Items 134 and 136 (Martin, 27 Nov 2026, 20:36: "134 und 136 go; ich hätte sehr gern animationen die auf diesen
   aufbauen - speziell das mit dem hirn ist cool").
   134 · hearing sweep: a quiet sine climbs from 250 Hz to 20 kHz in 26 s. The drawing follows it: a travelling wave
         runs along the cochlea and peaks at the place that hears that tone (Greenwood 1990), the hearing nerve carries
         it up through the brainstem, and the hearing cortex lights up at the matching place (it is sorted by pitch too).
   136 · one minute of humming: six rounds, 4 s in through the nose, 6 s humming out. The hum rings through the skull,
         the sinuses give nitric oxide into the nose (about fifteen-fold, Weitzberg & Lundberg 2002; a quick peak, then a
         slow fall, Maniscalco 2003), the brain shimmers along. A drawing, not a measurement.
   Texts are plain English in the page; the language switcher translates them (i18n, item 134 texts).
   ES5, no libraries. Respects "reduce motion". Stops when another sound on the page starts (ss:audio), when the tab
   is hidden and when the page switches to night. */
(function () {
  "use strict";
  if (window.__ssHear134) return; window.__ssHear134 = 1;

  function boot() {
    var sec = document.getElementById("dHear"); if (!sec) return;
    var root = document.documentElement;
    var RM = false; try { RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    var AC = window.AudioContext || window.webkitAudioContext, ac = null;
    var GOLD = "142,111,26", HOT = "223,193,102", INK = "18,16,43";
    var PI2 = Math.PI * 2;

    function audio() {
      if (!AC) return null;
      var SSA = window.SSAudio, shared = SSA ? SSA.ctx() : null;
      if (!ac) { if (shared) ac = shared; else { try { ac = new AC(); } catch (e) { return null; } } }
      try { if (navigator.audioSession) navigator.audioSession.type = "playback"; } catch (e) {}
      if (ac.state === "suspended") { try { ac.resume(); } catch (e) {} }
      return ac;
    }
    function say(id) { try { document.dispatchEvent(new CustomEvent("ss:audio", { detail: id })); } catch (e) {} }
    function rgba(c, a) { return "rgba(" + c + "," + (a < 0 ? 0 : a > 1 ? 1 : a).toFixed(3) + ")"; }

    /* ---------- shared drawing helpers ---------- */
    var seed = 29;
    function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
    function inPoly(x, y, P) {
      var c = false;
      for (var i = 0, j = P.length - 1; i < P.length; j = i++) {
        if (((P[i][1] > y) !== (P[j][1] > y)) && (x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0])) c = !c;
      }
      return c;
    }
    function spline(ctx, P, close) {   /* Catmull-Rom through the points */
      var n = P.length; if (n < 2) return;
      ctx.moveTo(P[0][0], P[0][1]);
      var last = close ? n : n - 1;
      for (var i = 0; i < last; i++) {
        var p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
        if (!close) { if (i === 0) p0 = p1; if (i + 2 >= n) p3 = p2; }
        ctx.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
      }
      if (close) ctx.closePath();
    }

    /* the brain, seen from the left side, frontal lobe to the left; unit box 1 wide, 0.95 high */
    var CEREB = [[.02, .44], [.03, .33], [.08, .21], [.17, .11], [.29, .05], [.43, .02], [.57, .03], [.70, .08], [.81, .16], [.90, .27], [.96, .38], [.985, .48], [.96, .56], [.90, .60], [.80, .61], [.70, .63], [.60, .67], [.50, .71], [.39, .72], [.30, .69], [.24, .63], [.20, .57], [.15, .535], [.09, .515], [.05, .49]];
    var STEM = [[.545, .62], [.645, .62], [.635, .76], [.615, .90], [.565, .90], [.55, .76]];
    var SULCI = [
      [[.23, .51], [.33, .455], [.45, .405], [.56, .372], [.63, .33]],          /* lateral (Sylvian) fissure */
      [[.50, .03], [.475, .13], [.45, .24], [.415, .35]],                        /* central sulcus */
      [[.30, .60], [.42, .56], [.55, .525], [.68, .51]],                         /* superior temporal sulcus */
      [[.40, .06], [.37, .17], [.34, .29]],                                      /* precentral */
      [[.58, .07], [.555, .19], [.53, .30]],                                     /* postcentral */
      [[.80, .15], [.83, .26], [.85, .36]],                                      /* parieto-occipital */
      [[.12, .30], [.22, .27], [.31, .25]]                                       /* frontal */
    ];
    var A1LO = [.395, .475], A1HI = [.585, .418];   /* hearing cortex along the upper temporal lobe, low to high */
    var CBL = { x: .80, y: .695, rx: .145, ry: .085 };
    /* folds: dots gather along the ridges of a smooth noise field, so the cloud reads as gyri and sulci */
    function hsh(i, j) { var v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); }
    function vn(x, y) {
      var i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
      var a = hsh(i, j), b = hsh(i + 1, j), c = hsh(i, j + 1), d = hsh(i + 1, j + 1);
      return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
    }
    var DOTS = (function () {
      var a = [], tries = 0;
      while (a.length < 1300 && tries < 60000) {
        tries++;
        var x = rnd(), y = rnd() * .95, z = -1;
        if (inPoly(x, y, CEREB)) z = 0;
        else if (Math.pow((x - CBL.x) / CBL.rx, 2) + Math.pow((y - CBL.y) / CBL.ry, 2) < 1) z = 1;
        else if (inPoly(x, y, STEM)) z = 2;
        if (z < 0) continue;
        var v, ridge;
        if (z === 1) { v = (y - CBL.y) * 38 + vn(x * 9, y * 9) * .8; ridge = Math.abs(v - Math.floor(v) - .5); }   /* the cerebellum: fine parallel folia */
        else if (z === 2) ridge = .05 + rnd() * .3;
        else { v = field(x, y); ridge = Math.abs(v - Math.floor(v) - .5); }
        var onR = ridge < .16;
        if (!onR && rnd() > .25) continue;
        a.push({ x: x, y: y, z: z, r: onR ? .55 + rnd() * .9 : .4 + rnd() * .5, ph: rnd() * PI2, b: onR ? .42 + (.16 - ridge) * 2.4 : .14 + rnd() * .14, sp: .6 + rnd() * 1.4 });
      }
      return a;
    })();
    /* gyri as line art: contour lines of the same field, computed once (marching squares), kept inside the outline */
    function field(x, y) { return (vn(x * 6.5 + 7, y * 6.5) * .6 + vn(x * 13, y * 13 + 3) * .4) * 11; }
    var FOLDS = (function () {
      var out = [], G = 170, gy = Math.round(G * .76), h = 1 / G, F = [], i, j;
      for (j = 0; j <= gy; j++) { F.push([]); for (i = 0; i <= G; i++) F[j].push(field(i * h, j * h)); }
      function lerp(a, b, v) { return (v - a) / (b - a); }
      for (j = 0; j < gy; j++) for (i = 0; i < G; i++) {
        var a = F[j][i], b = F[j][i + 1], c = F[j + 1][i + 1], d = F[j + 1][i];
        var lo = Math.min(a, b, c, d), hi = Math.max(a, b, c, d);
        for (var L = Math.ceil(lo - .5) + .5; L < hi; L += 1) {
          var pts = [], x0 = i * h, y0 = j * h;
          if ((a < L) !== (b < L)) pts.push([x0 + lerp(a, b, L) * h, y0]);
          if ((b < L) !== (c < L)) pts.push([x0 + h, y0 + lerp(b, c, L) * h]);
          if ((d < L) !== (c < L)) pts.push([x0 + lerp(d, c, L) * h, y0 + h]);
          if ((a < L) !== (d < L)) pts.push([x0, y0 + lerp(a, d, L) * h]);
          if (pts.length >= 2) {
            var mx = (pts[0][0] + pts[1][0]) / 2, my = (pts[0][1] + pts[1][1]) / 2;
            if (inPoly(mx, my, CEREB)) out.push(pts[0][0], pts[0][1], pts[1][0], pts[1][1]);
            if (pts.length === 4) { mx = (pts[2][0] + pts[3][0]) / 2; my = (pts[2][1] + pts[3][1]) / 2; if (inPoly(mx, my, CEREB)) out.push(pts[2][0], pts[2][1], pts[3][0], pts[3][1]); }
          }
        }
      }
      /* the cerebellum: fine curved folia */
      for (var f = 0; f < 9; f++) {
        var yy = CBL.y - CBL.ry * .85 + f * CBL.ry * 1.7 / 8, px = null, py = null;
        for (var s = 0; s <= 30; s++) {
          var xx = CBL.x - CBL.rx + s * CBL.rx * 2 / 30, yv = yy + Math.sin(s * .5 + f) * .004 + (xx - CBL.x) * .12;
          var inE = Math.pow((xx - CBL.x) / CBL.rx, 2) + Math.pow((yv - CBL.y) / CBL.ry, 2) < .92;
          if (inE && px !== null) out.push(px, py, xx, yv);
          px = inE ? xx : null; py = yv;
        }
      }
      return out;
    })();
    function a1At(t) { return [A1LO[0] + (A1HI[0] - A1LO[0]) * t, A1LO[1] + (A1HI[1] - A1LO[1]) * t]; }
    /* draw the brain into box (bx, by, bw); act(t) gives extra light to dots near the hearing cortex point;
       glow 0..1 makes the whole brain shimmer (the hum) */
    function drawBrain(ctx, bx, by, bw, k, now, act, glow, dense) {
      var X = function (u) { return bx + u * bw; }, Y = function (v) { return by + v * bw; };
      ctx.save();
      /* soft golden halo */
      var g = ctx.createRadialGradient(X(.5), Y(.36), bw * .05, X(.5), Y(.4), bw * .62);
      g.addColorStop(0, rgba(HOT, .16 + glow * .14)); g.addColorStop(1, rgba(HOT, 0));
      ctx.fillStyle = g; ctx.fillRect(bx - bw * .15, by - bw * .15, bw * 1.3, bw * 1.25);
      /* outline */
      ctx.beginPath(); spline(ctx, CEREB.map(function (p) { return [X(p[0]), Y(p[1])]; }), true);
      ctx.fillStyle = rgba("255,253,246", .55); ctx.fill();
      ctx.lineWidth = 1.2 * k; ctx.strokeStyle = rgba(GOLD, .55); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(X(CBL.x), Y(CBL.y), CBL.rx * bw, CBL.ry * bw, -.12, 0, PI2);
      ctx.fillStyle = rgba("255,253,246", .5); ctx.fill(); ctx.strokeStyle = rgba(GOLD, .4); ctx.stroke();
      ctx.beginPath(); spline(ctx, STEM.map(function (p) { return [X(p[0]), Y(p[1])]; }), true);
      ctx.fillStyle = rgba("255,253,246", .5); ctx.fill(); ctx.strokeStyle = rgba(GOLD, .4); ctx.stroke();
      /* sulci */
      ctx.lineWidth = 1 * k; ctx.strokeStyle = rgba(GOLD, .16); ctx.lineCap = "round";
      for (var s = 0; s < SULCI.length; s++) { ctx.beginPath(); spline(ctx, SULCI[s].map(function (p) { return [X(p[0]), Y(p[1])]; }), false); ctx.stroke(); }
      /* folds */
      ctx.lineWidth = .9 * k; ctx.strokeStyle = rgba(GOLD, .30 + glow * .25); ctx.beginPath();
      for (var fi = 0; fi < FOLDS.length; fi += 4) { ctx.moveTo(X(FOLDS[fi]), Y(FOLDS[fi + 1])); ctx.lineTo(X(FOLDS[fi + 2]), Y(FOLDS[fi + 3])); }
      ctx.stroke();
      /* the hearing cortex band */
      ctx.lineWidth = 5 * k; ctx.strokeStyle = rgba(GOLD, .16);
      ctx.beginPath(); ctx.moveTo(X(A1LO[0]), Y(A1LO[1])); ctx.lineTo(X(A1HI[0]), Y(A1HI[1])); ctx.stroke();
      /* the dots */
      var step = dense ? 1 : 2, tt = now / 1000;
      for (var i = 0; i < DOTS.length; i += step) {
        var d = DOTS[i], a = d.b * (RM ? 1 : (.75 + .25 * Math.sin(tt * d.sp + d.ph)));
        if (glow > 0) a += glow * .35 * (.5 + .5 * Math.sin(tt * 9 + d.ph * 3));
        var extra = act ? act(d) : 0, r = d.r * k * (1 + extra * 1.4);
        ctx.fillStyle = extra > .05 ? rgba(HOT, Math.min(1, a + extra)) : rgba(GOLD, a * .75);
        ctx.beginPath(); ctx.arc(X(d.x), Y(d.y), r, 0, PI2); ctx.fill();
        if (extra > .35) { ctx.fillStyle = rgba(HOT, extra * .22); ctx.beginPath(); ctx.arc(X(d.x), Y(d.y), r * 3.2, 0, PI2); ctx.fill(); }
      }
      ctx.restore();
    }

    function fit(cv, wide, narrow) {   /* wide/narrow: [design width, design height]; returns the layout in use */
      var w = cv.clientWidth || cv.parentNode.clientWidth || 600, lay = w < 560 ? narrow : wide;
      var dpr = Math.min(2, window.devicePixelRatio || 1), h = Math.round(w * lay[1] / lay[0]);
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      cv.style.height = h + "px";
      return { k: w / lay[0] * dpr, narrow: lay === narrow, W: lay[0], H: lay[1] };
    }
    function visible(el, cb) {
      if (!window.IntersectionObserver) { cb(true); return; }
      new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }, { rootMargin: "120px" }).observe(el);
    }

    /* =====================================================================================
       134 · hearing sweep
       ===================================================================================== */
    (function () {
      var card = document.getElementById("hrSweep"); if (!card) return;
      var cv = card.querySelector(".hr-cv"), ctx = cv.getContext("2d");
      var go = card.querySelector(".hr-go"), golb = go.querySelector(".hr-lb"), stopB = card.querySelector(".hr-stop");
      var read = card.querySelector(".hr-read"), res = card.querySelector(".hr-res"), more = card.querySelector(".hr-more");
      var F0 = 250, F1 = 20000, T = 26, LN = Math.log(F1 / F0);
      var st = null, freq = 0, result = 0, seen = false, raf = 0, lastDraw = 0, parts = [], lastSpawn = 0, sweepStart = 0;

      function greenwood(f) { return Math.log(f / 165.4 + .88) / Math.LN10 / 2.1; }   /* 0 = tip (apex), 1 = entrance (base) */
      function fmt(f) { return f >= 1000 ? (f >= 10000 ? (f / 1000).toFixed(1) : (f / 1000).toFixed(2)) + " kHz" : Math.round(f) + " Hz"; }
      function tOf(f) { return Math.log(f / F0) / LN; }

      function start() {
        stop(true);
        var c = audio(); say("hear134");
        res.hidden = true; more.hidden = true; result = 0;
        st = { t0: performance.now() / 1000, c: c, osc: null, g: null, a0: 0 };
        if (c) {
          var t0 = c.currentTime + .06, o = c.createOscillator(), g = c.createGain();
          o.type = "sine"; o.frequency.setValueAtTime(F0, t0); o.frequency.exponentialRampToValueAtTime(F1, t0 + T);
          /* quieter where the ear is most sensitive (2 to 5 kHz), a little louder at both ends; always soft */
          var P = [[250, .10], [1000, .055], [3000, .03], [6000, .042], [10000, .065], [14000, .095], [20000, .12]];
          g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(P[0][1], t0 + .35);
          for (var i = 1; i < P.length; i++) g.gain.linearRampToValueAtTime(P[i][1], t0 + T * Math.log(P[i][0] / F0) / LN);
          g.gain.linearRampToValueAtTime(0, t0 + T + .25);
          o.connect(g); g.connect(window.SSAudio ? window.SSAudio.out(c) : c.destination); o.start(t0); o.stop(t0 + T + .35);
          st.osc = o; st.g = g; st.a0 = t0;
        }
        sweepStart = performance.now();
        go.hidden = true;
        stopB.hidden = false; try { stopB.focus({ preventScroll: true }); } catch (e) {}
        loop();
      }
      function elapsed() {
        if (!st) return 0;
        if (st.c && st.osc) return Math.max(0, st.c.currentTime - st.a0);
        return performance.now() / 1000 - st.t0;
      }
      function stop(silent) {
        if (!st) return;
        if (st.c && st.g) { try { var n = st.c.currentTime; if (st.g.gain.cancelAndHoldAtTime) st.g.gain.cancelAndHoldAtTime(n); else st.g.gain.cancelScheduledValues(n); st.g.gain.setTargetAtTime(0, n, .03); st.osc.stop(n + .2); } catch (e) {} }
        st = null; parts = [];
        go.hidden = false; golb.textContent = result ? "Try again" : "Start the sweep"; stopB.hidden = true;
        if (!silent) draw(performance.now());
      }
      function finish(f, top) {
        result = f; stop(true);
        res.textContent = top ? "You heard it up to " + fmt(f) + ", the end of the sweep." : "Your tone faded at " + fmt(f) + ".";
        res.hidden = false; more.hidden = false; golb.textContent = "Try again"; read.textContent = fmt(f);
        try { go.focus({ preventScroll: true }); } catch (e) {}
        draw(performance.now());
      }
      go.addEventListener("click", function () { if (st) stop(); else start(); });
      stopB.addEventListener("click", function () { if (st) finish(Math.max(F0, freq), false); });
      document.addEventListener("ss:audio", function (e) { if (e.detail !== "hear134" && st) stop(); });
      document.addEventListener("visibilitychange", function () { if (document.hidden && st) stop(); });
      new MutationObserver(function () { if (st && root.getAttribute("data-side") === "night") stop(); }).observe(root, { attributes: true, attributeFilter: ["data-side"] });

      /* ---- drawing ---- */
      function spiralPt(cx, cy, R, x) {   /* point on the cochlea at place x (0 tip, 1 entrance) */
        var TH = 2.6 * PI2, th = (1 - x) * TH, kk = Math.log(3.4) / TH, r = R * Math.exp(-kk * th), a = .55 - th;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a), r];
      }
      function draw(now) {
        var L = fit(cv, [1000, 480], [600, 760]), k = L.k, W = L.W, H = L.H;
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.setTransform(k, 0, 0, k, 0, 0);
        var lay = L.narrow ? { cx: 165, cy: 175, R: 145, bx: 140, by: 300, bw: 440, ay: 712, ax0: 40, ax1: 540 }
                           : { cx: 195, cy: 210, R: 152, bx: 425, by: 16, bw: 475, ay: 452, ax0: 60, ax1: 920 };
        var tt = now / 1000, on = !!st, f = on ? freq : (result || 0), xc = f ? greenwood(f) : -1;
        var dts = Math.min(.1, Math.max(0, (now - (draw.prev || now)) / 1000)); draw.prev = now;
        var amp = on ? 1 : .12;

        /* --- cochlea --- */
        var N = 240, i, p, q;
        ctx.lineCap = "round";
        /* the tube: two walls, a light fill and the rows of hair cells across it */
        var outer = [], inner = [], rungs = [];
        for (i = 0; i <= N; i++) {
          var xw = i / N; p = spiralPt(lay.cx, lay.cy, lay.R, xw); q = spiralPt(lay.cx, lay.cy, lay.R, Math.max(0, Math.min(1, xw + (i === N ? -1 : 1) / N)));
          var tx0 = (q[0] - p[0]) * (i === N ? -1 : 1), ty0 = (q[1] - p[1]) * (i === N ? -1 : 1), tl = Math.sqrt(tx0 * tx0 + ty0 * ty0) || 1, nx0 = -ty0 / tl, ny0 = tx0 / tl, w0 = p[2] * .12 + 1.5;
          outer.push([p[0] + nx0 * w0, p[1] + ny0 * w0]); inner.push([p[0] - nx0 * w0, p[1] - ny0 * w0]);
          if (i % 4 === 0) rungs.push([p[0] + nx0 * w0 * .8, p[1] + ny0 * w0 * .8, p[0] - nx0 * w0 * .8, p[1] - ny0 * w0 * .8, xw]);
        }
        ctx.beginPath(); ctx.moveTo(outer[0][0], outer[0][1]);
        for (i = 1; i < outer.length; i++) ctx.lineTo(outer[i][0], outer[i][1]);
        for (i = inner.length - 1; i >= 0; i--) ctx.lineTo(inner[i][0], inner[i][1]);
        ctx.closePath(); ctx.fillStyle = rgba(HOT, .13); ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = rgba(GOLD, .38);
        ctx.beginPath(); ctx.moveTo(outer[0][0], outer[0][1]); for (i = 1; i < outer.length; i++) ctx.lineTo(outer[i][0], outer[i][1]); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(inner[0][0], inner[0][1]); for (i = 1; i < inner.length; i++) ctx.lineTo(inner[i][0], inner[i][1]); ctx.stroke();
        for (i = 0; i < rungs.length; i++) {
          var rg = rungs[i], near = xc < 0 ? 0 : Math.exp(-Math.pow((rg[4] - xc) / .03, 2));
          ctx.strokeStyle = near > .1 ? rgba(HOT, .4 + near * .6) : rgba(GOLD, .14); ctx.lineWidth = near > .1 ? 1.6 : 1;
          ctx.beginPath(); ctx.moveTo(rg[0], rg[1]); ctx.lineTo(rg[2], rg[3]); ctx.stroke();
        }
        /* the basilar membrane with its travelling wave */
        ctx.beginPath();
        for (i = 0; i <= N; i++) {
          var x = i / N; p = spiralPt(lay.cx, lay.cy, lay.R, x); q = spiralPt(lay.cx, lay.cy, lay.R, Math.min(1, x + 1 / N));
          if (x >= 1) q = [p[0] + (p[0] - spiralPt(lay.cx, lay.cy, lay.R, x - 1 / N)[0]), p[1] + (p[1] - spiralPt(lay.cx, lay.cy, lay.R, x - 1 / N)[1])];
          var dx = q[0] - p[0], dy = q[1] - p[1], dl = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / dl, ny = dx / dl;
          var env;
          if (xc < 0) env = .25;
          else env = x >= xc ? Math.exp(-(x - xc) / .22) : Math.exp(-Math.pow((xc - x) / .035, 2));
          var ph = xc < 0 ? x * 30 : (1 - x) / (1 - xc + .03) * Math.PI * 4;
          var d = amp * env * p[2] * .16 * Math.sin(ph - (RM ? 0 : tt * 9));
          var X = p[0] + nx * d, Y = p[1] + ny * d;
          if (i === 0) ctx.moveTo(X, Y); else ctx.lineTo(X, Y);
        }
        ctx.lineWidth = 1.6; ctx.strokeStyle = rgba(GOLD, .9); ctx.stroke();
        /* place marks along the spiral (numbers only) */
        ctx.font = "500 " + (L.narrow ? 13 : 11) + "px 'IBM Plex Mono', ui-monospace, monospace";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        var MK = [[250, "250"], [1000, "1k"], [4000, "4k"], [16000, "16k"]];
        for (i = 0; i < MK.length; i++) {
          var xm = greenwood(MK[i][0]); p = spiralPt(lay.cx, lay.cy, lay.R, xm);
          var vx = p[0] - lay.cx, vy = p[1] - lay.cy, vl = Math.sqrt(vx * vx + vy * vy) || 1, off = p[2] * .3 + 12;
          ctx.fillStyle = rgba(GOLD, .55); ctx.beginPath(); ctx.arc(p[0], p[1], 2, 0, PI2); ctx.fill();
          ctx.fillStyle = rgba(INK, .5); ctx.fillText(MK[i][1], p[0] + vx / vl * off, p[1] + vy / vl * off);
        }
        /* the entrance (oval window) */
        p = spiralPt(lay.cx, lay.cy, lay.R, 1);
        ctx.strokeStyle = rgba(GOLD, .7); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, PI2); ctx.stroke();
        /* the peak */
        if (xc >= 0) {
          p = spiralPt(lay.cx, lay.cy, lay.R, xc);
          var pk = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 26);
          pk.addColorStop(0, rgba(HOT, on ? .95 : .7)); pk.addColorStop(1, rgba(HOT, 0));
          ctx.fillStyle = pk; ctx.beginPath(); ctx.arc(p[0], p[1], 26, 0, PI2); ctx.fill();
          ctx.fillStyle = rgba(GOLD, 1); ctx.beginPath(); ctx.arc(p[0], p[1], 3.2, 0, PI2); ctx.fill();
        }

        /* --- the brain --- */
        var tf = f ? Math.max(0, Math.min(1, tOf(f))) : -1, A = tf >= 0 ? a1At(tf) : null;
        drawBrain(ctx, lay.bx, lay.by, lay.bw, 1, now, A ? function (d) {
          if (d.z) return 0;
          var ddx = d.x - A[0], ddy = d.y - A[1], r2 = ddx * ddx + ddy * ddy;
          return (on ? 1 : .6) * Math.exp(-r2 / .0016) + (on ? .25 : 0) * Math.exp(-r2 / .03);
        } : null, 0, !L.narrow);
        /* the hearing-cortex point */
        if (A) {
          var ax = lay.bx + A[0] * lay.bw, ay = lay.by + A[1] * lay.bw;
          ctx.strokeStyle = rgba(GOLD, .9); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(ax, ay, 9 + (on && !RM ? 2 * Math.sin(tt * 8) : 0), 0, PI2); ctx.stroke();
        }

        /* --- the hearing nerve: cochlea → brainstem → thalamus → cortex --- */
        var B = function (u, v) { return [lay.bx + u * lay.bw, lay.by + v * lay.bw]; };
        var path = [[lay.cx, lay.cy], [lay.cx + lay.R * .55, lay.cy + lay.R * .62], B(.50, .90), B(.585, .86), B(.595, .70), B(.56, .54), A ? B(A[0], A[1]) : B(.49, .45)];
        ctx.save(); ctx.setLineDash([2, 5]); ctx.lineWidth = 1.3; ctx.strokeStyle = rgba(GOLD, .45);
        ctx.beginPath(); spline(ctx, path, false); ctx.stroke(); ctx.restore();
        if (on && !RM && now - lastSpawn > 70) { parts.push({ s: 0 }); lastSpawn = now; }
        var seg = [], tot = 0;
        for (i = 1; i < path.length; i++) { var l = Math.sqrt(Math.pow(path[i][0] - path[i - 1][0], 2) + Math.pow(path[i][1] - path[i - 1][1], 2)); seg.push(l); tot += l; }
        for (i = parts.length - 1; i >= 0; i--) {
          var pt = parts[i]; pt.s += (RM ? 0 : dts * .72);
          if (pt.s >= 1) { parts.splice(i, 1); continue; }
          var dd = pt.s * tot, j = 0; while (j < seg.length - 1 && dd > seg[j]) { dd -= seg[j]; j++; }
          var u = Math.min(1, dd / seg[j]), px = path[j][0] + (path[j + 1][0] - path[j][0]) * u, py = path[j][1] + (path[j + 1][1] - path[j][1]) * u;
          ctx.fillStyle = rgba(HOT, .95); ctx.beginPath(); ctx.arc(px, py, 2.6, 0, PI2); ctx.fill();
          ctx.fillStyle = rgba(HOT, .25); ctx.beginPath(); ctx.arc(px, py, 6, 0, PI2); ctx.fill();
        }

        /* --- the frequency axis (log), numbers only --- */
        var ax0 = lay.ax0, ax1 = lay.ax1, y = lay.ay, AX = function (fq) { return ax0 + (ax1 - ax0) * tOf(fq); };
        ctx.strokeStyle = rgba(INK, .18); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ax0, y); ctx.lineTo(ax1, y); ctx.stroke();
        if (f) { ctx.strokeStyle = rgba(GOLD, .95); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax0, y); ctx.lineTo(AX(Math.min(f, F1)), y); ctx.stroke(); }
        ctx.font = "500 " + (L.narrow ? 13 : 10.5) + "px 'IBM Plex Mono', ui-monospace, monospace"; ctx.textBaseline = "top";
        var TK = [[250, "250"], [500, "500"], [1000, "1k"], [2000, "2k"], [4000, "4k"], [8000, "8k"], [16000, "16k"], [20000, "20k"]];
        for (i = 0; i < TK.length; i++) {
          if (L.narrow && (TK[i][0] === 500 || TK[i][0] === 2000)) continue;
          var tx = AX(TK[i][0]); ctx.fillStyle = rgba(INK, .35); ctx.fillRect(tx - .5, y - 4, 1, 8);
          ctx.textAlign = "center"; ctx.fillStyle = rgba(INK, .5); ctx.fillText(TK[i][1], tx + (i === TK.length - 1 ? 6 : i === TK.length - 2 ? -5 : 0), y + 8);
        }
        ctx.textAlign = "left"; ctx.fillStyle = rgba(INK, .5); ctx.fillText("Hz", ax1 + 24, y + 8);
        if (f) {
          var mx = AX(Math.min(f, F1));
          ctx.fillStyle = on ? rgba(GOLD, 1) : rgba(INK, .9);
          ctx.beginPath(); ctx.moveTo(mx, y - 6); ctx.lineTo(mx - 6, y - 15); ctx.lineTo(mx + 6, y - 15); ctx.closePath(); ctx.fill();
        }
      }
      function loop() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function tick(now) {
          if (st) {
            var e = elapsed(); freq = F0 * Math.exp(LN * Math.min(1, e / T));
            read.textContent = fmt(freq);
            if (e >= T + .1) { finish(F1, true); return; }
          }
          var gap = st ? 0 : (RM ? 400 : 33);
          if (now - lastDraw >= gap) { draw(now); lastDraw = now; }
          if (st || (seen && !RM)) raf = requestAnimationFrame(tick); else raf = 0;
        });
      }
      visible(cv, function (v) { seen = v; if (v && !raf) loop(); });
      window.addEventListener("resize", function () { draw(performance.now()); });
      draw(performance.now());
    })();

    /* =====================================================================================
       136 · one minute of humming
       ===================================================================================== */
    (function () {
      var card = document.getElementById("hrHum"); if (!card) return;
      var cv = card.querySelector(".hm-cv"), ctx = cv.getContext("2d");
      var go = card.querySelector(".hm-go"), golb = go.querySelector(".hr-lb"), tone = card.querySelector(".hm-tone");
      var ph = card.querySelector(".hm-ph"), rd = card.querySelector(".hm-rd"), bar = card.querySelector(".hm-bar i");
      var IN = 4, HUM = 6, ROUNDS = 6, CYC = IN + HUM;
      var st = null, seen = false, raf = 0, lastDraw = 0, no = 1, humLvl = 0, parts = [], lastSpawn = 0, lastPhase = "", lastRound = 0;
      var toneOn = true;

      /* the head, facing left, in a unit box (1 wide, about 1.02 high) */
      var HEAD = [[.55, .0], [.75, .03], [.90, .14], [.98, .32], [.97, .50], [.90, .63], [.80, .74], [.765, .88], [.76, 1.25], [.38, 1.25], [.385, .97], [.36, .875], [.25, .86], [.17, .835], [.13, .80], [.10, .71], [.115, .68], [.10, .65], [.115, .605], [.08, .60], [.04, .56], [.12, .45], [.135, .41], [.11, .37], [.12, .28], [.16, .17], [.24, .08], [.38, .02]];
      var SIN_F = { x: .175, y: .325, rx: .034, ry: .04 }, SIN_M = { x: .23, y: .535, rx: .062, ry: .046 };
      var NOSE = [[.06, .59], [.13, .565], [.22, .555], [.33, .55], [.42, .585], [.445, .68], [.44, .80]];
      var LARYNX = [.44, .80], NOSTRIL = [.07, .595];
      var BR = { x: .19, y: .055, w: .765 };

      function setTone(v) { toneOn = v; tone.setAttribute("aria-checked", v ? "true" : "false"); if (st) humTone(st.phase === "hum"); }
      tone.addEventListener("click", function () { setTone(!toneOn); });

      function humTone(on) {
        var c = st && st.c; if (!c) return;
        var n = c.currentTime, want = on && toneOn ? .085 : 0;
        if (!st.nodes && want > 0) {
          var m = c.createGain(), lp = c.createBiquadFilter(); m.gain.value = 0; lp.type = "lowpass"; lp.frequency.value = 1100;
          var os = [], H = [[130.81, 1, "sine"], [261.63, .32, "sine"], [392.0, .1, "triangle"]];
          for (var i = 0; i < H.length; i++) { var o = c.createOscillator(), g = c.createGain(); o.type = H[i][2]; o.frequency.value = H[i][0]; g.gain.value = H[i][1]; o.connect(g); g.connect(lp); o.start(); os.push(o); }
          var lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 4.6; lg.gain.value = 1.4; lfo.connect(lg); lg.connect(os[0].frequency); lfo.start(); os.push(lfo);
          lp.connect(m); m.connect(window.SSAudio ? window.SSAudio.out(c) : c.destination); st.nodes = { m: m, os: os };
        }
        if (st.nodes) { st.nodes.m.gain.cancelScheduledValues(n); st.nodes.m.gain.setTargetAtTime(want, n, want ? .35 : .25); }
      }
      function start() {
        stop(true);
        var c = audio(); say("hum136");
        st = { t0: performance.now(), c: c, nodes: null, phase: "" };
        lastPhase = ""; lastRound = 0; parts = [];
        go.setAttribute("aria-pressed", "true"); golb.textContent = "Stop";
        loop();
      }
      function stop(silent, done) {
        if (!st) return;
        if (st.nodes) {
          var n = st.c.currentTime, nd = st.nodes; nd.m.gain.cancelScheduledValues(n); nd.m.gain.setTargetAtTime(0, n, .15);
          setTimeout(function () { for (var i = 0; i < nd.os.length; i++) { try { nd.os[i].stop(); } catch (e) {} } }, 900);
        }
        st = null; humLvl = 0;
        go.setAttribute("aria-pressed", "false"); golb.textContent = "Start one minute";
        if (done) { ph.textContent = "Done. Notice your breath for a moment."; rd.textContent = ""; }
        else if (!silent) { ph.textContent = "Six rounds · one minute"; rd.textContent = ""; }
        if (!silent) draw(performance.now());
      }
      go.addEventListener("click", function () { if (st) stop(); else start(); });
      document.addEventListener("ss:audio", function (e) { if (e.detail !== "hum136" && st) stop(); });
      document.addEventListener("visibilitychange", function () { if (document.hidden && st) stop(); });
      new MutationObserver(function () { if (st && root.getAttribute("data-side") === "night") stop(); }).observe(root, { attributes: true, attributeFilter: ["data-side"] });

      function state(now) {   /* phase, time in phase, round */
        if (!st) return { phase: "", t: 0, round: 0 };
        var e = (now - st.t0) / 1000;
        if (e >= ROUNDS * CYC) return { phase: "end", t: 0, round: ROUNDS };
        var r = Math.floor(e / CYC), w = e - r * CYC;
        return w < IN ? { phase: "in", t: w, round: r + 1 } : { phase: "hum", t: w - IN, round: r + 1 };
      }

      function drawHead(L, now, s) {
        var k = L.k, W = L.W, H = L.H, tt = now / 1000, f6 = Math.min(6, Math.max(0, (now - (drawHead.prev || now)) / 16.7)); drawHead.prev = now;
        var lay = L.narrow ? { hx: 50, hy: 165, hs: 520, ring: [530, 70, 40] } : { hx: 250, hy: 18, hs: 520, ring: [880, 215, 54] };
        var X = function (u) { return lay.hx + u * lay.hs; }, Y = function (v) { return lay.hy + v * lay.hs; };
        var P = HEAD.map(function (p) { return [X(p[0]), Y(p[1])]; });
        ctx.save();
        /* head */
        ctx.beginPath(); spline(ctx, P, true);
        var hg = ctx.createLinearGradient(0, Y(0), 0, Y(1));
        hg.addColorStop(0, "rgba(255,254,249,.95)"); hg.addColorStop(1, "rgba(246,241,226,.95)");
        ctx.fillStyle = hg; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = rgba(GOLD, .6); ctx.stroke();
        ctx.save(); ctx.beginPath(); spline(ctx, P, true); ctx.clip();
        /* resonance rings while humming */
        if (humLvl > .02 && !RM) {
          var src = [[X(LARYNX[0]), Y(LARYNX[1])], [X(.30), Y(.555)]];
          for (var si = 0; si < src.length; si++) {
            for (var ri = 0; ri < 5; ri++) {
              var ph2 = ((tt * .9 + ri / 5) % 1), rr = ph2 * lay.hs * .62;
              ctx.strokeStyle = rgba(GOLD, humLvl * (1 - ph2) * (si ? .32 : .22)); ctx.lineWidth = 1.4;
              ctx.beginPath(); ctx.arc(src[si][0], src[si][1], rr, 0, PI2); ctx.stroke();
            }
          }
        }
        ctx.restore();
        /* brain inside */
        drawBrain(ctx, X(BR.x), Y(BR.y), BR.w * lay.hs, 1, now, null, humLvl * .9, !L.narrow);
        /* ear and eye */
        ctx.strokeStyle = rgba(GOLD, .55); ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.ellipse(X(.64), Y(.47), .035 * lay.hs, .07 * lay.hs, .15, -1.2, 4.3); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(X(.145), Y(.42)); ctx.quadraticCurveTo(X(.175), Y(.40), X(.205), Y(.42)); ctx.quadraticCurveTo(X(.175), Y(.435), X(.145), Y(.42)); ctx.stroke();
        /* nasal airway */
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.beginPath(); spline(ctx, NOSE.map(function (p) { return [X(p[0]), Y(p[1])]; }), false);
        ctx.lineWidth = .034 * lay.hs; ctx.strokeStyle = rgba(GOLD, .12); ctx.stroke();
        ctx.lineWidth = 1; ctx.strokeStyle = rgba(GOLD, .35); ctx.stroke();
        /* sinuses */
        var sins = [SIN_F, SIN_M];
        for (var q = 0; q < 2; q++) {
          var S = sins[q], sg = ctx.createRadialGradient(X(S.x), Y(S.y), 0, X(S.x), Y(S.y), S.rx * lay.hs * 1.6);
          sg.addColorStop(0, rgba(HOT, .25 + humLvl * .6)); sg.addColorStop(1, rgba(HOT, 0));
          ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(X(S.x), Y(S.y), S.rx * lay.hs * 1.6, 0, PI2); ctx.fill();
          ctx.beginPath(); ctx.ellipse(X(S.x), Y(S.y), S.rx * lay.hs, S.ry * lay.hs, 0, 0, PI2);
          ctx.strokeStyle = rgba(GOLD, .55); ctx.lineWidth = 1.2; ctx.stroke();
        }
        /* particles: air in, nitric oxide out */
        if (!RM && s.phase === "hum" && now - lastSpawn > 55) {
          for (var z = 0; z < 2; z++) { var S2 = sins[z], a = Math.random() * PI2; parts.push({ k: "no", x: S2.x + Math.cos(a) * S2.rx * .6, y: S2.y + Math.sin(a) * S2.ry * .6, tx: .22 + Math.random() * .06, ty: .555, st: 0, life: 0 }); }
          lastSpawn = now;
        }
        if (!RM && s.phase === "in" && now - lastSpawn > 70) { parts.push({ k: "air", u: 0 }); lastSpawn = now; }
        for (var pi = parts.length - 1; pi >= 0; pi--) {
          var pt = parts[pi], px, py;
          if (pt.k === "no") {
            pt.life += f6;
            if (pt.st === 0) { pt.x += (pt.tx - pt.x) * Math.min(1, .06 * f6); pt.y += (pt.ty - pt.y) * Math.min(1, .06 * f6); if (Math.abs(pt.tx - pt.x) < .01 && Math.abs(pt.ty - pt.y) < .01) pt.st = 1; }
            else { pt.x -= .006 * f6; pt.y += (NOSTRIL[1] - pt.y) * Math.min(1, .05 * f6) + (Math.random() - .5) * .002; }
            if (pt.x < -.08 || pt.life > 260) { parts.splice(pi, 1); continue; }
            px = X(pt.x); py = Y(pt.y);
            ctx.fillStyle = rgba(HOT, .95); ctx.beginPath(); ctx.arc(px, py, 2.4, 0, PI2); ctx.fill();
            ctx.fillStyle = rgba(GOLD, .5); ctx.beginPath(); ctx.arc(px, py, 1, 0, PI2); ctx.fill();
          } else {
            pt.u += .012 * f6; if (pt.u >= 1) { parts.splice(pi, 1); continue; }
            var u = pt.u, pp;
            if (u < .18) { var w = u / .18; pp = [NOSTRIL[0] - .12 * (1 - w), NOSTRIL[1] + .01 * (1 - w)]; }
            else { var w2 = (u - .18) / .82, idx = w2 * (NOSE.length - 1), i0 = Math.floor(idx), i1 = Math.min(NOSE.length - 1, i0 + 1), f2 = idx - i0; pp = [NOSE[i0][0] + (NOSE[i1][0] - NOSE[i0][0]) * f2, NOSE[i0][1] + (NOSE[i1][1] - NOSE[i0][1]) * f2]; }
            ctx.strokeStyle = rgba(INK, .35 * (1 - u)); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(X(pp[0]), Y(pp[1]), 2.4, 0, PI2); ctx.stroke();
          }
        }
        if (!st && parts.length) parts = [];
        /* the larynx: the source of the hum */
        ctx.fillStyle = rgba(GOLD, .4 + humLvl * .6); ctx.beginPath(); ctx.arc(X(LARYNX[0]), Y(LARYNX[1]), 4 + humLvl * (RM ? 0 : 2 * Math.sin(tt * 30)), 0, PI2); ctx.fill();
        /* breathing ring: grows while breathing in, closes while humming */
        var R0 = lay.ring, prog = 0;
        if (s.phase === "in") prog = s.t / IN; else if (s.phase === "hum") prog = s.t / HUM;
        ctx.lineWidth = 3; ctx.strokeStyle = rgba(INK, .08); ctx.beginPath(); ctx.arc(R0[0], R0[1], R0[2], 0, PI2); ctx.stroke();
        if (s.phase) {
          var rad = s.phase === "in" ? R0[2] * (.45 + .55 * prog) : R0[2] * (1 - .55 * prog);
          ctx.fillStyle = rgba(s.phase === "in" ? INK : HOT, s.phase === "in" ? .07 : .35); ctx.beginPath(); ctx.arc(R0[0], R0[1], rad, 0, PI2); ctx.fill();
          ctx.strokeStyle = rgba(GOLD, .95); ctx.beginPath(); ctx.arc(R0[0], R0[1], R0[2], -Math.PI / 2, -Math.PI / 2 + PI2 * prog); ctx.stroke();
          /* the six rounds as small dots */
          for (var d6 = 0; d6 < ROUNDS; d6++) {
            var aa = -Math.PI / 2 + d6 / ROUNDS * PI2, dx6 = R0[0] + Math.cos(aa) * (R0[2] + 12), dy6 = R0[1] + Math.sin(aa) * (R0[2] + 12);
            ctx.fillStyle = d6 < s.round - 1 ? rgba(GOLD, .95) : d6 === s.round - 1 ? rgba(HOT, 1) : rgba(INK, .15);
            ctx.beginPath(); ctx.arc(dx6, dy6, 3, 0, PI2); ctx.fill();
          }
        }
        ctx.restore();
      }
      function draw(now) {
        var L = fit(cv, [1000, 560], [600, 700]);
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height); ctx.setTransform(L.k, 0, 0, L.k, 0, 0);
        drawHead(L, now, state(now));
      }
      function loop() {
        cancelAnimationFrame(raf);
        var prev = performance.now();
        raf = requestAnimationFrame(function tick(now) {
          var dt = Math.min(.1, (now - prev) / 1000); prev = now;
          var s = state(now);
          if (st) {
            if (s.phase === "end") { stop(false, true); }
            else {
              if (s.phase !== lastPhase) {
                lastPhase = s.phase; st.phase = s.phase;
                ph.textContent = s.phase === "in" ? "Breathe in through your nose" : "Hum, lips closed";
                humTone(s.phase === "hum");
              }
              if (s.round !== lastRound) { lastRound = s.round; rd.textContent = "Round " + s.round + " of 6"; }
            }
          }
          /* nitric oxide in the nose: a quick peak at about fifteen-fold, then a slow fall while the hum goes on */
          var target = 1;
          if (st && s.phase === "hum") target = 1 + 14 * (1 - Math.exp(-s.t / .45)) * Math.exp(-Math.max(0, s.t - 1) / 4);
          no += (target - no) * Math.min(1, dt * (target > no ? 6 : 2.5));
          bar.style.width = (no / 15 * 100).toFixed(1) + "%";
          var hw = st && s.phase === "hum" ? 1 : 0; humLvl += (hw - humLvl) * Math.min(1, dt * 4);
          var gap = st ? (RM ? 120 : 0) : (RM ? 400 : 33);
          if (now - lastDraw >= gap) { draw(now); lastDraw = now; }
          if (st || (seen && !RM) || humLvl > .01 || no > 1.05) raf = requestAnimationFrame(tick); else raf = 0;
        });
      }
      visible(cv, function (v) { seen = v; if (v && !raf) loop(); });
      window.addEventListener("resize", function () { draw(performance.now()); });
      draw(performance.now());
    })();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
