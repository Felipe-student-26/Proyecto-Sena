<?php

namespace App\Http\Controllers;

use App\Http\Requests\AsignarInstructorFichaRequest;
use App\Http\Requests\ImportarAprendicesFichaRequest;
use App\Http\Requests\StoreAprendizFichaRequest;
use App\Http\Requests\StoreFichaRequest;
use App\Http\Requests\UpdateAprendizFichaRequest;
use App\Http\Requests\UpdateFichaRequest;
use App\Models\FichaCaracterizacion;
use App\Models\Usuario;
use App\Services\FichaService;
use Carbon\Carbon;
use App\Support\LogActivity;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

// CRUD de fichas de caracterización, instructores e importación de aprendices (Módulo 5)
class FichaController extends Controller
{
    public function __construct(
        private readonly FichaService $fichaService
    ) {}

    /** Listado con filtros y paginación */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', FichaCaracterizacion::class);

        $perPage = min(50, max(5, (int) $request->input('per_page', 15)));
        $q       = $this->fichaService->fichasListadoQuery($request->user(), $request);

        if ($q === null) {
            $paginaVacia = FichaCaracterizacion::query()->whereRaw('1 = 0')->paginate(perPage: $perPage);

            return response()->json($paginaVacia);
        }

        return response()->json($q->paginate(perPage: $perPage));
    }

    public function store(StoreFichaRequest $request): JsonResponse
    {
        $this->authorize('create', FichaCaracterizacion::class);

        try {
            $ficha = $this->fichaService->crearFicha(
                $request->only([
                    'numero_ficha', 'estado', 'modalidad', 'centro_formacion_id', 'programa_formacion_id',
                    'fecha_inicio', 'fecha_fin',
                ]),
                $request->input('instructores', []),
                $request->input('jornadas', [])
            );
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'No se pudo validar los horarios.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (QueryException $e) {
            return $this->respuestaErrorBd($e);
        }

        LogActivity::registrar(
            'crear_ficha',
            'Ficha '.$ficha->numero_ficha.' (id '.$ficha->id.')'
        );

        return response()->json([
            'message' => 'Ficha de caracterización creada correctamente.',
            'id'      => $ficha->id,
            'data'    => $this->serializarFicha($ficha->load(['centro.regional', 'programa'])),
        ], 201);
    }

    public function show(Request $request, FichaCaracterizacion $ficha): JsonResponse
    {
        $this->authorize('view', $ficha);

        $ficha->load([
            'centro.regional',
            'programa',
            'jornadas'          => fn ($q) => $q->where('activo', 1),
            'jornadas.horarios' => fn ($q) => $q->where('activo', 1)->with('instructor:id,nombre,apellido,correo'),
            'fichaInstructores' => fn ($q) => $q->where('activo', 1)->with('usuario:id,nombre,apellido,correo,rol'),
        ]);

        $aprendices = Usuario::query()
            ->where('ficha_id', $ficha->id)
            ->where('rol', 'aprendiz')
            ->where('activo', 1)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'apellido', 'documento', 'correo']);

        return response()->json([
            'data' => $this->serializarFichaDetalle($ficha, $aprendices),
        ]);
    }

    public function update(UpdateFichaRequest $request, FichaCaracterizacion $ficha): JsonResponse
    {
        $this->authorize('update', $ficha);

        try {
            $resultado = $this->fichaService->actualizarFicha(
                $ficha,
                $request->only([
                    'numero_ficha', 'estado', 'modalidad', 'centro_formacion_id', 'programa_formacion_id',
                    'fecha_inicio', 'fecha_fin',
                ]),
                $request->input('instructores', []),
                $request->input('jornadas', [])
            );
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'No se pudo validar los horarios.',
                'errors'  => $e->errors(),
            ], 422);
        } catch (QueryException $e) {
            return $this->respuestaErrorBd($e);
        }

        $ficha        = $resultado['ficha'];
        $advertencias = $resultado['advertencias'];

        LogActivity::registrar(
            'actualizar_ficha',
            'Ficha '.$ficha->numero_ficha.' (id '.$ficha->id.')'
        );

        return response()->json([
            'message'      => 'Ficha de caracterización actualizada correctamente.',
            'data'         => $this->serializarFicha($ficha->load(['centro.regional', 'programa'])),
            'advertencias' => $advertencias,
        ]);
    }

    public function destroy(Request $request, FichaCaracterizacion $ficha): JsonResponse
    {
        $this->authorize('delete', $ficha);

        $this->fichaService->desactivarFicha($ficha);

        LogActivity::registrar(
            'desactivar_ficha',
            'Ficha '.$ficha->numero_ficha.' (id '.$ficha->id.')'
        );

        return response()->json([
            'message' => 'La ficha de caracterización fue desactivada.',
        ]);
    }

    public function reactivar(FichaCaracterizacion $ficha): JsonResponse
    {
        $this->authorize('reactivate', $ficha);

        $this->fichaService->reactivarFicha($ficha);

        LogActivity::registrar(
            'reactivar_ficha',
            'Ficha '.$ficha->numero_ficha.' (id '.$ficha->id.')'
        );

        return response()->json([
            'message' => 'La ficha de caracterización fue reactivada.',
            'data'    => $this->serializarFicha($ficha->fresh()->load(['centro.regional', 'programa'])),
        ]);
    }

    public function storeAprendiz(StoreAprendizFichaRequest $request, FichaCaracterizacion $ficha): JsonResponse
    {
        try {
            $aprendiz = $this->fichaService->crearAprendizEnFicha($ficha, $request->validated());
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'No se pudo registrar el aprendiz.',
                'errors'  => $e->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Aprendiz registrado correctamente.',
            'data'    => [
                'id'        => $aprendiz->id,
                'nombre'    => $aprendiz->nombre,
                'apellido'  => $aprendiz->apellido,
                'documento' => $aprendiz->documento,
                'correo'    => $aprendiz->correo,
            ],
        ], 201);
    }

    public function updateAprendiz(UpdateAprendizFichaRequest $request, FichaCaracterizacion $ficha, Usuario $usuario): JsonResponse
    {
        try {
            $aprendiz = $this->fichaService->actualizarAprendizEnFicha($ficha, $usuario, $request->validated());
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'No se pudo actualizar el aprendiz.',
                'errors'  => $e->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'Aprendiz actualizado correctamente.',
            'data'    => [
                'id'        => $aprendiz->id,
                'nombre'    => $aprendiz->nombre,
                'apellido'  => $aprendiz->apellido,
                'documento' => $aprendiz->documento,
                'correo'    => $aprendiz->correo,
            ],
        ]);
    }

    public function destroyAprendiz(FichaCaracterizacion $ficha, Usuario $usuario): JsonResponse
    {
        $this->authorize('eliminarAprendiz', [$ficha, $usuario]);

        try {
            $this->fichaService->eliminarAprendizDeFicha($ficha, $usuario);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'No se pudo eliminar el aprendiz.',
                'errors'  => $e->errors(),
            ], 422);
        }

        return response()->json([
            'message' => 'El aprendiz fue dado de baja y desvinculado de la ficha.',
        ]);
    }

    public function asignarInstructor(AsignarInstructorFichaRequest $request, FichaCaracterizacion $ficha): JsonResponse
    {
        $this->authorize('asignarInstructores', $ficha);

        try {
            $this->fichaService->aplicarAccionInstructor(
                $ficha,
                (int) $request->input('usuario_id'),
                $request->input('accion'),
                (bool) $request->boolean('es_gestor')
            );
        } catch (QueryException $e) {
            return $this->respuestaErrorBd($e);
        }

        LogActivity::registrar(
            'asignar_instructor_ficha',
            'Ficha id '.$ficha->id.' — acción '.$request->input('accion')
        );

        $ficha->load([
            'fichaInstructores' => fn ($q) => $q->where('activo', 1)->with('usuario:id,nombre,apellido,correo,rol'),
        ]);

        return response()->json([
            'message' => 'Asignación de instructores actualizada.',
            'data'    => [
                'instructores' => $ficha->fichaInstructores->map(fn ($p) => [
                    'usuario_id' => $p->usuario_id,
                    'es_gestor'  => (bool) $p->es_gestor,
                    'usuario'    => $p->usuario,
                ]),
            ],
        ]);
    }

    public function importarAprendices(ImportarAprendicesFichaRequest $request, FichaCaracterizacion $ficha): JsonResponse
    {
        $this->authorize('importarAprendices', $ficha);

        try {
            $archivo = $request->file('archivo');
            $resumen = $this->fichaService->importarAprendicesDesdeExcel(
                $ficha,
                $archivo,
                (int) $request->user()->id
            );
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'No se pudo importar.',
                'errors'  => $e->errors(),
            ], 422);
        }

        LogActivity::registrar(
            'importar_aprendices',
            'Ficha id '.$ficha->id.' — '.$ficha->numero_ficha
        );

        return response()->json([
            'message' => 'Importación finalizada.',
            ...$resumen,
        ]);
    }

    /** Instructores y gestores activos del sistema (para selects del formulario) */
    public function instructoresDisponibles(Request $request): JsonResponse
    {
        if ($request->user()->rol !== 'admin') {
            return response()->json(['message' => 'No autorizado.'], 403);
        }

        $lista = Usuario::query()
            ->where('activo', 1)
            ->whereIn('rol', ['instructor', 'gestor_grupo'])
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'apellido', 'correo', 'rol']);

        return response()->json(['data' => $lista]);
    }

    private function serializarFicha(FichaCaracterizacion $ficha): array
    {
        $centro = $ficha->centro;

        return [
            'id'                     => $ficha->id,
            'numero_ficha'           => $ficha->numero_ficha,
            'estado'                 => $ficha->estado,
            'modalidad'              => $ficha->modalidad ?? 'presencial',
            'centro_formacion_id'    => $ficha->centro_formacion_id,
            'programa_formacion_id'  => $ficha->programa_formacion_id,
            // Y-m-d estable para el front (input type="date", comparaciones)
            'fecha_inicio'           => $ficha->fecha_inicio !== null && $ficha->fecha_inicio !== ''
                ? Carbon::parse($ficha->fecha_inicio)->timezone('America/Bogota')->toDateString()
                : $ficha->fecha_inicio,
            'fecha_fin'              => $ficha->fecha_fin !== null && $ficha->fecha_fin !== ''
                ? Carbon::parse($ficha->fecha_fin)->timezone('America/Bogota')->toDateString()
                : $ficha->fecha_fin,
            'activo'                 => (int) $ficha->activo,
            'centro'                 => $centro,
            'regional'               => $centro?->regional,
            'programa'               => $ficha->programa,
        ];
    }

    /** @param  \Illuminate\Support\Collection<int, Usuario>  $aprendices */
    private function serializarFichaDetalle(FichaCaracterizacion $ficha, $aprendices): array
    {
        $base = $this->serializarFicha($ficha);

        $jornadas = $ficha->jornadas->map(fn ($j) => [
            'id'       => $j->id,
            'tipo'     => $j->tipo,
            'activo'   => (int) $j->activo,
            'horarios' => $j->horarios->map(fn ($h) => [
                'id'                  => $h->id,
                'dia_semana'          => $h->dia_semana,
                'hora_inicio'         => substr((string) $h->hora_inicio, 0, 5),
                'hora_fin'            => substr((string) $h->hora_fin, 0, 5),
                'horas_programadas'   => (int) $h->horas_programadas,
                'instructor_id'       => $h->instructor_id,
                'instructor'          => $h->instructor,
            ]),
        ]);

        $instructores = $ficha->fichaInstructores->map(fn ($p) => [
            'usuario_id' => $p->usuario_id,
            'es_gestor'  => (bool) $p->es_gestor,
            'usuario'    => $p->usuario,
        ]);

        return array_merge($base, [
            'jornadas'     => $jornadas,
            'instructores' => $instructores,
            'aprendices'   => $aprendices,
        ]);
    }

    private function respuestaErrorBd(QueryException $e): JsonResponse
    {
        if (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), '1062')) {
            return response()->json([
                'message' => 'Ya existe un registro con esos datos (duplicado en base de datos).',
            ], 422);
        }

        report($e);

        return response()->json([
            'message' => 'No se pudo guardar la información. Inténtalo de nuevo.',
        ], 500);
    }
}
