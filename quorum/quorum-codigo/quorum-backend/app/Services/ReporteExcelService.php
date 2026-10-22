<?php

namespace App\Services;

use App\Models\DiaFestivo;
use App\Models\FichaCaracterizacion;
use App\Models\FichaInstructor;
use App\Models\RegistroAsistencia;
use App\Models\Sesion;
use App\Models\Usuario;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\File;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Throwable;

// Genera el Excel CPIC desde plantilla (M11) — geometría alineada a plantilla institucional
class ReporteExcelService
{
    /** Debe coincidir con plantilla_asistencia.xlsx (columna causal deserción) */
    private const COL_CAUSAL = 'CG';

    /** Debe coincidir con plantilla_asistencia.xlsx (columna observaciones) */
    private const COL_OBS = 'CH';

    /** Debe coincidir con plantilla_asistencia.xlsx (columna total horas inasistencia) */
    private const COL_TOTAL = 'DD';

    /** Celda del centro en la plantilla (etiqueta + nombre; debe coincidir con plantilla_asistencia.xlsx) */
    private const CELDA_CENTRO = 'D6';

    /** Fila de cabeceras de fecha (d/m/Y); debe coincidir con plantilla_asistencia.xlsx */
    private const FILA_CABECERA_FECHAS = 9;

    /** Alto de fila en puntos (Excel) para cabeceras de fecha en vertical */
    private const ALTURA_FILA_CABECERA_FECHAS = 57.6;

    /** Ancho de columna (unidades Excel) para columnas de fechas / asistencia diaria */
    private const ANCHO_COLUMNA_FECHAS = 6.56;

    private const FILA_INICIO_APRENDICES = 10;

    /** Fila donde la plantilla tiene el bloque de firmas (con hasta 46 aprendices) */
    private const FILA_FIRMAS_PLANTILLA = 56;

    /** Filas de aprendiz reservadas en plantilla antes de insertar más */
    private const MAX_FILAS_APRENDIZ_PLANTILLA = 46;

    private function rutaPlantilla(): string
    {
        return storage_path('app/plantilla_asistencia.xlsx');
    }

    /**
     * Columnas de fechas: F…Z, AA…DF (igual que implementación de referencia CPIC).
     *
     * @return list<string>
     */
    private function getColumnasDisponibles(): array
    {
        $columnas = [];
        for ($i = ord('F'); $i <= ord('Z'); $i++) {
            $columnas[] = chr($i);
        }
        for ($i = ord('A'); $i <= ord('Z'); $i++) {
            for ($j = ord('A'); $j <= ord('Z'); $j++) {
                $col = chr($i).chr($j);
                if ($col >= 'AA' && $col <= 'DF') {
                    $columnas[] = $col;
                }
                if ($col === 'DF') {
                    break 2;
                }
            }
        }

        return $columnas;
    }

    /**
     * Días hábiles entre dos fechas: sin domingo ni festivos activos en BD.
     *
     * @return Collection<int, Carbon>
     */
    private function diasHabilesEnRango(string $desde, string $hasta): Collection
    {
        $festivos = DiaFestivo::query()
            ->where('activo', 1)
            ->whereBetween('fecha', [$desde, $hasta])
            ->pluck('fecha')
            ->map(fn ($f) => (string) $f)
            ->flip();

        $salida = collect();
        $cur = Carbon::parse($desde, 'America/Bogota')->startOfDay();
        $fin = Carbon::parse($hasta, 'America/Bogota')->startOfDay();

        while ($cur->lte($fin)) {
            $ymd = $cur->format('Y-m-d');
            if ((int) $cur->format('N') !== 7 && ! $festivos->has($ymd)) {
                $salida->push($cur->copy());
            }
            $cur->addDay();
        }

        return $salida;
    }

    /**
     * @return array{0: string, 1: string}
     */
    public function generarYGuardarTemporal(FichaCaracterizacion $ficha, string $desde, string $hasta): array
    {
        $rutaPlantilla = $this->rutaPlantilla();
        if (! File::isFile($rutaPlantilla)) {
            throw new \RuntimeException('No se encontró la plantilla de asistencia en el servidor.');
        }

        $ficha->load(['programa', 'centro']);

        $diasHabiles = $this->diasHabilesEnRango($desde, $hasta);
        if ($diasHabiles->isEmpty()) {
            throw ValidationException::withMessages([
                'periodo' => ['No hay días hábiles en el periodo seleccionado (domingos y festivos excluidos).'],
            ]);
        }

        $columnas = $this->getColumnasDisponibles();
        if ($diasHabiles->count() > count($columnas)) {
            throw ValidationException::withMessages([
                'periodo' => ['El periodo tiene más días hábiles que columnas disponibles en la plantilla (máximo '.count($columnas).' días).'],
            ]);
        }

        $aprendices = $this->listarAprendicesFicha($ficha->id);
        if ($aprendices->isEmpty()) {
            throw ValidationException::withMessages([
                'ficha' => ['No hay aprendices activos en esta ficha.'],
            ]);
        }

        // Una sesión cerrada por fecha (si hay varias el mismo día, la de menor id)
        $sesionesPorFecha = $this->sesionesCerradasPorFecha($ficha->id, $desde, $hasta);

        $sesionIds = $sesionesPorFecha->values()->pluck('id')->unique()->all();
        $registrosPorSesionYAprendiz = $sesionIds === []
            ? collect()
            : RegistroAsistencia::query()
                ->whereIn('sesion_id', $sesionIds)
                ->where('activo', 1)
                ->get()
                ->groupBy(fn (RegistroAsistencia $r) => $r->sesion_id.'_'.$r->aprendiz_id);

        $dataPrograma = (string) ($ficha->programa?->nombre ?? '');
        $dataInstructores = 'Instructor/Tutor: '.$this->cadenaInstructores($ficha->id);
        $dataFicha = 'N° de Ficha: '.(string) $ficha->numero_ficha;
        $nombreCentro = (string) ($ficha->centro?->nombre ?? '');
        $dataCentro = 'Centro de Formación: '.$nombreCentro;

        $desdeFmt = Carbon::parse($desde, 'America/Bogota')->format('d/m/Y');
        $hastaFmt = Carbon::parse($hasta, 'America/Bogota')->format('d/m/Y');
        $dataPeriodo = 'Periodo: '.$desdeFmt.' a '.$hastaFmt;

        // Por cada día hábil: columna + sesión + nombre instructor para pie
        $columnaPorIndice = [];
        $instructoresPorDia = [];
        foreach ($diasHabiles->values() as $i => $dia) {
            $ymd = $dia->format('Y-m-d');
            $columnaPorIndice[$i] = $columnas[$i];
            $sesion = $sesionesPorFecha->get($ymd);
            if ($sesion && $sesion->instructor) {
                $instructoresPorDia[$i] = trim($sesion->instructor->nombre.' '.$sesion->instructor->apellido);
            } else {
                $instructoresPorDia[$i] = '';
            }
        }

        // Matriz aprendiz × índice_día
        $estudiantes = [];
        foreach ($aprendices as $ap) {
            $celdas = [];
            $total = 0;
            foreach ($diasHabiles->values() as $i => $dia) {
                $ymd = $dia->format('Y-m-d');
                $sesion = $sesionesPorFecha->get($ymd);
                $horas = null;
                if ($sesion) {
                    $key = $sesion->id.'_'.$ap->id;
                    $reg = $registrosPorSesionYAprendiz->get($key)?->first();
                    $horas = $this->horasInasistenciaCelda($reg, $sesion);
                }
                $celdas[$i] = $horas;
                if ($horas > 0) {
                    $total += $horas;
                }
            }
            $estudiantes[] = [
                'nombre' => trim($ap->nombre.' '.$ap->apellido),
                'documento' => (string) $ap->documento,
                'por_dia' => $celdas,
                'total_horas_inasistencia' => $total,
            ];
        }

        try {
            $spreadsheet = IOFactory::load($rutaPlantilla);
        } catch (Throwable $e) {
            report($e);
            throw new \RuntimeException('No se pudo leer la plantilla Excel.');
        }

        // Quitar comentarios en todas las hojas (evita problemas al guardar)
        foreach ($spreadsheet->getAllSheets() as $hoja) {
            if (! $hoja instanceof Worksheet) {
                continue;
            }
            $comentarios = $hoja->getComments();
            foreach (array_keys($comentarios) as $direccion) {
                $hoja->removeComment($direccion);
            }
        }

        $worksheet = $spreadsheet->getActiveSheet();

        $worksheet->getCell('A4')->setValue('Programa de Formación: '.$dataPrograma);
        $worksheet->getCell('A5')->setValue($dataInstructores);
        $worksheet->getCell('A6')->setValue($dataFicha);
        $worksheet->getCell(self::CELDA_CENTRO)->setValue($dataCentro);
        $worksheet->getCell('F8')->setValue($dataPeriodo);

        $nAprendices = count($estudiantes);
        if ($nAprendices > self::MAX_FILAS_APRENDIZ_PLANTILLA) {
            $worksheet->insertNewRowBefore(self::FILA_FIRMAS_PLANTILLA, $nAprendices - self::MAX_FILAS_APRENDIZ_PLANTILLA);
        }

        $filaInicio = self::FILA_INICIO_APRENDICES;
        $filaFirmas = $filaInicio + max($nAprendices, self::MAX_FILAS_APRENDIZ_PLANTILLA);

        // Cabeceras de fechas
        foreach ($diasHabiles->values() as $i => $dia) {
            $col = $columnaPorIndice[$i];
            $celda = $col.self::FILA_CABECERA_FECHAS;
            $worksheet->getCell($celda)->setValue($dia->format('d/m/Y'));
            $this->aplicarEstiloFechaCabecera($worksheet, $celda);
        }
        $worksheet->getRowDimension(self::FILA_CABECERA_FECHAS)->setRowHeight(self::ALTURA_FILA_CABECERA_FECHAS);
        foreach ($columnaPorIndice as $col) {
            $worksheet->getColumnDimension($col)->setWidth(self::ANCHO_COLUMNA_FECHAS);
        }

        $totalesPorFila = [];

        foreach ($estudiantes as $idx => $aprendiz) {
            $fila = $filaInicio + $idx;
            $totalesPorFila[$fila] = $aprendiz['total_horas_inasistencia'];

            $worksheet->getCell('A'.$fila)->setValue($aprendiz['nombre']);
            $this->aplicarEstiloCeldaDatos($worksheet, 'A'.$fila, false);

            $worksheet->getCell('D'.$fila)->setValue($aprendiz['documento']);
            $this->aplicarEstiloCeldaDatos($worksheet, 'D'.$fila, false);

            foreach ($aprendiz['por_dia'] as $i => $horas) {
                $col = $columnaPorIndice[$i];
                $celda = $col.$fila;
                $worksheet->getCell($celda)->setValue($horas ?? '');
                $this->aplicarEstiloCeldaDatos($worksheet, $celda, true);
            }

            $worksheet->getCell(self::COL_CAUSAL.$fila)->setValue('');
            $this->aplicarEstiloCeldaDatos($worksheet, self::COL_CAUSAL.$fila, false);

            $worksheet->getCell(self::COL_OBS.$fila)->setValue('');
            $this->aplicarEstiloCeldaDatos($worksheet, self::COL_OBS.$fila, false);
        }

        // Firmas instructores (misma fila que plantilla tras lógica de huecos)
        foreach ($diasHabiles->values() as $i => $_dia) {
            $col = $columnaPorIndice[$i];
            $nombre = $instructoresPorDia[$i] ?? '';
            $celda = $col.$filaFirmas;
            $worksheet->getCell($celda)->setValue($nombre);
            $pie = $worksheet->getStyle($celda);
            $pie->getFont()
                ->setColor(new Color('FF000000'))
                ->setName('Arial')
                ->setSize(10);
            $pie->getFill()->setFillType(Fill::FILL_NONE);
            $pie->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                ->setVertical(Alignment::VERTICAL_CENTER)
                ->setWrapText(true)
                ->setTextRotation(90);
        }

        $filaUltimoAprendiz = $filaInicio + $nAprendices - 1;
        if ($filaFirmas > $filaUltimoAprendiz + 1) {
            $filasAEliminar = $filaFirmas - $filaUltimoAprendiz - 1;
            $worksheet->removeRow($filaUltimoAprendiz + 1, $filasAEliminar);
            $filaFirmas -= $filasAEliminar;
        }

        // Totales en DD (después de removeRow las filas de aprendiz no cambian)
        foreach ($totalesPorFila as $fila => $total) {
            $worksheet->getCell(self::COL_TOTAL.$fila)->setValue(max(0, $total));
            $this->aplicarEstiloCeldaDatos($worksheet, self::COL_TOTAL.$fila, false);
        }

        $dirTemp = storage_path('app/temp');
        File::ensureDirectoryExists($dirTemp);

        $ym = Carbon::now('America/Bogota')->format('Y-m');
        $nombreArchivo = 'reporte_'.$ficha->numero_ficha.'_'.$ym.'.xlsx';
        $rutaSalida = $dirTemp.DIRECTORY_SEPARATOR.$nombreArchivo;

        try {
            $writer = new Xlsx($spreadsheet);
            $writer->save($rutaSalida);
        } catch (Throwable $e) {
            report($e);
            if (File::exists($rutaSalida)) {
                File::delete($rutaSalida);
            }
            throw new \RuntimeException('No se pudo generar el archivo Excel.');
        }

        return [$rutaSalida, $nombreArchivo];
    }

    /** Estilo legible: negro, sin relleno (anula formatos rojos de la plantilla) */
    private function aplicarEstiloCeldaDatos(Worksheet $sheet, string $coord, bool $centrar): void
    {
        $estilo = $sheet->getStyle($coord);
        $estilo->getFont()
            ->setColor(new Color('FF000000'))
            ->setName('Arial')
            ->setSize(10);
        $estilo->getFill()->setFillType(Fill::FILL_NONE);
        if ($centrar) {
            $estilo->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        }
    }

    private function aplicarEstiloFechaCabecera(Worksheet $sheet, string $coord): void
    {
        $estilo = $sheet->getStyle($coord);
        $estilo->getFont()
            ->setColor(new Color('FF000000'))
            ->setName('Arial')
            ->setSize(10);
        $estilo->getFill()->setFillType(Fill::FILL_NONE);
        $estilo->getAlignment()
            ->setHorizontal(Alignment::HORIZONTAL_CENTER)
            ->setVertical(Alignment::VERTICAL_CENTER)
            ->setWrapText(true)
            ->setTextRotation(90);
    }

    /**
     * Sesiones cerradas en rango, indexadas por Y-m-d (primera por id si hay varias el mismo día).
     *
     * @return Collection<string, Sesion>
     */
    private function sesionesCerradasPorFecha(int $fichaId, string $desde, string $hasta): Collection
    {
        $lista = Sesion::query()
            ->where('ficha_id', $fichaId)
            ->where('estado', 'cerrada')
            ->whereBetween('fecha', [$desde, $hasta])
            ->with(['instructor:id,nombre,apellido'])
            ->orderBy('fecha')
            ->orderBy('id')
            ->get();

        $mapa = collect();
        foreach ($lista as $sesion) {
            $fechaStr = $sesion->fecha instanceof CarbonInterface
                ? $sesion->fecha->format('Y-m-d')
                : Carbon::parse((string) $sesion->fecha, 'America/Bogota')->format('Y-m-d');
            if (! $mapa->has($fechaStr)) {
                $mapa->put($fechaStr, $sesion);
            }
        }

        return $mapa;
    }

    private function listarAprendicesFicha(int $fichaId)
    {
        return Usuario::query()
            ->where('rol', 'aprendiz')
            ->where('ficha_id', $fichaId)
            ->where('activo', 1)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'apellido', 'documento']);
    }

    private function cadenaInstructores(int $fichaId): string
    {
        $filas = FichaInstructor::query()
            ->where('ficha_id', $fichaId)
            ->where('activo', 1)
            ->with(['usuario:id,nombre,apellido'])
            ->get();

        $clave = static fn (FichaInstructor $fi): string => strtolower(
            trim(($fi->usuario?->apellido ?? '').' '.($fi->usuario?->nombre ?? ''))
        );

        $gestores = $filas->where('es_gestor', 1)->sortBy($clave)->values();
        $otros = $filas->where('es_gestor', 0)->sortBy($clave)->values();
        $ordenados = $gestores->concat($otros);

        $nombres = [];
        foreach ($ordenados as $fi) {
            $u = $fi->usuario;
            if ($u) {
                $nombres[] = trim($u->nombre.' '.$u->apellido);
            }
        }

        return implode(', ', array_filter($nombres));
    }

    /** Horas de inasistencia por celda. Retorna null si no hay registro (celda vacía en Excel); 0 si asistió o tiene excusa. */
    private function horasInasistenciaCelda(?RegistroAsistencia $reg, Sesion $sesion): ?int
    {
        if ($reg === null) {
            return null;
        }

        return match ($reg->tipo) {
            'falla' => (int) $sesion->horas_programadas,
            'parcial' => max(0, (int) ($reg->horas_inasistencia ?? 0)),
            default => 0,
        };
    }
}
