<?php

namespace App\Services;

use App\Models\DiaFestivo;
use App\Models\FichaCaracterizacion;
use App\Models\Horario;
use App\Models\RegistroAsistencia;
use App\Models\RegistroAsistenciaBackup;
use App\Models\Sesion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

// Lógica de negocio para tomar y corregir asistencia (Módulo 7)
class AsistenciaService
{
    /** Convierte la fecha (Y-m-d) en el slug de día que usa la tabla horarios (lunes…sábado). Domingo lanza error. */
    public function slugDiaSemanaDesdeFecha(string $fechaYmd): string
    {
        $d = Carbon::parse($fechaYmd, 'America/Bogota');
        $n = (int) $d->format('N'); // 1=lunes … 7=domingo (ISO)

        if ($n === 7) {
            throw ValidationException::withMessages([
                'fecha' => ['No se toma asistencia los domingos.'],
            ]);
        }

        $map = [
            1 => 'lunes',
            2 => 'martes',
            3 => 'miercoles',
            4 => 'jueves',
            5 => 'viernes',
            6 => 'sabado',
        ];

        return $map[$n];
    }

    /** Comprueba festivo activo; si existe, lanza validación con la descripción. */
    public function asegurarNoFestivo(string $fechaYmd): void
    {
        $festivo = DiaFestivo::query()
            ->where('fecha', $fechaYmd)
            ->where('activo', 1)
            ->first();

        if ($festivo) {
            throw ValidationException::withMessages([
                'fecha' => ["No hay formación ni asistencia en festivo: {$festivo->descripcion}."],
            ]);
        }
    }

    /** El instructor o gestor está asignado a la ficha (pivot activo). */
    public function estaAsignadoAFicha(Usuario $usuario, int $fichaId): bool
    {
        return DB::table('ficha_instructor')
            ->where('ficha_id', $fichaId)
            ->where('usuario_id', $usuario->id)
            ->where('activo', 1)
            ->exists();
    }

    /**
     * Horarios del usuario para esa ficha y ese día de la semana.
     *
     * @return \Illuminate\Database\Eloquent\Collection<int, Horario>
     */
    public function buscarHorariosDelDia(Usuario $usuario, int $fichaId, string $slugDia)
    {
        return Horario::query()
            ->where('ficha_id', $fichaId)
            ->where('instructor_id', $usuario->id)
            ->where('activo', 1)
            ->where('dia_semana', $slugDia)
            ->with(['jornada:id,tipo'])
            ->get();
    }

    /** Etiqueta legible para elegir entre varios horarios el mismo día. */
    public function etiquetaHorario(Horario $h): string
    {
        $tipo = $h->jornada?->tipo ?? 'jornada';
        $ini = (string) $h->hora_inicio;
        $fin = (string) $h->hora_fin;

        return ucfirst((string) $tipo)." {$ini}–{$fin}";
    }

    /** Nombre del día en español a partir del slug de `horarios.dia_semana`. */
    private function etiquetaDiaSemanaSlug(string $slug): string
    {
        $map = [
            'lunes' => 'lunes',
            'martes' => 'martes',
            'miercoles' => 'miércoles',
            'jueves' => 'jueves',
            'viernes' => 'viernes',
            'sabado' => 'sábado',
        ];

        return $map[$slug] ?? $slug;
    }

    /** Días de la semana (slugs) en los que el instructor tiene al menos un horario activo en la ficha. */
    private function slugsDiasConHorarioEnFicha(int $usuarioId, int $fichaId): array
    {
        $slugs = Horario::query()
            ->where('ficha_id', $fichaId)
            ->where('instructor_id', $usuarioId)
            ->where('activo', 1)
            ->distinct()
            ->pluck('dia_semana')
            ->unique()
            ->values()
            ->all();
        $orden = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        usort($slugs, fn ($a, $b) => (array_search($a, $orden, true) ?: 99) <=> (array_search($b, $orden, true) ?: 99));

        return $slugs;
    }

    /**
     * Resuelve el horario: uno solo, o el indicado, o error con candidatos.
     */
    public function resolverHorarioParaIniciar(
        Usuario $usuario,
        int $fichaId,
        string $fechaYmd,
        ?int $horarioIdSolicitado,
        string $slugDia
    ): Horario {
        $candidatos = $this->buscarHorariosDelDia($usuario, $fichaId, $slugDia);

        if ($candidatos->isEmpty()) {
            $dias = $this->slugsDiasConHorarioEnFicha((int) $usuario->id, $fichaId);
            $diaPedido = $this->etiquetaDiaSemanaSlug($slugDia);
            if ($dias === []) {
                $msg = 'No tienes días con horario asignado en esta ficha. Pide al administrador que registre tu horario en la ficha.';
            } else {
                $lista = implode(', ', array_map(fn (string $s) => $this->etiquetaDiaSemanaSlug($s), $dias));
                $msg = "No tienes formación programada el {$diaPedido} en esta ficha. Días en los que sí tienes horario: {$lista}.";
            }
            throw ValidationException::withMessages([
                'fecha' => [$msg],
            ]);
        }

        if ($horarioIdSolicitado !== null) {
            $horario = $candidatos->firstWhere('id', $horarioIdSolicitado);
            if (! $horario) {
                throw ValidationException::withMessages([
                    'horario_id' => ['El horario elegido no corresponde a tu asignación este día en esta ficha.'],
                ]);
            }

            return $horario;
        }

        if ($candidatos->count() > 1) {
            $lista = $candidatos->map(fn (Horario $h) => [
                'id'       => $h->id,
                'etiqueta' => $this->etiquetaHorario($h),
            ])->values()->all();

            throw new HttpResponseException(response()->json([
                'message'               => 'Hay más de un horario este día. Elige uno en la lista e inténtalo de nuevo.',
                'codigo'                => 'multiples_horarios',
                'horarios_candidatos'   => $lista,
            ], 422));
        }

        return $candidatos->first();
    }

    /**
     * @return array<int, int> IDs de aprendices activos de la ficha
     */
    public function idsAprendicesEsperados(int $fichaId): array
    {
        return Usuario::query()
            ->where('rol', 'aprendiz')
            ->where('ficha_id', $fichaId)
            ->where('activo', 1)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->pluck('id')
            ->all();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, Usuario>
     */
    public function listarAprendicesFicha(int $fichaId)
    {
        return Usuario::query()
            ->where('rol', 'aprendiz')
            ->where('ficha_id', $fichaId)
            ->where('activo', 1)
            ->orderBy('apellido')
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'apellido', 'documento', 'avatar_color']);
    }

    /**
     * Matriz de historial: aprendices, sesiones en rango y registros activos (Módulo 8).
     *
     * @param  list<string>  $tiposFiltro  Si no está vacío, solo sesiones con al menos un registro de esos tipos.
     * @param  int|null  $jornadaFichaId  Si se indica, solo sesiones cuyo horario pertenece a esa jornada.
     * @return array{aprendices: list<array<string, mixed>>, sesiones: list<array<string, mixed>>, registros: list<array<string, mixed>>}
     */
    public function historialMatriz(
        FichaCaracterizacion $ficha,
        ?string $desde,
        ?string $hasta,
        array $tiposFiltro,
        ?int $jornadaFichaId = null
    ): array {
        $aprendices = $this->listarAprendicesFicha($ficha->id);
        $aprendicesJson = $aprendices->map(fn (Usuario $u) => [
            'id'            => $u->id,
            'nombre'        => $u->nombre,
            'apellido'      => $u->apellido,
            'documento'     => $u->documento,
            'avatar_color'  => $u->avatar_color,
        ])->values()->all();

        $q = Sesion::query()
            ->where('ficha_id', $ficha->id)
            ->with(['instructor:id,nombre,apellido'])
            ->orderBy('fecha')
            ->orderBy('id');

        if ($jornadaFichaId !== null) {
            $q->whereHas('horario', function ($h) use ($jornadaFichaId): void {
                $h->where('jornada_ficha_id', $jornadaFichaId);
            });
        }

        if ($desde !== null && $desde !== '') {
            $q->where('fecha', '>=', $desde);
        }
        if ($hasta !== null && $hasta !== '') {
            $q->where('fecha', '<=', $hasta);
        }

        if ($tiposFiltro !== []) {
            $q->whereHas('registros', function ($r) use ($tiposFiltro): void {
                $r->where('activo', 1)->whereIn('tipo', $tiposFiltro);
            });
        }

        $sesiones = $q->get();
        $sesionIds = $sesiones->pluck('id')->all();

        $registrosCol = $sesionIds === []
            ? collect()
            : RegistroAsistencia::query()
                ->whereIn('sesion_id', $sesionIds)
                ->where('activo', 1)
                ->get([
                    'id',
                    'sesion_id',
                    'aprendiz_id',
                    'tipo',
                    'horas_inasistencia',
                    'excusa_motivo',
                    'excusa_evidencia_path',
                    'excusa_evidencia_nombre_original',
                ]);

        $sesionesJson = $sesiones->map(function (Sesion $s) {
            $inst = $s->instructor;
            $nomCompleto = $inst ? trim($inst->nombre.' '.$inst->apellido) : '—';
            $fecha = $s->fecha;
            $fechaStr = $fecha instanceof \Carbon\CarbonInterface
                ? $fecha->format('Y-m-d')
                : (string) $fecha;

            return [
                'id'                         => $s->id,
                'fecha'                      => $fechaStr,
                'estado'                     => $s->estado,
                'horas_programadas'          => (int) $s->horas_programadas,
                'instructor_id'              => (int) $s->instructor_id,
                'instructor_nombre_completo' => $nomCompleto !== '' ? $nomCompleto : '—',
                'instructor_nombre_corto'    => $this->nombreCortoInstructor($inst),
            ];
        })->values()->all();

        $registrosJson = $registrosCol->map(fn (RegistroAsistencia $r) => [
            'id'                               => $r->id,
            'sesion_id'                        => $r->sesion_id,
            'aprendiz_id'                      => $r->aprendiz_id,
            'tipo'                             => $r->tipo,
            'horas_inasistencia'               => $r->horas_inasistencia !== null ? (int) $r->horas_inasistencia : null,
            'excusa_motivo'                    => $r->tipo === 'excusa' ? $r->excusa_motivo : null,
            'excusa_tiene_evidencia'           => $r->tipo === 'excusa'
                && $r->excusa_evidencia_path !== null && $r->excusa_evidencia_path !== '',
            'excusa_evidencia_nombre_original' => $r->tipo === 'excusa' ? $r->excusa_evidencia_nombre_original : null,
        ])->values()->all();

        return [
            'aprendices' => $aprendicesJson,
            'sesiones'   => $sesionesJson,
            'registros'  => $registrosJson,
        ];
    }

    /** Iniciales para encabezado de columna (misma idea que el Avatar del front). */
    private function nombreCortoInstructor(?Usuario $inst): string
    {
        if (! $inst) {
            return '—';
        }
        $n = trim((string) $inst->nombre);
        $a = trim((string) $inst->apellido);
        if ($n === '' && $a === '') {
            return '—';
        }
        if ($a === '') {
            return mb_strtoupper(mb_substr($n, 0, 2));
        }

        return mb_strtoupper(mb_substr($n, 0, 1).mb_substr($a, 0, 1));
    }

    /**
     * Crea o reutiliza sesión abierta y devuelve payload para el front.
     *
     * @return array{sesion: array, aprendices: array<int, array>, fecha_servidor: string}
     */
    public function iniciarSesion(Usuario $usuario, int $fichaId, string $fechaYmd, ?int $horarioId): array
    {
        if (! in_array($usuario->rol, ['instructor', 'gestor_grupo'], true)) {
            abort(403, 'Solo instructores o gestores pueden tomar asistencia.');
        }

        $ficha = FichaCaracterizacion::query()->find($fichaId);
        if (! $ficha || ! (int) $ficha->activo) {
            throw ValidationException::withMessages([
                'ficha_id' => ['La ficha no existe o está inactiva.'],
            ]);
        }

        if (! $this->estaAsignadoAFicha($usuario, $fichaId)) {
            throw ValidationException::withMessages([
                'ficha_id' => ['No estás asignado a esta ficha.'],
            ]);
        }

        $slugDia = $this->slugDiaSemanaDesdeFecha($fechaYmd);
        $this->asegurarNoFestivo($fechaYmd);

        $horario = $this->resolverHorarioParaIniciar($usuario, $fichaId, $fechaYmd, $horarioId, $slugDia);

        $aprendicesCol = $this->listarAprendicesFicha($fichaId);
        if ($aprendicesCol->isEmpty()) {
            throw ValidationException::withMessages([
                'ficha_id' => ['No hay aprendices activos en esta ficha; no se puede tomar asistencia.'],
            ]);
        }

        $existente = Sesion::query()
            ->where('horario_id', $horario->id)
            ->whereDate('fecha', $fechaYmd)
            ->first();

        if ($existente && $existente->estado === 'cerrada') {
            throw ValidationException::withMessages([
                'fecha' => ['La asistencia de esta sesión ya fue registrada.'],
            ]);
        }

        if ($existente && $existente->estado === 'abierta') {
            $sesion = $existente;
        } else {
            $sesion = Sesion::query()->create([
                'ficha_id'           => $fichaId,
                'horario_id'         => $horario->id,
                'fecha'              => $fechaYmd,
                'instructor_id'      => $usuario->id,
                'horas_programadas'  => (int) $horario->horas_programadas,
                'estado'             => 'abierta',
            ]);
        }

        $aprendices = $aprendicesCol;

        return [
            'sesion'          => $this->serializarSesion($sesion),
            'aprendices'      => $aprendices->map(fn (Usuario $a) => [
                'id'            => $a->id,
                'nombre'        => $a->nombre,
                'apellido'      => $a->apellido,
                'documento'     => $a->documento,
                'avatar_color'  => $a->avatar_color,
            ])->values()->all(),
            'fecha_servidor'  => Carbon::now('America/Bogota')->toDateString(),
        ];
    }

    /** @return array<string, mixed> */
    private function serializarSesion(Sesion $sesion): array
    {
        return [
            'id'                  => $sesion->id,
            'ficha_id'            => $sesion->ficha_id,
            'horario_id'          => $sesion->horario_id,
            'fecha'               => $sesion->fecha instanceof \DateTimeInterface
                ? $sesion->fecha->format('Y-m-d')
                : (string) $sesion->fecha,
            'instructor_id'       => $sesion->instructor_id,
            'horas_programadas'   => (int) $sesion->horas_programadas,
            'estado'              => $sesion->estado,
        ];
    }

    /**
     * @param  array<int, array{aprendiz_id: int, tipo: string, horas_inasistencia?: int|null, excusa_motivo?: string|null}>  $registros
     * @param  array<int|string, UploadedFile|null>  $evidenciasPorAprendizId
     */
    public function guardarSesionCompleta(Usuario $usuario, Sesion $sesion, array $registros, array $evidenciasPorAprendizId = []): void
    {
        if ($sesion->instructor_id !== $usuario->id) {
            abort(403, 'No eres el instructor que abrió esta sesión.');
        }

        if ($sesion->estado !== 'abierta') {
            throw ValidationException::withMessages([
                'sesion' => ['Esta sesión ya no está abierta (quizá ya se guardó la asistencia).'],
            ]);
        }

        $esperados = $this->idsAprendicesEsperados((int) $sesion->ficha_id);
        $porAprendiz = collect($registros)->keyBy('aprendiz_id');

        foreach ($esperados as $aid) {
            if (! $porAprendiz->has($aid)) {
                $ap = Usuario::query()->find($aid);
                $nombre = $ap ? trim($ap->nombre.' '.$ap->apellido) : "ID {$aid}";
                throw ValidationException::withMessages([
                    'registros' => ["Falta marcar la asistencia de: {$nombre}."],
                ]);
            }
        }

        // No deben sobrar aprendices en el payload
        foreach ($porAprendiz->keys() as $aid) {
            if (! in_array((int) $aid, $esperados, true)) {
                throw ValidationException::withMessages([
                    'registros' => ['El envío incluye aprendices que no pertenecen a esta ficha.'],
                ]);
            }
        }

        $hp = (int) $sesion->horas_programadas;

        foreach ($registros as $fila) {
            $this->validarFilaRegistro($fila, $hp);
        }

        $rutasArchivosTemp = [];

        try {
            DB::transaction(function () use ($sesion, $registros, $evidenciasPorAprendizId, &$rutasArchivosTemp) {
                $bloqueada = Sesion::query()->whereKey($sesion->id)->lockForUpdate()->first();
                if (! $bloqueada || $bloqueada->estado !== 'abierta') {
                    throw ValidationException::withMessages([
                        'sesion' => ['Esta sesión ya no está abierta.'],
                    ]);
                }

                if (RegistroAsistencia::query()->where('sesion_id', $bloqueada->id)->exists()) {
                    throw ValidationException::withMessages([
                        'sesion' => ['Esta sesión ya fue guardada.'],
                    ]);
                }

                foreach ($registros as $fila) {
                    $tipo = $fila['tipo'];
                    $motivoExcusa = null;
                    if ($tipo === 'excusa') {
                        $motivoExcusa = mb_substr(trim((string) ($fila['excusa_motivo'] ?? '')), 0, 500);
                    }

                    /** @var RegistroAsistencia $reg */
                    $reg = RegistroAsistencia::query()->create([
                        'sesion_id'                      => $bloqueada->id,
                        'aprendiz_id'                    => (int) $fila['aprendiz_id'],
                        'tipo'                           => $tipo,
                        'horas_inasistencia'             => $tipo === 'parcial' ? (int) $fila['horas_inasistencia'] : null,
                        'excusa_motivo'                  => $motivoExcusa,
                        'excusa_evidencia_path'          => null,
                        'excusa_evidencia_nombre_original' => null,
                        'activo'                         => 1,
                    ]);

                    if ($tipo === 'excusa') {
                        $aid = (int) $fila['aprendiz_id'];
                        $archivo = $evidenciasPorAprendizId[$aid]
                            ?? $evidenciasPorAprendizId[(string) $aid]
                            ?? null;
                        if ($archivo instanceof UploadedFile && $archivo->isValid()) {
                            $path = $this->guardarArchivoExcusaEnDisco($reg, $archivo);
                            $rutasArchivosTemp[] = $path;
                            $reg->update([
                                'excusa_evidencia_path'            => $path,
                                'excusa_evidencia_nombre_original' => mb_substr($archivo->getClientOriginalName(), 0, 255),
                            ]);
                        }
                    }
                }

                $bloqueada->update(['estado' => 'cerrada']);
            });
        } catch (\Illuminate\Database\QueryException) {
            foreach ($rutasArchivosTemp as $p) {
                if ($p !== '') {
                    Storage::disk('local')->delete($p);
                }
            }
            // Duplicado por doble envío u otra carrera
            throw ValidationException::withMessages([
                'sesion' => ['Esta sesión ya fue guardada o hubo un conflicto. Vuelve al historial y verifica.'],
            ]);
        } catch (\Throwable $e) {
            foreach ($rutasArchivosTemp as $p) {
                if ($p !== '') {
                    Storage::disk('local')->delete($p);
                }
            }
            throw $e;
        }
    }

    private function guardarArchivoExcusaEnDisco(RegistroAsistencia $registro, UploadedFile $file): string
    {
        $this->eliminarArchivoExcusaDelDisco($registro->excusa_evidencia_path);

        $ext = strtolower($file->getClientOriginalExtension() ?: 'bin');
        $nombre = Str::uuid()->toString().'.'.$ext;
        $dir = 'excusas/'.$registro->sesion_id;

        return $file->storeAs($dir, $nombre, 'local');
    }

    private function eliminarArchivoExcusaDelDisco(?string $pathRelativo): void
    {
        if ($pathRelativo === null || $pathRelativo === '') {
            return;
        }
        if (Storage::disk('local')->exists($pathRelativo)) {
            Storage::disk('local')->delete($pathRelativo);
        }
    }

    /**
     * @param  array{aprendiz_id?: int, tipo: string, horas_inasistencia?: int|null, excusa_motivo?: string|null}  $fila
     */
    private function validarFilaRegistro(array $fila, int $horasProgramadas): void
    {
        $tipo = $fila['tipo'];
        $permitidos = ['presente', 'falla', 'excusa', 'parcial'];
        if (! in_array($tipo, $permitidos, true)) {
            throw ValidationException::withMessages([
                'registros' => ['Tipo de asistencia no válido.'],
            ]);
        }

        if ($tipo === 'parcial') {
            if ($horasProgramadas <= 1) {
                throw ValidationException::withMessages([
                    'registros' => ['No se puede marcar inasistencia parcial cuando la sesión tiene 1 hora o menos.'],
                ]);
            }
            $h = (int) ($fila['horas_inasistencia'] ?? 0);
            if ($h < 1 || $h > $horasProgramadas - 1) {
                throw ValidationException::withMessages([
                    'registros' => ["Las horas de inasistencia parcial deben estar entre 1 y ".($horasProgramadas - 1).'.'],
                ]);
            }
        } elseif (isset($fila['horas_inasistencia']) && $fila['horas_inasistencia'] !== null) {
            throw ValidationException::withMessages([
                'registros' => ['Solo el tipo parcial lleva horas de inasistencia.'],
            ]);
        }

        if ($tipo === 'excusa') {
            $motivo = trim((string) ($fila['excusa_motivo'] ?? ''));
            if ($motivo === '') {
                throw ValidationException::withMessages([
                    'registros' => ['El motivo de la excusa es obligatorio.'],
                ]);
            }
        } elseif (! empty(trim((string) ($fila['excusa_motivo'] ?? '')))) {
            throw ValidationException::withMessages([
                'registros' => ['El motivo de excusa solo aplica cuando el tipo es excusa.'],
            ]);
        }
    }

    /**
     * @param  array{tipo: string, horas_inasistencia?: int|null, razon?: string|null, excusa_motivo?: string|null}  $datos
     */
    public function actualizarRegistro(Usuario $usuario, RegistroAsistencia $registro, array $datos, ?UploadedFile $evidencia = null): void
    {
        $registro->load('sesion');
        $sesion = $registro->sesion;
        if (! $sesion || $sesion->instructor_id !== $usuario->id) {
            abort(403, 'No puedes editar este registro.');
        }

        // Tras cerrar la sesión se permiten correcciones (historial / M8)
        if ($sesion->estado !== 'cerrada') {
            throw ValidationException::withMessages([
                'sesion' => ['Solo se puede corregir asistencia cuando la sesión ya fue cerrada.'],
            ]);
        }

        $hp = (int) $sesion->horas_programadas;
        $fila = [
            'aprendiz_id'        => $registro->aprendiz_id,
            'tipo'               => $datos['tipo'],
            'horas_inasistencia' => $datos['horas_inasistencia'] ?? null,
            'excusa_motivo'      => $datos['excusa_motivo'] ?? null,
        ];
        $this->validarFilaRegistro($fila, $hp);

        DB::transaction(function () use ($registro, $datos, $usuario, $sesion, $evidencia) {
            RegistroAsistenciaBackup::query()->create([
                'registro_asistencia_id'   => $registro->id,
                'sesion_id'                => $sesion->id,
                'aprendiz_id'              => $registro->aprendiz_id,
                'tipo_anterior'            => $registro->tipo,
                'horas_inasistencia_ant'     => $registro->horas_inasistencia,
                'tipo_nuevo'               => $datos['tipo'],
                'horas_inasistencia_new'    => $datos['tipo'] === 'parcial' ? (int) $datos['horas_inasistencia'] : null,
                'modificado_por'           => $usuario->id,
                'razon'                    => isset($datos['razon']) ? mb_substr((string) $datos['razon'], 0, 255) : null,
            ]);

            $tipoNuevo = $datos['tipo'];
            $payload = [
                'tipo'               => $tipoNuevo,
                'horas_inasistencia' => $tipoNuevo === 'parcial' ? (int) $datos['horas_inasistencia'] : null,
            ];

            if ($tipoNuevo === 'excusa') {
                $payload['excusa_motivo'] = mb_substr(trim((string) ($datos['excusa_motivo'] ?? '')), 0, 500);
                if ($evidencia instanceof UploadedFile && $evidencia->isValid()) {
                    $path = $this->guardarArchivoExcusaEnDisco($registro, $evidencia);
                    $payload['excusa_evidencia_path'] = $path;
                    $payload['excusa_evidencia_nombre_original'] = mb_substr($evidencia->getClientOriginalName(), 0, 255);
                } else {
                    $payload['excusa_evidencia_path'] = $registro->excusa_evidencia_path;
                    $payload['excusa_evidencia_nombre_original'] = $registro->excusa_evidencia_nombre_original;
                }
            } else {
                $this->eliminarArchivoExcusaDelDisco($registro->excusa_evidencia_path);
                $payload['excusa_motivo'] = null;
                $payload['excusa_evidencia_path'] = null;
                $payload['excusa_evidencia_nombre_original'] = null;
            }

            $registro->update($payload);
        });
    }
}
