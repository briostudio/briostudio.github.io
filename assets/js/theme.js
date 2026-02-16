// ============================================
// Theme Toggle — Tailwind dark class strategy
// ============================================

(function () {
  var STORAGE_KEY = 'epd-theme';
  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');

  function getPreferredTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function setTheme(theme) {
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  // Initial apply (also runs from inline script in <head> to avoid flash)
  setTheme(getPreferredTheme());

  // Toggle button
  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.classList.contains('dark') ? 'light' : 'dark';
      setTheme(next);
    });
  }

  // React to system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
})();
