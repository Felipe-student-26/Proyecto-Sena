// Descarga del reporte Excel CPIC (Módulo 11)

import axios from "axios";
import api from "./api";

/** Saca el nombre del archivo del header Content-Disposition del servidor */
function nombreDesdeContentDisposition(header: string | undefined, respaldo: string): string {
  if (!header) return respaldo;
  const utf8 = /filename\*=UTF-8''([^;\n]+)/i.exec(header);
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim());
    } catch {
      return respaldo;
    }
  }
  const entreComillas = /filename="([^"]+)"/i.exec(header);
  if (entreComillas?.[1]) return entreComillas[1].trim();
  const simple = /filename=([^;\s]+)/i.exec(header);
  if (simple?.[1]) return simple[1].replace(/['"]/g, "").trim();
  return respaldo;
}

/** Lee mensaje de error cuando Laravel devuelve JSON dentro de un blob */
async function mensajeDesdeBlobError(blob: Blob): Promise<string> {
  try {
    const texto = await blob.text();
    const data = JSON.parse(texto) as {
      message?: string;
      errors?: Record<string, string[]>;
    };
    if (typeof data.message === "string" && data.message.trim() !== "") {
      return data.message;
    }
    if (data.errors) {
      const primero = Object.values(data.errors).flat()[0];
      if (primero) return String(primero);
    }
  } catch {
    /* ignorar */
  }
  return "No se pudo generar el reporte. Revisa el periodo o inténtalo más tarde.";
}

export interface DescargarReporteExcelParams {
  fichaId: number;
  /** Para el nombre local si el servidor no envía Content-Disposition */
  numeroFicha: string;
  desde: string;
  hasta: string;
}

/**
 * Pide el Excel al API y dispara la descarga en el navegador.
 * @throws Error con mensaje legible si falla validación o el servidor responde error
 */
export async function descargarReporteExcelCp(params: DescargarReporteExcelParams): Promise<void> {
  const { fichaId, numeroFicha, desde, hasta } = params;
  const ym = desde.length >= 7 ? desde.slice(0, 7) : "";
  const respaldoNombre = `reporte_${numeroFicha}_${ym || "export"}.xlsx`;

  try {
    const res = await api.get<Blob>(`/api/reportes/excel/${fichaId}`, {
      params: { desde, hasta },
      responseType: "blob",
    });

    const blob = res.data;
    if (!(blob instanceof Blob)) {
      throw new Error("Respuesta inválida del servidor.");
    }

    const tipo = blob.type;
    if (tipo.includes("application/json")) {
      const msg = await mensajeDesdeBlobError(blob);
      throw new Error(msg);
    }

    const headerCd =
      (res.headers["content-disposition"] as string | undefined) ??
      (res.headers["Content-Disposition"] as string | undefined);
    const nombreArchivo = nombreDesdeContentDisposition(headerCd, respaldoNombre);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombreArchivo;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.data instanceof Blob) {
      const msg = await mensajeDesdeBlobError(e.response.data);
      throw new Error(msg);
    }
    if (e instanceof Error) throw e;
    throw new Error("No se pudo descargar el archivo.");
  }
}
