<?php

namespace App\Http\Controllers;

use App\Http\Requests\DescargarReporteExcelRequest;
use App\Models\FichaCaracterizacion;
use App\Services\ReporteExcelService;
use App\Support\LogActivity;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

// Descarga del reporte Excel CPIC por ficha (Módulo 11)
class ReporteController extends Controller
{
    public function __construct(
        private readonly ReporteExcelService $reporteExcelService
    ) {}

    /**
     * GET /api/reportes/excel/{ficha}?desde=Y-m-d&hasta=Y-m-d
     */
    public function descargarExcel(DescargarReporteExcelRequest $request, FichaCaracterizacion $ficha): BinaryFileResponse|JsonResponse
    {
        $this->authorize('view', $ficha);

        $validados = $request->validated();
        $desde = (string) $validados['desde'];
        $hasta = (string) $validados['hasta'];

        try {
            [$rutaAbsoluta, $nombreArchivo] = $this->reporteExcelService->generarYGuardarTemporal($ficha, $desde, $hasta);
        } catch (\RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }

        LogActivity::registrar(
            'descargar_reporte_excel',
            'Ficha '.$ficha->numero_ficha.' — '.$desde.' a '.$hasta
        );

        return response()->download($rutaAbsoluta, $nombreArchivo, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ])->deleteFileAfterSend(true);
    }
}
