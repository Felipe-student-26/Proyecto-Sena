const STORAGE_KEY = "quorum-sidebar-expanded";

export function leerSidebarExpandido(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch {
    /* ignore */
  }
  return null;
}

export function guardarSidebarExpandido(expandido: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, expandido ? "1" : "0");
  } catch {
    /* ignore */
  }
}
