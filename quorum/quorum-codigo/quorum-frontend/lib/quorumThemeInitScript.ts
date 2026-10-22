/** IIFE para <script> inline en el layout raíz (tema + escala antes del paint). */
export const QUORUM_THEME_INIT_SCRIPT = `(function(){
  try {
    var t = localStorage.getItem('quorum-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === 'dark' || (t !== 'light' && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    var fs = localStorage.getItem('quorum-font-scale');
    if (fs != null) {
      var n = parseFloat(fs);
      if (!isNaN(n) && n >= 0.85 && n <= 2) {
        document.documentElement.style.setProperty('--font-scale', String(n));
      }
    }
    if (localStorage.getItem('quorum-high-contrast') === '1') {
      document.documentElement.classList.add('high-contrast');
    }
  } catch (e) {}
})();`;
