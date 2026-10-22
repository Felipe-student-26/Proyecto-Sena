// API tomar asistencia (M7) e historial matriz (M8)

import axios from "axios";
import api from "./api";
import type {
  EvidenciaExcusaItem,
  HistorialMatrizRespuesta,
  IniciarSesionRespuesta,
  ListadoEvidenciasRespuesta,
  TipoAsistencia,
} from "../types/asistencia";

// Pide cookie CSRF antes de POST (Sanctum SPA)
async function asegurarCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

export interface PayloadIniciarSesion {
  ficha_id: number;
  fecha: string;
  horario_id?: number;
}

/** Abre o recupera sesión abierta y devuelve aprendices */
export async function iniciarSesionAsistencia(
  payload: PayloadIniciarSesion
): Promise<IniciarSesionRespuesta> {
  await asegurarCsrf();
  const r = await api.post<IniciarSesionRespuesta>("/api/asistencia/iniciar-sesion", payload);
  return r.data;
}

export interface FilaRegistroGuardar {
  aprendiz_id: number;
  tipo: string;
  horas_inasistencia?: number | null;
  excusa_motivo?: string | null;
}

/** Cierra la sesión y guarda todos los registros (multipart si hay evidencias por aprendiz). */
export async function guardarAsistencia(
  sesionId: number,
  registros: FilaRegistroGuardar[],
  evidenciasPorAprendizId?: Record<number, File>
): Promise<void> {
  await asegurarCsrf();
  const fd = new FormData();
  fd.append("registros", JSON.stringify(registros));
  if (evidenciasPorAprendizId) {
    Object.entries(evidenciasPorAprendizId).forEach(([aid, file]) => {
      if (file) {
        fd.append(`evidencias[${aid}]`, file);
      }
    });
  }
  await api.post(`/api/asistencia/sesiones/${sesionId}/guardar`, fd);
}

/** Quita charset del Content-Type para usar en Blob. */
function mimePrincipal(header: string | undefined): string {
  const h = (header ?? "").trim();
  const part = h.split(";")[0]?.trim() ?? "";
  return part.toLowerCase();
}

/** PDF / imagen: abrir en pestaña; Word y otros: solo descarga. */
function esVistaPreviaPdfOImagen(contentTypeHeader: string, nombreArchivo: string): boolean {
  const ct = mimePrincipal(contentTypeHeader);
  if (ct.includes("application/pdf")) return true;
  if (ct.startsWith("image/")) return true;
  return /\.(pdf|jpe?g|png|gif|webp)$/i.test(nombreArchivo);
}

function tipoMimeParaBlob(contentTypeHeader: string, nombreArchivo: string, blob: Blob): string {
  const ct = mimePrincipal(contentTypeHeader);
  if (ct && ct !== "application/octet-stream") {
    return ct;
  }
  const ext = nombreArchivo.toLowerCase().match(/\.([a-z0-9]+)$/);
  const map: Record<string, string> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  if (ext && map[ext[1]]) return map[ext[1]];
  return blob.type || "application/octet-stream";
}

function dispararDescargaObjeto(url: string, nombre: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Abre el blob en pestaña nueva sin `download` (evita el diálogo «Guardar como» del sistema). */
function abrirBlobEnPestañaSinDescarga(objectUrl: string): void {
  const a = document.createElement("a");
  a.href = objectUrl;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** URL absoluta (solo referencia; preferir `descargarExcusaEvidencia` para enviar cookies). */
export function urlExcusaEvidencia(registroId: number): string {
  const base = (
    process.env.NEXT_PUBLIC_API_URL ??
    (typeof window !== "undefined" ? "" : "http://localhost:8000")
  ).replace(/\/$/, "");
  return `${base}/api/asistencia/registros/${registroId}/excusa-evidencia`;
}

/**
 * Obtiene la evidencia con Sanctum y abre PDF/imagen en nueva pestaña;
 * Word y otros tipos se descargan con el nombre correcto.
 */
export async function descargarExcusaEvidencia(registroId: number): Promise<void> {
  try {
    const r = await api.get(`/api/asistencia/registros/${registroId}/excusa-evidencia`, {
      responseType: "blob",
      headers: {
        Accept: "*/*",
      },
    });

    const blob = r.data as Blob;
    const ctHeader = r.headers["content-type"] ?? "";
    const ctLower = ctHeader.toLowerCase();
    if (ctLower.includes("application/json")) {
      const text = await blob.text();
      let msg = "No se pudo descargar la evidencia.";
      try {
        const j = JSON.parse(text) as { message?: string };
        if (j.message) msg = j.message;
      } catch {
        /* ignorar */
      }
      throw new Error(msg);
    }

    let nombre = "evidencia";
    const cd = r.headers["content-disposition"];
    if (cd) {
      const mStar = cd.match(/filename\*=(?:UTF-8'')?([^;\n]+)/i);
      const mQuoted = cd.match(/filename="([^"]+)"/i);
      const mPlain = cd.match(/filename=([^;\s]+)/i);
      if (mStar) {
        try {
          nombre = decodeURIComponent(mStar[1].trim().replace(/^"|"$/g, ""));
        } catch {
          nombre = mStar[1].trim();
        }
      } else if (mQuoted) {
        nombre = mQuoted[1];
      } else if (mPlain) {
        nombre = mPlain[1].replace(/^"|"$/g, "");
      }
    }

    const tipo = tipoMimeParaBlob(ctHeader, nombre, blob);
    const blobTipado =
      !blob.type || blob.type === "application/octet-stream" ? new Blob([blob], { type: tipo }) : blob;

    const objectUrl = URL.createObjectURL(blobTipado);

    if (esVistaPreviaPdfOImagen(ctHeader, nombre)) {
      // Solo vista en pestaña: no usar `<a download>` (provoca «Guardar como»).
      abrirBlobEnPestañaSinDescarga(objectUrl);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      return;
    }

    dispararDescargaObjeto(objectUrl, nombre);
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.data instanceof Blob) {
      const text = await e.response.data.text();
      try {
        const j = JSON.parse(text) as { message?: string };
        throw new Error(j.message ?? "No se pudo descargar la evidencia.");
      } catch (inner) {
        if (inner instanceof Error && !(inner instanceof SyntaxError)) {
          throw inner;
        }
        throw new Error(
          text.length > 0 && text.length < 300 ? text : "No se pudo descargar la evidencia."
        );
      }
    }
    throw e;
  }
}

export interface FiltrosHistorialAsistencia {
  desde?: string;
  hasta?: string;
  tipos?: TipoAsistencia[];
  /** Solo sesiones de horarios de esta jornada (M10 / filtro opcional) */
  jornada_ficha_id?: number;
}

/** Construye query string con tipo[] repetido para Laravel */
function queryHistorialAsistencia(filtros: FiltrosHistorialAsistencia): string {
  const p = new URLSearchParams();
  if (filtros.desde) p.set("desde", filtros.desde);
  if (filtros.hasta) p.set("hasta", filtros.hasta);
  filtros.tipos?.forEach((t) => p.append("tipo[]", t));
  if (filtros.jornada_ficha_id != null) {
    p.set("jornada_ficha_id", String(filtros.jornada_ficha_id));
  }
  const qs = p.toString();

  return qs;
}

export interface FiltrosListarEvidencias {
  ficha_id?: number;
  aprendiz_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
}

/** Listado de excusas con evidencia adjunta (panel de gestión). */
export async function listarEvidencias(
  filtros: FiltrosListarEvidencias = {}
): Promise<EvidenciaExcusaItem[]> {
  const p = new URLSearchParams();
  if (filtros.ficha_id != null) p.set("ficha_id", String(filtros.ficha_id));
  if (filtros.aprendiz_id != null) p.set("aprendiz_id", String(filtros.aprendiz_id));
  if (filtros.fecha_desde) p.set("fecha_desde", filtros.fecha_desde);
  if (filtros.fecha_hasta) p.set("fecha_hasta", filtros.fecha_hasta);
  const qs = p.toString();
  const url = qs === "" ? "/api/asistencia/evidencias" : `/api/asistencia/evidencias?${qs}`;
  const r = await api.get<ListadoEvidenciasRespuesta>(url);
  return r.data.data;
}

/** Matriz de historial por ficha (GET) */
export async function obtenerHistorialAsistencia(
  fichaId: number,
  filtros: FiltrosHistorialAsistencia = {}
): Promise<HistorialMatrizRespuesta> {
  const qs = queryHistorialAsistencia(filtros);
  const url =
    qs === ""
      ? `/api/asistencia/historial/${fichaId}`
      : `/api/asistencia/historial/${fichaId}?${qs}`;
  const r = await api.get<HistorialMatrizRespuesta>(url);
  return r.data;
}

export interface PayloadActualizarRegistro {
  tipo: TipoAsistencia;
  horas_inasistencia?: number | null;
  razon?: string | null;
  excusa_motivo?: string | null;
}

/** Corrige un registro con sesión cerrada (PUT multipart si hay evidencia nueva). */
export async function actualizarRegistroAsistencia(
  registroId: number,
  payload: PayloadActualizarRegistro,
  evidencia?: File | null
): Promise<void> {
  await asegurarCsrf();
  if (evidencia) {
    const fd = new FormData();
    fd.append("tipo", payload.tipo);
    if (payload.horas_inasistencia != null) {
      fd.append("horas_inasistencia", String(payload.horas_inasistencia));
    }
    if (payload.razon != null && payload.razon !== "") {
      fd.append("razon", payload.razon);
    }
    if (payload.tipo === "excusa" && payload.excusa_motivo != null) {
      fd.append("excusa_motivo", payload.excusa_motivo);
    }
    fd.append("evidencia", evidencia);
    await api.put(`/api/asistencia/registros/${registroId}`, fd);
  } else {
    const body: Record<string, unknown> = {
      tipo: payload.tipo,
      horas_inasistencia: payload.horas_inasistencia ?? null,
      razon: payload.razon ?? null,
    };
    if (payload.tipo === "excusa" && payload.excusa_motivo != null) {
      body.excusa_motivo = payload.excusa_motivo;
    }
    await api.put(`/api/asistencia/registros/${registroId}`, body);
  }
}
