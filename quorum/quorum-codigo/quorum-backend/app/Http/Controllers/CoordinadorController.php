<?php

namespace App\Http\Controllers;

use App\Http\Requests\HistorialAsistenciaRequest;
use App\Models\FichaCaracterizacion;
use App\Models\Usuario;
use App\Services\AprendizService;
use App\Services\AsistenciaService;
use App\Services\CoordinadorService;
use App\Services\FichaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

// Panel coordinador: listados, matriz en solo lectura vía API, aprendices y estadísticas (Módulo 10)
class CoordinadorController extends Controller
{
    public function __construct(
        private readonly FichaService $fichaService,
        private readonly AsistenciaService $asistenciaService,
        private readonly AprendizService $aprendizService,
        private readonly CoordinadorService $coordinadorService
    ) {}

    /** Listado de fichas (por defecto solo activas); admin/coordinador ven todas. */
    public function fichas(Request $request): JsonResponse
    {
        if (! $request->has('activo')) {
            $request->merge(['activo' => 1]);
        }

        $perPage = min(50, max(5, (int) $request->input('per_page', 15)));
        $q       = $this->fichaService->fichasListadoQuery($request->user(), $request);

        if ($q === null) {
            $paginaVacia = FichaCaracterizacion::query()->whereRaw('1 = 0')->paginate(perPage: $perPage);

            return response()->json($paginaVacia);
        }

        return response()->json($q->paginate(perPage: $perPage));
    }

    /** Misma matriz que M8, con filtro opcional por jornada. */
    public function historialFicha(HistorialAsistenciaRequest $request, FichaCaracterizacion $ficha): JsonResponse
    {
        $this->authorize('view', $ficha);

        $validados = $request->validated();
        $tipos     = [];
        if (! empty($validados['tipo']) && is_array($validados['tipo'])) {
            $tipos = array_values(array_unique(array_filter($validados['tipo'])));
        }

        $jornadaId = isset($validados['jornada_ficha_id']) ? (int) $validados['jornada_ficha_id'] : null;

        $payload = $this->asistenciaService->historialMatriz(
            $ficha,
            isset($validados['desde']) ? (string) $validados['desde'] : null,
            isset($validados['hasta']) ? (string) $validados['hasta'] : null,
            $tipos,
            $jornadaId
        );

        return response()->json($payload);
    }

    /** Historial individual (misma forma que GET /api/mi-historial). Solo usuarios aprendiz activos. */
    public function historialAprendiz(Usuario $aprendiz): JsonResponse
    {
        if ($aprendiz->rol !== 'aprendiz' || ! (int) $aprendiz->activo) {
            return response()->json([
                'message' => 'No se encontró el aprendiz.',
            ], 404);
        }

        return response()->json($this->aprendizService->miHistorial((int) $aprendiz->id));
    }

    /** Búsqueda para autocompletar (mínimo 2 caracteres). */
    public function buscarAprendices(Request $request): JsonResponse
    {
        try {
            $data = $request->validate(
                ['q' => ['required', 'string', 'min:2', 'max:120']],
                [],
                ['q' => 'término de búsqueda']
            );
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Escribe al menos 2 caracteres para buscar.',
                'errors'  => $e->errors(),
            ], 422);
        }

        $lista = $this->coordinadorService->buscarAprendices((string) $data['q']);

        return response()->json(['data' => $lista]);
    }

    /** Tabla de estadísticas por ficha; filtro opcional por centro. */
    public function estadisticas(Request $request): JsonResponse
    {
        $centroId = null;
        if ($request->filled('centro_id')) {
            $centroId = (int) $request->input('centro_id');
        }

        $filas = $this->coordinadorService->estadisticasPorFicha($centroId);

        return response()->json(['data' => $filas]);
    }
}
