/* ═══════════════════════════════════════════════════════════════
   Tour guiado — boot de terminal + V como guia narrativo
   Independente do script inline. Dispara pelo botão "Fazer o tour".
   Sem storage obrigatório, pulável, acessível, respeita reduced-motion.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var reduce = false;
  try { reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}

  function lang() {
    var b = document.querySelector('[data-lang][aria-pressed="true"]');
    if (b) { return b.getAttribute("data-lang") === "en" ? "en" : "pt"; }
    try { return localStorage.getItem("lang") === "en" ? "en" : "pt"; } catch (e) { return "pt"; }
  }
  function t(pt, en) { return lang() === "en" ? en : pt; }

  /* linhas do boot: [classe, pt, en] */
  var BOOT = [
    ["pr",   "$ whoami",                 "$ whoami"],
    ["",     "borges",                   "borges"],
    ["pr",   "$ ./tour.sh --guia V",     "$ ./tour.sh --guide V"],
    ["ok",   "[ok] carregando guia...",  "[ok] loading guide..."],
    ["vline","> V online. Vem comigo.",  "> V online. Follow me."]
  ];

  /* passos do guia: sel = porta destacada (null = intro, sem holofote) */
  var STEPS = [
    { sel: null,              pt: "Eu sou o V. Em 30 segundos te mostro as portas desse lugar — cada uma leva a uma parte da minha jornada ofensiva.",
                              en: "I'm V. In 30 seconds I'll show you the doors of this place — each one leads to a part of my offensive journey." },
    { sel: 'a[href="#offsec"]',        pt: "OffSec — minhas certificações, pins e labs. É onde a ofensiva vira método.",
                              en: "OffSec — my certifications, pins and labs. Where offense becomes method." },
    { sel: 'a[href="#htb"]',           pt: "Hack The Box — máquinas, Academy e flags. Treino de verdade, mão na massa.",
                              en: "Hack The Box — machines, Academy and flags. Real, hands-on training." },
    { sel: 'a[href="#certificacoes"]', pt: "Certificações — cada selo com a história de como foi conquistado.",
                              en: "Certifications — each badge with the story of how it was earned." },
    { sel: 'a[href="#sobre"]',         pt: "Sobre — quem eu sou e pra onde essa trilha me leva.",
                              en: "About — who I am and where this path is taking me." },
    { sel: 'a[href="#play"]',          pt: "Do you wanna play? Um terminal de verdade te espera. Topa o desafio?",
                              en: "Do you wanna play? A real terminal awaits you. Up for the challenge?" }
  ];

  var FIG = "/assets/img/v/hub-peek.png";

  var ov, dim, ring, term, termBody, guide, sayEl, dotsEl, btnBack, btnNext, figImg;
  var idx = 0, built = false, lastFocus = null, typing = null;

  function mk(tag, cls, parent) { var e = document.createElement(tag); if (cls) { e.className = cls; } if (parent) { parent.appendChild(e); } return e; }

  function build() {
    if (built) { return; }
    built = true;
    ov = mk("div", "tour-overlay"); ov.setAttribute("role", "dialog"); ov.setAttribute("aria-modal", "true"); ov.setAttribute("aria-label", "Tour");
    dim = mk("div", "tour-dim", ov);
    ring = mk("div", "tour-ring", ov);

    /* terminal de boot */
    term = mk("div", "tour-term", ov);
    var bar = mk("div", "tour-term-bar", term);
    mk("i", null, bar); mk("i", null, bar); mk("i", null, bar);
    mk("span", null, bar).textContent = "guest@hacktheborges:~";
    termBody = mk("div", "tour-term-body", term);
    var skip = mk("button", "tour-term-skip", term); skip.type = "button";
    skip.textContent = t("Pular introdução", "Skip intro");
    skip.addEventListener("click", startGuide);

    /* cartão do guia */
    guide = mk("div", "tour-guide", ov);
    var fig = mk("div", "tour-guide-fig", guide);
    figImg = mk("img", null, fig); figImg.src = FIG; figImg.alt = "V"; figImg.decoding = "async";
    figImg.addEventListener("error", function () { fig.style.display = "none"; });
    var main = mk("div", "tour-guide-main", guide);
    mk("div", "tour-guide-who", main).textContent = "V";
    sayEl = mk("p", "tour-guide-say", main);
    var foot = mk("div", "tour-guide-foot", main);
    dotsEl = mk("div", "tour-dots", foot);
    STEPS.forEach(function () { mk("i", null, dotsEl); });
    btnBack = mk("button", "tour-btn ghost", foot); btnBack.type = "button";
    btnBack.addEventListener("click", function () { go(idx - 1); });
    var btnSkip = mk("button", "tour-btn ghost", foot); btnSkip.type = "button";
    btnSkip.textContent = t("Sair", "Exit");
    btnSkip.addEventListener("click", close);
    btnNext = mk("button", "tour-btn go", foot); btnNext.type = "button";
    btnNext.addEventListener("click", function () { if (idx >= STEPS.length - 1) { close(); } else { go(idx + 1); } });

    document.body.appendChild(ov);
    window.addEventListener("resize", positionRing);
    document.addEventListener("keydown", onKey);
  }

  function onKey(e) {
    if (!ov || !ov.classList.contains("on")) { return; }
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowRight" && guide.classList.contains("on")) { if (idx < STEPS.length - 1) { go(idx + 1); } }
    else if (e.key === "ArrowLeft" && guide.classList.contains("on")) { if (idx > 0) { go(idx - 1); } }
  }

  /* ── boot typing ── */
  function runBoot() {
    term.style.display = "block"; guide.classList.remove("on"); ring.classList.remove("on");
    termBody.textContent = "";
    if (reduce) {
      BOOT.forEach(function (l) {
        var s = document.createElement("span"); s.className = l[0]; s.textContent = t(l[1], l[2]) + "\n"; termBody.appendChild(s);
      });
      var c = document.createElement("span"); c.className = "tour-caret-blink"; termBody.appendChild(c);
      return;
    }
    var li = 0;
    function line() {
      if (li >= BOOT.length) {
        var c = document.createElement("span"); c.className = "tour-caret-blink"; termBody.appendChild(c);
        typing = setTimeout(startGuide, 600);
        return;
      }
      var def = BOOT[li], txt = t(def[1], def[2]);
      var span = document.createElement("span"); span.className = def[0]; termBody.appendChild(span);
      var ci = 0;
      (function ch() {
        span.textContent = txt.slice(0, ci);
        if (ci <= txt.length) { ci++; typing = setTimeout(ch, 20); }
        else { termBody.appendChild(document.createTextNode("\n")); li++; typing = setTimeout(line, 230); }
      })();
    }
    line();
  }

  /* ── guia ── */
  function startGuide() {
    if (typing) { clearTimeout(typing); typing = null; }
    term.style.display = "none";
    guide.classList.add("on");
    go(0);
  }

  function positionRing() {
    if (!guide.classList.contains("on")) { return; }
    var step = STEPS[idx];
    if (!step || !step.sel) { ring.classList.remove("on"); return; }
    var target = document.querySelector(step.sel);
    if (!target) { ring.classList.remove("on"); return; }
    var r = target.getBoundingClientRect();
    var pad = 8;
    ring.style.top = (r.top - pad) + "px";
    ring.style.left = (r.left - pad) + "px";
    ring.style.width = (r.width + pad * 2) + "px";
    ring.style.height = (r.height + pad * 2) + "px";
    ring.classList.add("on");
  }

  function go(i) {
    idx = Math.max(0, Math.min(STEPS.length - 1, i));
    var step = STEPS[idx];
    sayEl.textContent = t(step.pt, step.en);
    Array.prototype.forEach.call(dotsEl.children, function (d, n) { d.className = n === idx ? "on" : ""; });
    btnBack.textContent = t("‹ Voltar", "‹ Back");
    btnBack.style.visibility = idx === 0 ? "hidden" : "visible";
    btnNext.textContent = idx >= STEPS.length - 1 ? t("Entrar", "Enter") : t("Próximo ›", "Next ›");
    positionRing();
    try { btnNext.focus(); } catch (e) {}
  }

  function open() {
    build();
    lastFocus = document.activeElement;
    try { document.documentElement.style.overflow = "hidden"; document.body.style.overflow = "hidden"; } catch (e) {}
    ov.classList.add("on");
    runBoot();
  }

  function close() {
    if (typing) { clearTimeout(typing); typing = null; }
    if (ov) { ov.classList.remove("on"); ring.classList.remove("on"); guide.classList.remove("on"); }
    try { document.documentElement.style.overflow = ""; document.body.style.overflow = ""; } catch (e) {}
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  function bind() {
    var launch = document.getElementById("tour-launch");
    if (launch) { launch.addEventListener("click", function (e) { e.preventDefault(); open(); }); }
  }

  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", bind); }
  else { bind(); }
})();
