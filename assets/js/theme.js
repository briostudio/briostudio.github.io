// ============================================
// Theme Toggle — Tailwind dark class strategy
// ============================================

(function () {
  var STORAGE_KEY = 'brio-theme';
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

  setTheme(getPreferredTheme());

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.classList.contains('dark') ? 'light' : 'dark';
      setTheme(next);
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
})();
