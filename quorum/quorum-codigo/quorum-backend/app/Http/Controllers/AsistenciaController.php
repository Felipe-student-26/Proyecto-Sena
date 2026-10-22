<?php

namespace App\Http\Controllers;

use App\Http\Requests\ActualizarRegistroAsistenciaRequest;
use App\Http\Requests\GuardarAsistenciaRequest;
use App\Http\Requests\HistorialAsistenciaRequest;
use App\Http\Requests\IniciarSesionAsistenciaRequest;
use App\Http\Requests\ListarEvidenciasRequest;
use App\Models\FichaCaracterizacion;
use App\Models\RegistroAsistencia;
use App\Models\Sesion;
use App\Services\AsistenciaService;
use App\Support\LogActivity;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

// API tomar asistencia (Módulo 7) e historial matriz (Módulo 8)
class AsistenciaController extends Controller
{
    public function __construct(
        private readonly AsistenciaService $asistenciaService
    ) {}

    /** Matriz de historial por ficha (filtros opcionales en query) */
    public function historial(HistorialAsistenciaRequest $request, FichaCaracterizacion $ficha): JsonResponse
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

    /** Abre o devuelve sesión abierta + lista de aprendices */
    public function iniciarSesion(IniciarSesionAsistenciaRequest $request): JsonResponse
    {
        $usuario = $request->user();
        $fichaId = (int) $request->input('ficha_id');
        $fecha   = $request->input('fecha');
        $horarioId = $request->filled('horario_id') ? (int) $request->input('horario_id') : null;

        $ficha = FichaCaracterizacion::query()->findOrFail($fichaId);
        $this->authorize('view', $ficha);

        try {
            $payload = $this->asistenciaService->iniciarSesion($usuario, $fichaId, $fecha, $horarioId);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'No se pudo iniciar la sesión.',
                'errors'  => $e->errors(),
            ], 422);
        }

        return response()->json($payload);
    }

    /** Guarda todos los registros y cierra la sesión */
    public function guardar(GuardarAsistenciaRequest $request, Sesion $sesion): JsonResponse
    {
        $this->authorize('guardarAsistencia', $sesion);

        /** @var array<int|string, \Illuminate\Http\UploadedFile|null> $evidencias */
        $evidencias = $request->file('evidencias', []);
        if (! is_array($evidencias)) {
            $evidencias = [];
        }

        try {
            $this->asistenciaService->guardarSesionCompleta(
                $request->user(),
                $sesion,
                $request->input('registros', []),
                $evidencias
            );
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'No se pudo guardar la asistencia.',
                'errors'  => $e->errors(),
            ], 422);
        }

        $sesion->refresh();
        LogActivity::registrar(
            'guardar_asistencia',
            'Sesión id '.$sesion->id.' — ficha '.$sesion->ficha_id.' — fecha '.$sesion->fecha
        );

        return response()->json([
            'message' => 'Asistencia guardada correctamente.',
        ]);
    }

    /** Listado de excusas con evidencia adjunta (panel de gestión). */
    public function listarEvidencias(ListarEvidenciasRequest $request): JsonResponse
    {
        $this->authorize('listarEvidencias', RegistroAsistencia::class);

        $usuario   = $request->user();
        $validados = $request->validated();

        $query = RegistroAsistencia::query()
            ->activos()
            ->where('tipo', 'excusa')
            ->whereNotNull('excusa_evidencia_path')
            ->where('excusa_evidencia_path', '!=', '')
            ->with([
                'aprendiz:id,nombre,apellido,documento',
                'sesion:id,ficha_id,fecha,instructor_id',
                'sesion.ficha:id,numero_ficha,programa_formacion_id',
                'sesion.ficha.programa:id,nombre',
            ]);

        if (in_array($usuario->rol, ['instructor', 'gestor_grupo'], true)) {
            $query->whereHas('sesion', fn ($q) => $q->where('instructor_id', $usuario->id));
        }

        if (! empty($validados['ficha_id'])) {
            $fichaId = (int) $validados['ficha_id'];
            $query->whereHas('sesion', fn ($q) => $q->where('ficha_id', $fichaId));
        }

        if (! empty($validados['aprendiz_id'])) {
            $query->where('aprendiz_id', (int) $validados['aprendiz_id']);
        }

        if (! empty($validados['fecha_desde'])) {
            $desde = (string) $validados['fecha_desde'];
            $query->whereHas('sesion', fn ($q) => $q->where('fecha', '>=', $desde));
        }

        if (! empty($validados['fecha_hasta'])) {
            $hasta = (string) $validados['fecha_hasta'];
            $query->whereHas('sesion', fn ($q) => $q->where('fecha', '<=', $hasta));
        }

        $registros = $query
            ->join('sesiones', 'registros_asistencia.sesion_id', '=', 'sesiones.id')
            ->orderByDesc('sesiones.fecha')
            ->orderByDesc('registros_asistencia.id')
            ->select('registros_asistencia.*')
            ->get();

        $data = $registros->map(function (RegistroAsistencia $registro) {
            $aprendiz = $registro->aprendiz;
            $sesion   = $registro->sesion;
            $ficha    = $sesion?->ficha;

            return [
                'id'                                => $registro->id,
                'excusa_motivo'                     => $registro->excusa_motivo,
                'excusa_evidencia_nombre_original'  => $registro->excusa_evidencia_nombre_original,
                'aprendiz' => [
                    'id'        => $aprendiz?->id,
                    'nombre'    => $aprendiz?->nombre,
                    'apellido'  => $aprendiz?->apellido,
                    'documento' => $aprendiz?->documento,
                ],
                'sesion' => [
                    'id'    => $sesion?->id,
                    'fecha' => $sesion?->fecha,
                ],
                'ficha' => [
                    'id'              => $ficha?->id,
                    'numero_ficha'    => $ficha?->numero_ficha,
                    'nombre_programa' => $ficha?->programa?->nombre,
                ],
            ];
        })->values();

        return response()->json(['data' => $data]);
    }

    /** Descarga la evidencia adjunta a una excusa (coordinador o instructor de la sesión). */
    public function descargarExcusaEvidencia(RegistroAsistencia $registro): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $this->authorize('viewExcusaEvidencia', $registro);

        $path = $registro->excusa_evidencia_path;
        if ($path === null || $path === '' || ! Storage::disk('local')->exists($path)) {
            abort(404, 'No hay evidencia adjunta.');
        }

        $nombre = $registro->excusa_evidencia_nombre_original ?: basename($path);

        return Storage::disk('local')->response($path, $nombre);
    }

    /** Corrige un registro (sesión ya cerrada) */
    public function actualizar(ActualizarRegistroAsistenciaRequest $request, RegistroAsistencia $registro): JsonResponse
    {
        $this->authorize('update', $registro);

        try {
            $this->asistenciaService->actualizarRegistro(
                $request->user(),
                $registro,
                $request->only(['tipo', 'horas_inasistencia', 'razon', 'excusa_motivo']),
                $request->file('evidencia')
            );
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage() ?: 'No se pudo actualizar el registro.',
                'errors'  => $e->errors(),
            ], 422);
        }

        LogActivity::registrar(
            'corregir_asistencia',
            'Registro id '.$registro->id.' — aprendiz '.$registro->aprendiz_id
        );

        return response()->json([
            'message' => 'Registro actualizado correctamente.',
        ]);
    }
}
