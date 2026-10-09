/* ── Ajuste estes dois valores ──────────────────────────────── */
var EXAM_DATE = "2026-10-23";   /* data do exame OSCP (AAAA-MM-DD) */
var UPDATED   = "2026-09-29";   /* data da última atualização      */
/* ───────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  var SITE = "Artur Borges";
  var strings = {
    pt: { examOn: "Exame em ", copy: "Copiar", copied: "Copiado", passed: "Exame realizado", home: "Início" },
    en: { examOn: "Exam on ",  copy: "Copy",   copied: "Copied",  passed: "Exam taken",      home: "Home" }
  };
  var lang = "pt";
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* ── registro de telas: chave -> {kind, parent} · elemento = v-<chave> (ou 'hub') ── */
  var REG = {
    hub:              { kind: "home" },
    offsec:           { kind: "door",    parent: "hub" },
    htb:              { kind: "door",    parent: "hub" },
    certificacoes:    { kind: "door",    parent: "hub" },
    sobre:            { kind: "door",    parent: "hub" },
    play:             { kind: "content", parent: "hub" },
    "offsec-pins":    { kind: "content", parent: "offsec" },
    "offsec-badges":  { kind: "content", parent: "offsec" },
    "pg-practice":    { kind: "content", parent: "offsec" },
    "oscp":           { kind: "content", parent: "certificacoes" },
    "security-plus":  { kind: "content", parent: "certificacoes" },
    "crta":           { kind: "content", parent: "certificacoes" },
    "htb-academy":    { kind: "content", parent: "htb" },
    "pratica":        { kind: "content", parent: "htb" },
    "htb-pins":       { kind: "content", parent: "htb" },
    "htb-flags":      { kind: "content", parent: "htb" },
    "sobre-perfil":   { kind: "content", parent: "sobre" },
    "curriculo":      { kind: "content", parent: "sobre" },
    "contato":        { kind: "content", parent: "sobre" }
  };
  function el(key) { return key === "hub" ? document.getElementById("hub") : document.getElementById("v-" + key); }
  function titleOf(key) {
    if (key === "hub") { return strings[lang].home; }
    var e = el(key);
    return e ? (e.getAttribute("data-title-" + lang) || e.getAttribute("data-title-pt") || key) : key;
  }

  /* ── injeta a barra de topo (voltar / início / trilha / idioma) ── */
  function buildTopbars() {
    Object.keys(REG).forEach(function (key) {
      if (key === "hub") { return; }
      var e = el(key);
      if (!e || e.querySelector(".topbar")) { return; }
      var parent = REG[key].parent;
      var bar = document.createElement("div");
      bar.className = "topbar";
      bar.innerHTML =
        '<div class="tb-nav">' +
          '<a class="tb-btn tb-back" href="#' + parent + '"><span aria-hidden="true">←</span> <span data-en="Back">Voltar</span></a>' +
          '<a class="tb-btn tb-home" href="#hub" aria-label="Início"><span aria-hidden="true">⌂</span></a>' +
        '</div>' +
        '<nav class="tb-crumb" aria-label="Trilha"></nav>' +
        '<div class="switch tb-switch" role="group" aria-label="Idioma / Language">' +
          '<button type="button" data-lang="pt" aria-pressed="true">PT</button>' +
          '<button type="button" data-lang="en" aria-pressed="false">EN</button>' +
        '</div>';
      e.insertBefore(bar, e.firstChild);
    });
  }

  /* ── envelopa o conteúdo das telas de conteúdo (para layout + topo fixo) ── */
  function wrapContent() {
    Object.keys(REG).forEach(function (key) {
      if (REG[key].kind !== "content") { return; }
      var e = el(key);
      if (!e || e.querySelector(".screen-inner")) { return; }
      var inner = document.createElement("div");
      inner.className = "screen-inner";
      var kids = [];
      each(e.childNodes, function (n) { kids.push(n); });
      kids.forEach(function (n) {
        if (n.nodeType === 1 && n.classList && n.classList.contains("topbar")) { return; }
        inner.appendChild(n);
      });
      e.appendChild(inner);
    });
  }

  /* ── trilha (breadcrumb) ── */
  function setCrumb(key) {
    var e = el(key);
    if (!e) { return; }
    var c = e.querySelector(".tb-crumb");
    if (!c) { return; }
    var chain = [], k = key;
    while (k) { chain.unshift(k); k = REG[k] ? REG[k].parent : null; }
    c.innerHTML = "";
    chain.forEach(function (k2, i) {
      if (i > 0) {
        var s = document.createElement("span");
        s.className = "tb-sep"; s.textContent = "›";
        c.appendChild(s);
      }
      var a = document.createElement("a");
      a.className = "tb-cr"; a.href = "#" + k2;
      a.textContent = titleOf(k2);
      if (i === chain.length - 1) { a.setAttribute("aria-current", "page"); }
      c.appendChild(a);
    });
  }

  /* ── datas ── */
  function parseDay(s) { var p = s.split("-"); return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2])); }
  function fmt(d, l) { return d.toLocaleDateString(l === "pt" ? "pt-BR" : "en-GB", { day: "2-digit", month: "long", year: "numeric" }); }
  function renderDates() {
    var exam = parseDay(EXAM_DATE), now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.round((exam - today) / 86400000);
    each(document.querySelectorAll("[data-days]"), function (el2) { el2.textContent = days >= 0 ? String(days) : "OK"; });
    each(document.querySelectorAll("[data-examdate]"), function (el2) {
      el2.textContent = (days >= 0 ? strings[lang].examOn : strings[lang].passed + " · ") + fmt(exam, lang);
    });
    each(document.querySelectorAll("[data-updated]"), function (el2) { el2.textContent = fmt(parseDay(UPDATED), lang); });
  }

  /* ── idioma ── */
  var i18n, i18nHtml;
  function setLang(next) {
    lang = next;
    each(i18n, function (el2) { el2.textContent = el2.getAttribute("data-" + next); });
    each(i18nHtml, function (el2) { el2.innerHTML = el2.getAttribute("data-" + next + "-html"); });
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
    each(document.querySelectorAll("[data-lang]"), function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === next));
    });
    each(document.querySelectorAll("[data-copy]"), function (b) { b.textContent = strings[next].copy; });
    renderDates();
    if (current !== "hub") { setCrumb(current); }
    document.title = current === "hub" ? SITE : SITE + " — " + titleOf(current);
    try { localStorage.setItem("lang", next); } catch (e) { /* storage bloqueado */ }
  }

  /* ── rotas ── */
  var current = "hub";
  function keyFromHash() {
    var h = (location.hash || "").replace(/^#/, "");
    if (h === "" || h === "home") { h = "hub"; }
    return (h === "hub" || el(h)) ? h : "hub";
  }
  function route(key, quiet) {
    if (!(key === "hub" || REG[key])) { key = "hub"; }
    current = key;
    Object.keys(REG).forEach(function (k) { var e = el(k); if (e) { e.hidden = (k !== key); } });
    document.body.classList.toggle("home-on", key === "hub");
    if (key !== "hub") { setCrumb(key); }
    document.title = key === "hub" ? SITE : SITE + " — " + titleOf(key);
    var e = el(key);
    if (e) { try { e.scrollTop = 0; } catch (x) {} }
    if (!quiet) { window.scrollTo(0, 0); }
  }
  window.addEventListener("hashchange", function () { route(keyFromHash()); });

  /* ── parallax global (fundo + títulos) via variáveis no :root ── */
  function initParallax() {
    var root = document.documentElement;
    each(document.querySelectorAll("[data-depth]"), function (e2) { e2.style.setProperty("--d", e2.getAttribute("data-depth") || "0"); });
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { return; }
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    function loop() {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      root.style.setProperty("--mx", cx.toFixed(4));
      root.style.setProperty("--my", cy.toFixed(4));
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) { raf = requestAnimationFrame(loop); } else { raf = null; }
    }
    function kick() { if (!raf) { raf = requestAnimationFrame(loop); } }
    window.addEventListener("pointermove", function (ev) {
      tx = (ev.clientX / window.innerWidth - 0.5) * 2;
      ty = (ev.clientY / window.innerHeight - 0.5) * 2;
      kick();
    }, { passive: true });
  }

  /* ── copiar e-mail ── */
  function bindCopy() {
    each(document.querySelectorAll("[data-copy]"), function (btn) {
      var mail = btn.parentNode.querySelector("[data-mail]");
      if (!mail) { return; }
      function selectMail() {
        var r = document.createRange(); r.selectNodeContents(mail);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      }
      btn.addEventListener("click", function () {
        function done() { btn.textContent = strings[lang].copied; setTimeout(function () { btn.textContent = strings[lang].copy; }, 1600); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(mail.textContent.trim()).then(done, selectMail);
        } else { selectMail(); }
      });
    });
  }

  /* ── ampliar imagem ── */
  var lb, lbImg, lastZoom = null;
  function openLb(href, alt) { lbImg.setAttribute("src", href); lbImg.setAttribute("alt", alt || ""); lb.hidden = false; document.getElementById("lb-x").focus(); }
  function closeLb() { lb.hidden = true; lbImg.removeAttribute("src"); if (lastZoom) { lastZoom.focus(); } }
  function bindLightbox() {
    lb = document.getElementById("lb"); lbImg = document.getElementById("lb-img");
    if (!lb) { return; }
    each(document.querySelectorAll("a[data-zoom]"), function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault(); lastZoom = a;
        var img = a.querySelector("img");
        openLb(a.getAttribute("href"), img ? img.getAttribute("alt") : "");
      });
    });
    lb.addEventListener("click", function (e) { if (e.target === lbImg) { return; } closeLb(); });
  }

  /* ── início ── */
  buildTopbars();
  wrapContent();

  i18n = document.querySelectorAll("[data-en]");
  each(i18n, function (el2) { el2.setAttribute("data-pt", el2.textContent); });
  i18nHtml = document.querySelectorAll("[data-en-html]");
  each(i18nHtml, function (el2) { el2.setAttribute("data-pt-html", el2.innerHTML); });

  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest("[data-lang]") : null;
    if (b) { setLang(b.getAttribute("data-lang")); }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lb && !lb.hidden) { closeLb(); }
  });

  bindCopy();
  bindLightbox();
  initParallax();

  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) { /* storage bloqueado */ }
  if (saved === "en") { setLang("en"); } else { renderDates(); }
  route(keyFromHash(), true);
})();

/* Pins — painel de detalhe no hover/foco */
(function () {
  var stages = document.querySelectorAll(".pin-stage");
  Array.prototype.forEach.call(stages, function (stage) {
    var panel = stage.querySelector(".pin-detail");
    if (!panel) { return; }
    var img = panel.querySelector(".pd-img");
    var name = panel.querySelector(".pd-name");
    var meta = panel.querySelector(".pd-meta");
    var link = panel.querySelector(".pd-link");
    function fill(card) {
      var cimg = card.querySelector("img");
      if (img) { img.src = cimg ? cimg.src : ""; img.alt = card.getAttribute("data-name") || ""; }
      if (name) { name.textContent = card.getAttribute("data-name") || ""; }
      if (meta) { meta.textContent = card.getAttribute("data-meta") || ""; }
      if (link) { link.href = card.getAttribute("href") || "#"; }
      panel.classList.add("on");
    }
    Array.prototype.forEach.call(stage.querySelectorAll(".badge-card"), function (card) {
      card.addEventListener("mouseenter", function () { fill(card); });
      card.addEventListener("focus", function () { fill(card); });
    });
    stage.addEventListener("mouseleave", function () { panel.classList.remove("on"); });
  });
})();
