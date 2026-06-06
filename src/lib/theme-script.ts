export const themeScript = `
(function() {
  try {
    var theme = localStorage.getItem('theme') || 'light';
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolved);
    document.documentElement.style.colorScheme = resolved;
    document.cookie = 'theme=' + resolved + ';path=/;max-age=31536000;SameSite=Lax';
  } catch (e) {}
})()
`
