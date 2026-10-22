"use client";

// Tabla reutilizable con paginación y scroll horizontal (Módulo 5)

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface ColumnaDataTable<T> {
  clave: string;
  etiqueta: string;
  /** Ancho mínimo opcional para columnas anchas */
  anchoMinimo?: string;
  render?: (fila: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columnas: ColumnaDataTable<T>[];
  datos: T[];
  /** Identificador estable por fila */
  getClaveFila: (fila: T) => string | number;
  paginacion?: {
    paginaActual: number;
    totalPaginas: number;
    total: number;
    alCambiarPagina: (pagina: number) => void;
  };
  vacioTexto?: string;
}

export default function DataTable<T>({
  columnas,
  datos,
  getClaveFila,
  paginacion,
  vacioTexto = "No hay registros para mostrar.",
}: DataTableProps<T>) {
  return (
    <div className="min-w-0 space-y-3">
      <div className="overflow-x-auto rounded-xl border border-borderSubtle bg-surface shadow-sm">
        <table className="min-w-full text-left text-sm text-foreground">
          <thead className="border-b border-borderSubtle bg-surfaceMuted">
            <tr>
              {columnas.map((col) => (
                <th
                  key={col.clave}
                  scope="col"
                  className="px-4 py-3 font-semibold whitespace-nowrap"
                  style={
                    col.anchoMinimo
                      ? { minWidth: col.anchoMinimo }
                      : undefined
                  }
                >
                  {col.etiqueta}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {datos.length === 0 ? (
              <tr>
                <td
                  colSpan={columnas.length}
                  className="px-4 py-8 text-center text-muted"
                >
                  {vacioTexto}
                </td>
              </tr>
            ) : (
              datos.map((fila) => (
                <tr
                  key={String(getClaveFila(fila))}
                  className="border-b border-borderSubtle/60 last:border-0 hover:bg-surfaceMuted/70 dark:border-borderSubtle/40"
                >
                  {columnas.map((col) => (
                    <td
                      key={col.clave}
                      className="px-4 py-3 align-middle whitespace-nowrap"
                      style={
                        col.anchoMinimo
                          ? { minWidth: col.anchoMinimo }
                          : undefined
                      }
                    >
                      {col.render
                        ? col.render(fila)
                        : String(
                            (fila as Record<string, unknown>)[col.clave] ?? ""
                          )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {paginacion && paginacion.totalPaginas > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
          <p>
            Mostrando página {paginacion.paginaActual} de{" "}
            {paginacion.totalPaginas} ({paginacion.total} registros)
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-borderSubtle px-3 py-1.5 text-foreground transition-colors hover:bg-surfaceMuted disabled:opacity-40"
              disabled={paginacion.paginaActual <= 1}
              onClick={() =>
                paginacion.alCambiarPagina(paginacion.paginaActual - 1)
              }
            >
              <ChevronLeft size={18} aria-hidden />
              Anterior
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg border border-borderSubtle px-3 py-1.5 text-foreground transition-colors hover:bg-surfaceMuted disabled:opacity-40"
              disabled={
                paginacion.paginaActual >= paginacion.totalPaginas
              }
              onClick={() =>
                paginacion.alCambiarPagina(paginacion.paginaActual + 1)
              }
            >
              Siguiente
              <ChevronRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
