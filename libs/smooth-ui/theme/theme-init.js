// Applies the initial theme before first paint, with the same rules as SuiThemeService. Read-only: never saves.
(function () {
  try {
    var theme;
    try {
      theme = window.localStorage.getItem('sui-theme');
    } catch (e) {
      theme = null;
    }
    if (theme !== 'light' && theme !== 'dark') {
      theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    // Never break page load.
  }
})();
