import { THEME_STORAGE_KEY } from "./themeStorage";

/** Alterna clase dark en html y localStorage. Devuelve si quedó en oscuro. */
export function toggleHtmlTheme(): boolean {
  const pasarAOscuro = !document.documentElement.classList.contains("dark");
  if (pasarAOscuro) {
    document.documentElement.classList.add("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, "dark");
    } catch {
      /* ignore */
    }
  } else {
    document.documentElement.classList.remove("dark");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, "light");
    } catch {
      /* ignore */
    }
  }
  return pasarAOscuro;
}
