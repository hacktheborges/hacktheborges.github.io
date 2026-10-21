/* ═══════════════════════════════════════════════════════════════
   Abertura cinemática — câmera (dolly/zoom nas portas) + V guia.
   Auto 1ª visita (localStorage) + botão. Trailer automático, pulável,
   acessível (Esc), respeita prefers-reduced-motion. Tudo 'self' (CSP ok).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduce = false;
  try { reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var SEEN_KEY = "htb_tour_seen_v2";

  function lang() {
    var b = document.querySelector('[data-lang][aria-pressed="true"]');
    if (b) { return b.getAttribute("data-lang") === "en" ? "en" : "pt"; }
    try { return localStorage.getItem("lang") === "en" ? "en" : "pt"; } catch (e) { return "pt"; }
  }
  function t(pt, en) { return lang() === "en" ? en : pt; }

  var BOOT = [
    ["pr", "$ ./open.sh --guia V", "$ ./open.sh --guide V"],
    ["ok", "[ok] câmera online", "[ok] camera online"],
    ["vl", "> V: vem comigo.",    "> V: follow me."]
  ];

  /* beats: sel = porta em foco (null = plano geral). */
  var BEATS = [
    { sel: null,                      pt: "Eu sou o V. Deixa eu te mostrar esse lugar.",
                                      en: "I'm V. Let me show you around." },
    { sel: 'a[href="#offsec"]',       pt: "OffSec — certificações, pins e labs. Onde a ofensiva vira método.",
                                      en: "OffSec — certs, pins and labs. Where offense becomes method." },
    { sel: 'a[href="#htb"]',          pt: "Hack The Box — máquinas, Academy e flags. Mão na massa.",
                                      en: "Hack The Box — machines, Academy and flags. Hands-on." },
    { sel: 'a[href="#certificacoes"]',pt: "Certificações — cada selo com a história de como foi conquistado.",
                                      en: "Certifications — each badge with the story behind it." },
    { sel: 'a[href="#sobre"]',        pt: "Sobre — quem eu sou e pra onde essa trilha me leva.",
                                      en: "About — who I am and where this path leads." },
    { sel: 'a[href="#play"]',         pt: "Do you wanna play? Um terminal de verdade te espera.",
                                      en: "Do you wanna play? A real terminal awaits." },
    { sel: null,                      pt: "Sua vez. Escolha uma porta.",
                                      en: "Your turn. Pick a door." }
  ];

  var FIG = "/assets/img/v/hub-peek.png";
  var BEAT_MS = 3000, INTRO_MS = 2600, OUTRO_MS = 2200;

  var host, cine, vig, barT, barB, vWrap, vImg, cap, capWho, capSay, prog, boot, bootBody;
  var built = false, playing = false, timers = [], base = null, doors = [], lastFocus = null;

  function mk(tag, cls, parent) { var e = document.createElement(tag); if (cls) e.className = cls; if (parent) parent.appendChild(e); return e; }
  function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function build() {
    if (built) return; built = true;
    host = document.querySelector("#hub .hub-inner");
    cine = mk("div", "tour-cine");
    vig = mk("div", "tour-vig", cine);
    barT = mk("div", "tour-bar top", cine);
    barB = mk("div", "tour-bar bottom", cine);

    vWrap = mk("div", "tour-v", cine);
    vImg = mk("img", null, vWrap); vImg.src = FIG; vImg.alt = "V"; vImg.decoding = "async";
    vImg.addEventListener("error", function () { vWrap.style.display = "none"; });

    cap = mk("div", "tour-cap", cine);
    capWho = mk("p", "who", cap); capWho.textContent = "V";
    capSay = mk("p", "say", cap);

    var skip = mk("button", "tour-skip", cine); skip.type = "button";
    skip.textContent = t("Pular ⏭", "Skip ⏭");
    skip.addEventListener("click", finish);

    prog = mk("div", "tour-prog", cine);

    boot = mk("div", "tour-boot", cine);
    var bb = mk("div", "tour-boot-bar", boot);
    mk("i", null, bb); mk("i", null, bb); mk("i", null, bb);
    mk("span", null, bb).textContent = "guest@hacktheborges:~";
    bootBody = mk("div", "tour-boot-body", boot);

    document.body.appendChild(cine);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
  }

  function onKey(e) { if (playing && e.key === "Escape") { e.preventDefault(); finish(); } }
  function onResize() { if (playing && base) { capture(); } }

  /* mede host e portas no estado identidade */
  function capture() {
    var prev = host.style.transform; host.style.transform = "none";
    var hr = host.getBoundingClientRect();
    base = { left: hr.left, top: hr.top };
    doors = [];
    BEATS.forEach(function (b) {
      if (!b.sel) { doors.push(null); return; }
      var el = document.querySelector(b.sel), r = el ? el.getBoundingClientRect() : null;
      doors.push(r ? { el: el, cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height } : null);
    });
    host.style.transform = prev;
  }

  function camTo(cx, cy, scale) {
    var vw = innerWidth, vh = innerHeight;
    var ox = cx - base.left, oy = cy - base.top;
    host.style.transformOrigin = ox + "px " + oy + "px";
    host.style.transform = "translate(" + (vw / 2 - cx) + "px," + (vh / 2 - cy) + "px) scale(" + scale + ")";
  }
  function camHome(scale) {
    var vw = innerWidth, vh = innerHeight;
    camTo(base.left + (host.offsetWidth / 2), base.top + (host.offsetHeight / 2), scale || 1.05);
  }

  function focusDoor(i) {
    doors.forEach(function (d) { if (d && d.el) d.el.classList.remove("tour-focus"); });
    var d = doors[i]; if (d && d.el) d.el.classList.add("tour-focus");
  }

  function placeV(i) {
    var vw = innerWidth, vh = innerHeight;
    var d = doors[i];
    var bottomBar = (cine.classList.contains("lit") ? vh * 0.085 : 0);
    var restTop = vh - bottomBar - (vWrap.offsetHeight || 150) - (vh * 0.14);
    var x;
    if (d) { x = d.cx < vw / 2 ? vw * 0.70 : vw * 0.30; }   /* V no lado oposto à porta */
    else { x = vw * 0.5; }
    vWrap.classList.toggle("look-left", x > vw / 2);
    vWrap.style.left = x + "px";
    vWrap.style.top = restTop + "px";
  }

  function showCap(i) {
    cap.classList.remove("show");
    later(function () { capSay.textContent = t(BEATS[i].pt, BEATS[i].en); cap.classList.add("show"); }, 180);
  }

  function beat(i) {
    if (!playing) return;
    var b = BEATS[i], d = doors[i];
    if (i === 0) { camHome(1.07); }
    else if (i === BEATS.length - 1) { camHome(1.0); }
    else if (d) {
      var scale = Math.max(1.2, Math.min(2.15, (innerWidth * 0.55) / d.w));
      camTo(d.cx, d.cy, scale);
    } else { camHome(1.05); }
    focusDoor(i);
    placeV(i);
    showCap(i);
    var dwell = i === 0 ? INTRO_MS : (i === BEATS.length - 1 ? OUTRO_MS : BEAT_MS);
    if (i < BEATS.length - 1) { later(function () { beat(i + 1); }, dwell); }
    else { later(finish, dwell); }
  }

  function runReduced() {
    cine.classList.add("on", "lit");
    capture();
    var i = 0;
    (function step() {
      if (!playing) return;
      focusDoor(i); capSay.textContent = t(BEATS[i].pt, BEATS[i].en); cap.classList.add("show");
      if (i < BEATS.length - 1) { i++; later(step, 2100); } else { later(finish, 2100); }
    })();
  }

  function runCinematic() {
    cine.classList.add("lit");
    capture();
    vWrap.classList.add("in");
    /* barra de progresso ao longo do trecho de beats */
    var total = INTRO_MS + (BEATS.length - 2) * BEAT_MS + OUTRO_MS;
    prog.style.width = "0";
    requestAnimationFrame(function () { prog.classList.add("run"); prog.style.transitionDuration = total + "ms"; prog.style.width = "100%"; });
    requestAnimationFrame(function () { beat(0); });
  }

  function coldOpen(then) {
    boot.classList.add("show"); bootBody.textContent = "";
    if (reduce) { then(); return; }
    var li = 0;
    function line() {
      if (!playing) return;
      if (li >= BOOT.length) {
        var c = document.createElement("span"); c.className = "tour-cursor"; bootBody.appendChild(c);
        later(function () { boot.classList.remove("show"); later(then, 420); }, 520);
        return;
      }
      var def = BOOT[li], txt = t(def[1], def[2]);
      var span = document.createElement("span"); span.className = def[0]; bootBody.appendChild(span);
      var ci = 0;
      (function ch() {
        if (!playing) return;
        span.textContent = txt.slice(0, ci);
        if (ci <= txt.length) { ci++; later(ch, 18); }
        else { bootBody.appendChild(document.createTextNode("\n")); li++; later(line, 200); }
      })();
    }
    line();
  }

  function open() {
    build();
    if (playing) return;
    playing = true;
    try { localStorage.setItem(SEEN_KEY, "1"); } catch (e) {}
    lastFocus = document.activeElement;
    document.body.classList.add("tour-playing");
    cine.classList.add("on");
    if (reduce) { runReduced(); return; }
    coldOpen(runCinematic);
  }

  function finish() {
    if (!playing && built && !cine.classList.contains("on")) return;
    playing = false;
    clearTimers();
    if (host) { host.style.transform = ""; host.style.transformOrigin = ""; }
    doors.forEach(function (d) { if (d && d.el) d.el.classList.remove("tour-focus"); });
    if (cine) {
      cine.classList.remove("lit");
      vWrap.classList.remove("in");
      cap.classList.remove("show");
      prog.classList.remove("run"); prog.style.width = "0";
      boot.classList.remove("show");
      later(function () { cine.classList.remove("on"); }, 500);
    }
    document.body.classList.remove("tour-playing");
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  function bind() {
    var launch = document.getElementById("tour-launch");
    if (launch) { launch.addEventListener("click", function (e) { e.preventDefault(); open(); }); }
    maybeAuto();
  }

  function onHub() {
    var h = (location.hash || "").replace(/^#/, "");
    return h === "" || h === "hub" || h === "home";
  }
  function maybeAuto() {
    if (reduce) return;                 /* não força abertura com reduced-motion */
    var seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === "1"; } catch (e) {}
    if (seen || !onHub()) return;
    later(open, 1500);                  /* deixa a entrada do hub assentar */
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", bind); }
  else { bind(); }
})();
