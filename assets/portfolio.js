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
  document.getElementById('year').textContent = new Date().getFullYear();
  apply(normalize(new URLSearchParams(location.search).get('lang')) || saved || 'pt', false);
})();
