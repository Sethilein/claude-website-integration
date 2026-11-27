/* ===== ux148 · SSAudio: one way out for the sound of the labs =====
   Item 148 (source/ux148). The frequency lab, the brain model, the biofeedback and the listening lab used to open
   one audio context each and to play straight into the speakers. Here they share one context and one master:

       sound of a module  ->  bus  ->  limiter  ->  trim  ->  fade  ->  speakers

   - limiter: a hard-knee compressor at -9 dB, 20:1. Single sounds stay below it and pass untouched; it only holds
     back sums (two modules at once, a kick on a drone). The browser's compressor adds make-up gain of its own;
     "trim" takes that out again, so nothing gets louder than it was built.
   - fade: when the tab is hidden the sound fades within a few hundredths of a second and the context is held.
     Coming back does not start it again: sound runs only after a new press on play (SSAudio.ctx() wakes it).
   - Nothing here makes a sound by itself, and no context exists before the first press.
   This block stands before item 123's wrapper on purpose: it keeps the browser's own constructor. */
(function () {
  "use strict";
  if (window.SSAudio) return;
  var Native = window.AudioContext || window.webkitAudioContext;
  var T = -9, R = 20, ac = null, bus = null, lim = null, trim = null, fade = null, timer = 0, stops = 0, lastStop = null;
  var PLAYING = '.fl-play[aria-pressed="true"],.brn-b[aria-pressed="true"],.bio-btn[data-act="play"][aria-pressed="true"],.hm-go[aria-pressed="true"],.hr-stop:not([hidden])';

  function make() {
    if (ac || !Native) return ac;
    try { ac = new Native(); } catch (e) { ac = null; return null; }
    bus = ac.createGain(); trim = ac.createGain(); fade = ac.createGain();
    try {
      lim = ac.createDynamicsCompressor();
      lim.threshold.value = T; lim.knee.value = 0; lim.ratio.value = R; lim.attack.value = 0.003; lim.release.value = 0.25;
      trim.gain.value = Math.pow(10, 0.6 * T * (1 - 1 / R) / 20);   /* the inverse of the compressor's built-in make-up gain */
      bus.connect(lim); lim.connect(trim);
    } catch (e) { lim = null; trim.gain.value = 1; bus.connect(trim); }
    fade.gain.value = 1; trim.connect(fade); fade.connect(ac.destination);
    return ac;
  }
  function wake() {
    if (!ac || document.hidden) return;
    if (timer) { clearTimeout(timer); timer = 0; }
    if (ac.state === "suspended") { try { ac.resume(); } catch (e) {} }
    try { fade.gain.setTargetAtTime(1, ac.currentTime, 0.02); } catch (e) {}
  }
  function sleep() {
    if (!ac) return;
    try { fade.gain.setTargetAtTime(0, ac.currentTime, 0.015); } catch (e) {}
    if (timer) clearTimeout(timer);
    timer = setTimeout(function () { timer = 0; if (document.hidden && ac.state === "running") { try { ac.suspend(); } catch (e) {} } }, 160);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      /* this listener is the first on the page, so the play buttons still show what was running */
      var on = null; try { on = document.querySelector(PLAYING); } catch (e) {}
      lastStop = on || null;
      if (on) stops++;
      sleep();
    } else if (lastStop) {
      var was = lastStop; lastStop = null;
      try { document.dispatchEvent(new CustomEvent("ss:audio-return", { detail: { control: was } })); } catch (e) {}
    }
  });

  window.SSAudio = {
    /* the shared context, made on the first call; a call means "about to play", so it also wakes the master */
    ctx: function () { var c = make(); if (c) wake(); return c; },
    /* where a module connects its last node; a context that is not the shared one keeps its own speakers */
    out: function (c) { return (c && c === ac && bus) ? bus : (c ? c.destination : null); },
    wake: wake,
    state: function () { return { made: !!ac, state: ac ? ac.state : "none", limiter: !!lim, threshold: T, ratio: R, trim: trim ? trim.gain.value : 1, fade: fade ? fade.gain.value : 1, reduction: lim ? lim.reduction : 0, hiddenStops: stops }; }
  };
})();
