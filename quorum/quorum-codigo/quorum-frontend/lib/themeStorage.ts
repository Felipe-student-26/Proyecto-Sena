// Claves localStorage para tema y escala de texto (accesibilidad)

export const THEME_STORAGE_KEY = "quorum-theme";
export const FONT_SCALE_STORAGE_KEY = "quorum-font-scale";
export const HIGH_CONTRAST_STORAGE_KEY = "quorum-high-contrast";

export type TemaPreferido = "light" | "dark";

export const FONT_SCALE_MIN = 0.85;
export const FONT_SCALE_MAX = 2;

const MIN_ESCALA = FONT_SCALE_MIN;
const MAX_ESCALA = FONT_SCALE_MAX;

export function escalaFuenteValida(n: number): boolean {
  return !Number.isNaN(n) && n >= MIN_ESCALA && n <= MAX_ESCALA;
}

export function obtenerEscalaGuardada(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FONT_SCALE_STORAGE_KEY);
    if (raw === null) return null;
    const n = parseFloat(raw);
    return escalaFuenteValida(n) ? n : null;
  } catch {
    return null;
  }
}

// Disparado al guardar escala o alto contraste (misma pestaña) para sincronizar Headbar / perfil
const EVENTO_PREFERENCIAS_ACCESIBILIDAD = "quorum-preferencias-accesibilidad";

export function notificarPreferenciasAccesibilidad(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENTO_PREFERENCIAS_ACCESIBILIDAD));
}

export function escucharPreferenciasAccesibilidad(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVENTO_PREFERENCIAS_ACCESIBILIDAD, callback);
  return () => window.removeEventListener(EVENTO_PREFERENCIAS_ACCESIBILIDAD, callback);
}

export function guardarEscala(n: number): void {
  try {
    localStorage.setItem(FONT_SCALE_STORAGE_KEY, String(n));
    notificarPreferenciasAccesibilidad();
  } catch {
    /* ignore */
  }
}

export function aplicarEscalaEnDocumento(n: number): void {
  if (typeof document === "undefined") return;
  if (escalaFuenteValida(n)) {
    document.documentElement.style.setProperty("--font-scale", String(n));
  }
}

export function esDocumentoOscuro(): boolean {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("dark");
}

// --- Alto contraste (clase en <html>) — M13 + Headbar sincronizados

export function obtenerAltoContrasteGuardado(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(HIGH_CONTRAST_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function guardarAltoContraste(activo: boolean): void {
  try {
    if (activo) {
      localStorage.setItem(HIGH_CONTRAST_STORAGE_KEY, "1");
    } else {
      localStorage.removeItem(HIGH_CONTRAST_STORAGE_KEY);
    }
    notificarPreferenciasAccesibilidad();
  } catch {
    /* ignore */
  }
}

export function aplicarAltoContrasteEnDocumento(activo: boolean): void {
  if (typeof document === "undefined") return;
  if (activo) {
    document.documentElement.classList.add("high-contrast");
  } else {
    document.documentElement.classList.remove("high-contrast");
  }
}
