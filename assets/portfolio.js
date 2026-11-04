(function () {
  'use strict';
  const root = document.documentElement;
  const key = 'borges-language';
  const normalize = value => value === 'en' ? 'en' : value === 'pt' || value === 'pt-BR' ? 'pt' : null;
  let saved;
  try { saved = normalize(localStorage.getItem(key)); } catch {}
  function apply(value, updateURL) {
    const language = normalize(value) || 'pt';
    root.lang = language === 'en' ? 'en' : 'pt-BR';
    root.dataset.language = language;
    document.querySelectorAll('[data-pt][data-en]').forEach(element => {
      element.textContent = element.getAttribute('data-' + language);
    });
    document.querySelectorAll('[data-i18n-attrs]').forEach(element => {
      element.getAttribute('data-i18n-attrs').split(' ').forEach(attribute => {
        const text = element.getAttribute('data-' + language + '-' + attribute);
        if (text !== null) element.setAttribute(attribute, text);
      });
    });
    document.querySelectorAll('[data-language]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.language === language));
    });
    try { localStorage.setItem(key, language); } catch {}
    if (updateURL) {
      const url = new URL(location.href);
      url.searchParams.set('lang', language);
      history.replaceState(null, '', url);
    }
  }
  document.querySelectorAll('button[data-language]').forEach(button => {
    button.addEventListener('click', () => apply(button.dataset.language, true));
  });
  window.addEventListener('storage', event => {
    if (event.key === key) apply(event.newValue, false);
  });
  const panes = Array.from(document.querySelectorAll('.workspace .pane'));
  function activatePane(pane) {
    panes.forEach(item => item.classList.toggle('is-active', item === pane));
  }
  function activateHashPane() {
    const target = document.getElementById(location.hash.slice(1));
    const pane = target && target.closest('.pane');
    if (pane) activatePane(pane);
  }
  panes.forEach(pane => {
    pane.addEventListener('pointerdown', event => {
      activatePane(pane);
      if (!event.target.closest('a, button, input, select, textarea, [contenteditable]')) {
        pane.focus({ preventScroll: true });
      }
    });
    pane.addEventListener('focusin', () => activatePane(pane));
  });
  window.addEventListener('hashchange', activateHashPane);
  activatePane(panes.find(pane => pane.classList.contains('is-active')) || panes[0]);
  activateHashPane();
  function animateCommands() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const introKey = 'borges-terminal-intro-v1';
    try {
      if (sessionStorage.getItem(introKey)) return;
      sessionStorage.setItem(introKey, 'shown');
    } catch {}
    document.querySelectorAll('.command-text').forEach((command, index) => {
      command.style.setProperty('--typing-steps', command.textContent.length);
      command.style.setProperty('--typing-delay', (index * 110) + 'ms');
      command.classList.add('is-typing');
      command.addEventListener('animationend', () => command.classList.remove('is-typing'), { once: true });
    });
  }
  document.getElementById('year').textContent = new Date().getFullYear();
  apply(normalize(new URLSearchParams(location.search).get('lang')) || saved || 'pt', false);
  animateCommands();
})();
