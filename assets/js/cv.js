/* ── Ajuste estes dois valores ──────────────────────────────── */
var EXAM_DATE = "2026-10-23";   /* data do exame OSCP (AAAA-MM-DD) */
var UPDATED   = "2026-09-29";   /* data da última atualização      */
/* ───────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  var HOME = "curriculo";
  var SITE = "Artur Borges";

  var strings = {
    pt: { examOn: "Exame em ", copy: "Copiar", copied: "Copiado", passed: "Exame realizado" },
    en: { examOn: "Exam on ",  copy: "Copy",   copied: "Copied",  passed: "Exam taken" }
  };
  var lang = "pt";

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  var views  = document.querySelectorAll(".view");
  var links  = document.querySelectorAll("nav.tree a[href^='#']");
  var rail   = document.getElementById("rail");
  var scrim  = document.getElementById("scrim");
  var burger = document.getElementById("burger");

  /* ── datas ─────────────────────────────────────────────── */

  function parseDay(s) {
    var p = s.split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }

  function fmt(d, l) {
    return d.toLocaleDateString(l === "pt" ? "pt-BR" : "en-GB",
      { day: "2-digit", month: "long", year: "numeric" });
  }

  function renderDates() {
    var exam = parseDay(EXAM_DATE);
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var days = Math.round((exam - today) / 86400000);

    each(document.querySelectorAll("[data-days]"), function (el) {
      el.textContent = days >= 0 ? String(days) : "OK";
    });
    each(document.querySelectorAll("[data-examdate]"), function (el) {
      el.textContent = (days >= 0 ? strings[lang].examOn : strings[lang].passed + " · ") + fmt(exam, lang);
    });
    each(document.querySelectorAll("[data-updated]"), function (el) {
      el.textContent = fmt(parseDay(UPDATED), lang);
    });
  }

  /* ── idioma ────────────────────────────────────────────── */

  var i18n = document.querySelectorAll("[data-en]");
  each(i18n, function (el) { el.setAttribute("data-pt", el.textContent); });

  /* blocos com marcação interna (links) trocam innerHTML, não textContent */
  var i18nHtml = document.querySelectorAll("[data-en-html]");
  each(i18nHtml, function (el) { el.setAttribute("data-pt-html", el.innerHTML); });

  var langBtns = document.querySelectorAll("[data-lang]");
  var copyBtns = document.querySelectorAll("[data-copy]");

  function setLang(next) {
    lang = next;
    each(i18n, function (el) { el.textContent = el.getAttribute("data-" + next); });
    each(i18nHtml, function (el) { el.innerHTML = el.getAttribute("data-" + next + "-html"); });
    document.documentElement.lang = next === "pt" ? "pt-BR" : "en";
    each(langBtns, function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === next));
    });
    each(copyBtns, function (b) { b.textContent = strings[next].copy; });
    renderDates();
    route(current, true);
    try { localStorage.setItem("lang", next); } catch (e) { /* storage bloqueado */ }
  }

  /* ── rotas ─────────────────────────────────────────────── */

  var current = HOME;

  function slugFromHash() {
    var h = (location.hash || "").replace(/^#/, "");
    return document.getElementById("v-" + h) ? h : HOME;
  }

  function route(slug, quiet) {
    current = slug;
    var target = document.getElementById("v-" + slug);

    each(views, function (v) { v.hidden = (v !== target); });

    each(links, function (a) {
      var on = a.getAttribute("href") === "#" + slug;
      a.classList.toggle("on", on);
      if (on) {
        a.setAttribute("aria-current", "page");
        var box = a.closest("details");
        if (box) { box.open = true; }
      } else {
        a.removeAttribute("aria-current");
      }
    });

    var name = target ? target.getAttribute("data-title-" + lang) : null;
    document.title = name ? SITE + " — " + name : SITE;

    closeRail();
    if (!quiet) { window.scrollTo(0, 0); }
  }

  window.addEventListener("hashchange", function () { route(slugFromHash()); });

  /* ── gaveta no mobile ──────────────────────────────────── */

  function openRail() {
    rail.classList.add("open");
    scrim.hidden = false;
    burger.setAttribute("aria-expanded", "true");
  }
  function closeRail() {
    rail.classList.remove("open");
    scrim.hidden = true;
    burger.setAttribute("aria-expanded", "false");
  }
  burger.addEventListener("click", function () {
    if (rail.classList.contains("open")) { closeRail(); } else { openRail(); }
  });
  scrim.addEventListener("click", closeRail);
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") { return; }
    closeRail();
    if (!document.getElementById("lb").hidden) { closeLb(); }
  });

  /* ── copiar e-mail (um bloco ou vários) ────────────────── */

  each(copyBtns, function (btn) {
    var mail = btn.parentNode.querySelector("[data-mail]");
    if (!mail) { return; }

    function selectMail() {
      var r = document.createRange();
      r.selectNodeContents(mail);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
    }

    btn.addEventListener("click", function () {
      function done() {
        btn.textContent = strings[lang].copied;
        setTimeout(function () { btn.textContent = strings[lang].copy; }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(mail.textContent.trim()).then(done, selectMail);
      } else {
        selectMail();
      }
    });
  });

  /* ── ampliar imagem ────────────────────────────────────── */

  var lb = document.getElementById("lb");
  var lbImg = document.getElementById("lb-img");
  var lastZoom = null;

  function openLb(href, alt) {
    lbImg.setAttribute("src", href);
    lbImg.setAttribute("alt", alt || "");
    lb.hidden = false;
    document.getElementById("lb-x").focus();
  }
  function closeLb() {
    lb.hidden = true;
    lbImg.removeAttribute("src");
    if (lastZoom) { lastZoom.focus(); }
  }

  each(document.querySelectorAll("a[data-zoom]"), function (a) {
    a.addEventListener("click", function (e) {
      e.preventDefault();
      lastZoom = a;
      var img = a.querySelector("img");
      openLb(a.getAttribute("href"), img ? img.getAttribute("alt") : "");
    });
  });

  lb.addEventListener("click", function (e) {
    if (e.target === lbImg) { return; }
    closeLb();
  });

  /* ── início ────────────────────────────────────────────── */

  each(langBtns, function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });

  var saved = null;
  try { saved = localStorage.getItem("lang"); } catch (e) { /* storage bloqueado */ }

  closeRail();
  if (saved === "en") {
    setLang("en");
    route(slugFromHash(), true);
  } else {
    renderDates();
    route(slugFromHash(), true);
  }
})();

/* ── Verifique! — seletor de plataforma (OffSec / HTB) ── */
(function () {
  "use strict";
  var picks = document.querySelectorAll(".pick-btn");
  if (!picks.length) { return; }
  var galO = document.getElementById("gal-offsec");
  var galH = document.getElementById("gal-htb");
  function select(plat) {
    Array.prototype.forEach.call(picks, function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-plat") === plat));
    });
    if (galO) { galO.hidden = (plat !== "offsec"); }
    if (galH) { galH.hidden = (plat !== "htb"); }
  }
  Array.prototype.forEach.call(picks, function (b) {
    b.addEventListener("click", function () { select(b.getAttribute("data-plat")); });
  });
})();

/* Verifique! — painel de detalhe do pin no hover/foco */
(function(){
  var stages = document.querySelectorAll('.pin-stage');
  stages.forEach(function(stage){
    var panel = stage.querySelector('.pin-detail');
    if(!panel) return;
    var img  = panel.querySelector('.pd-img');
    var name = panel.querySelector('.pd-name');
    var meta = panel.querySelector('.pd-meta');
    var link = panel.querySelector('.pd-link');
    function fill(card){
      var cimg = card.querySelector('img');
      var src = cimg ? cimg.src : '';
      var nm  = card.getAttribute('data-name') || '';
      if(img){ img.src = src; img.alt = nm; }
      if(name) name.textContent = nm;
      if(meta) meta.textContent = card.getAttribute('data-meta') || '';
      if(link) link.href = card.getAttribute('href') || '#';
      panel.classList.add('on');
    }
    stage.querySelectorAll('.badge-card').forEach(function(card){
      card.addEventListener('mouseenter', function(){ fill(card); });
      card.addEventListener('focus',      function(){ fill(card); });
    });
    stage.addEventListener('mouseleave', function(){ panel.classList.remove('on'); });
  });
})();
