<?php

namespace App\Services;

use App\Models\FichaCaracterizacion;
use App\Models\FichaInstructor;
use App\Models\Horario;
use App\Models\ImportacionAprendices;
use App\Models\JornadaFicha;
use App\Models\Sesion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use PhpOffice\PhpSpreadsheet\IOFactory;

// Lógica de negocio de fichas: jornadas, horarios, instructores e importación (Módulo 5)
class FichaService
{
    /**
     * Consulta del listado de fichas según rol (instructor solo las suyas).
     * Si el instructor no tiene fichas, devuelve null.
     */
    public function fichasListadoQuery(Usuario $usuario, Request $request): ?Builder
    {
        $q = FichaCaracterizacion::query()
            ->with(['centro:id,nombre,codigo', 'programa:id,nombre,codigo']);

        if (in_array($usuario->rol, ['instructor', 'gestor_grupo'], true)) {
            $ids = DB::table('ficha_instructor')
                ->where('usuario_id', $usuario->id)
                ->where('activo', 1)
                ->pluck('ficha_id');
            if ($ids->isEmpty()) {
                return null;
            }
            $q->whereIn('id', $ids);
        }

        if ($request->filled('busqueda')) {
            $b = $request->string('busqueda')->trim();
            $q->where('numero_ficha', 'like', '%'.$b.'%');
        }
        if ($request->filled('centro_id')) {
            $q->where('centro_formacion_id', (int) $request->input('centro_id'));
        }
        if ($request->filled('programa_id')) {
            $q->where('programa_formacion_id', (int) $request->input('programa_id'));
        }
        if ($request->filled('activo')) {
            $q->where('activo', (int) $request->input('activo'));
        }

        $q->orderByDesc('id');

        return $q;
    }

    /** Diferencia en horas entre inicio y fin (mínimo 1, máximo 24) para horas_programadas */
    public function calcularHorasProgramadas(string $horaInicio, string $horaFin): int
    {
        $a = Carbon::parse($horaInicio);
        $b = Carbon::parse($horaFin);
        if ($b->lte($a)) {
            throw ValidationException::withMessages([
                'horarios' => ['La hora de fin debe ser posterior a la hora de inicio.'],
            ]);
        }
        $minutos = $a->diffInMinutes($b);
        $horas = (int) max(1, round($minutos / 60));

        return min(24, $horas);
    }

    /** Nombre completo del gestor activo actual, o null */
    public function nombreGestorActual(FichaCaracterizacion $ficha): ?string
    {
        $pivot = FichaInstructor::query()
            ->where('ficha_id', $ficha->id)
            ->where('es_gestor', 1)
            ->where('activo', 1)
            ->with('usuario')
            ->first();

        if (! $pivot || ! $pivot->usuario) {
            return null;
        }

        return trim($pivot->usuario->nombre.' '.$pivot->usuario->apellido);
    }

    /**
     * @param  array<int, array{usuario_id:int, es_gestor:bool}>  $instructores
     * @param  array<int, array{tipo:string, horarios:array}>  $jornadas
     */
    public function crearFicha(array $datosCabecera, array $instructores, array $jornadas): FichaCaracterizacion
    {
        $this->validarSolapeHorariosInstructores(null, $jornadas);

        return DB::transaction(function () use ($datosCabecera, $instructores, $jornadas) {
            $ficha = FichaCaracterizacion::query()->create([
                'numero_ficha' => $datosCabecera['numero_ficha'],
                'estado' => $datosCabecera['estado'],
                'modalidad' => $datosCabecera['modalidad'] ?? 'presencial',
                'centro_formacion_id' => $datosCabecera['centro_formacion_id'],
                'programa_formacion_id' => $datosCabecera['programa_formacion_id'],
                'fecha_inicio' => $datosCabecera['fecha_inicio'],
                'fecha_fin' => $datosCabecera['fecha_fin'],
                'activo' => 1,
            ]);

            $this->sincronizarInstructoresDesdePayload($ficha, $instructores);
            $this->sincronizarJornadasYHorarios($ficha, $jornadas);

            return $ficha->fresh();
        });
    }

    /**
     * @param  array<int, array{usuario_id:int, es_gestor:bool}>  $instructores
     * @param  array<int, array{tipo:string, horarios:array}>  $jornadas
     * @return array{ficha: FichaCaracterizacion, advertencias: string[]}
     */
    public function actualizarFicha(FichaCaracterizacion $ficha, array $datosCabecera, array $instructores, array $jornadas): array
    {
        $this->validarSolapeHorariosInstructores($ficha->id, $jornadas);

        return DB::transaction(function () use ($ficha, $datosCabecera, $instructores, $jornadas) {
            $advertencias = [];

            $nuevaFechaInicio = $datosCabecera['fecha_inicio'];
            $nuevaFechaFin    = $datosCabecera['fecha_fin'];

            $sesionesAntes = Sesion::query()
                ->where('ficha_id', $ficha->id)
                ->where('fecha', '<', $nuevaFechaInicio)
                ->count();
            if ($sesionesAntes > 0) {
                $advertencias[] = "Hay {$sesionesAntes} sesión(es) registrada(s) antes de la nueva fecha de inicio ({$nuevaFechaInicio}). Esas sesiones se conservan en el historial.";
            }

            $sesionesDespues = Sesion::query()
                ->where('ficha_id', $ficha->id)
                ->where('fecha', '>', $nuevaFechaFin)
                ->count();
            if ($sesionesDespues > 0) {
                $advertencias[] = "Hay {$sesionesDespues} sesión(es) registrada(s) después de la nueva fecha de fin ({$nuevaFechaFin}). Esas sesiones se conservan en el historial.";
            }

            $ficha->update([
                'numero_ficha'          => $datosCabecera['numero_ficha'],
                'estado'                => $datosCabecera['estado'],
                'modalidad'             => $datosCabecera['modalidad'] ?? $ficha->modalidad ?? 'presencial',
                'centro_formacion_id'   => $datosCabecera['centro_formacion_id'],
                'programa_formacion_id' => $datosCabecera['programa_formacion_id'],
                'fecha_inicio'          => $nuevaFechaInicio,
                'fecha_fin'             => $nuevaFechaFin,
            ]);

            $this->sincronizarInstructoresDesdePayload($ficha, $instructores);
            $this->sincronizarJornadasYHorarios($ficha, $jornadas);

            return ['ficha' => $ficha->fresh(), 'advertencias' => $advertencias];
        });
    }

    /**
     * @param  array<int, array{usuario_id:int, es_gestor:bool}>  $instructores
     */
    public function sincronizarInstructoresDesdePayload(FichaCaracterizacion $ficha, array $instructores): void
    {
        $idsSolicitados = collect($instructores)->pluck('usuario_id')->map(fn ($id) => (int) $id)->all();

        FichaInstructor::query()
            ->where('ficha_id', $ficha->id)
            ->whereNotIn('usuario_id', $idsSolicitados)
            ->update(['activo' => 0, 'es_gestor' => 0]);

        foreach ($instructores as $fila) {
            try {
                FichaInstructor::query()->updateOrCreate(
                    [
                        'ficha_id' => $ficha->id,
                        'usuario_id' => (int) $fila['usuario_id'],
                    ],
                    [
                        'es_gestor' => ! empty($fila['es_gestor']) ? 1 : 0,
                        'activo' => 1,
                    ]
                );
            } catch (QueryException $e) {
                $this->lanzarSiGestorDuplicado($e);
                throw $e;
            }
        }
    }

    /**
     * Sincroniza jornadas y horarios contra el payload sin borrar historial de asistencia.
     *
     * Algoritmo por horario:
     *   - Existe activo  → UPDATE in-place (instructor, horas)
     *   - Existe inactivo → reactivar + UPDATE  (evita violar UNIQUE ficha/jornada/dia)
     *   - No existe       → INSERT
     *
     * Horarios activos que ya no vienen en el payload:
     *   - Tienen sesiones → soft-delete (activo=0), historial intacto
     *   - Sin sesiones    → hard-delete
     *
     * Jornadas activas que ya no vienen en el payload:
     *   - Algún horario tiene sesiones → soft-delete jornada
     *   - Sin sesiones                 → hard-delete horarios + jornada
     *
     * @param  array<int, array{tipo:string, horarios:array<int, array{dia_semana:string, hora_inicio:string, hora_fin:string, instructor_id:int}>}>  $jornadas
     */
    public function sincronizarJornadasYHorarios(FichaCaracterizacion $ficha, array $jornadas): void
    {
        // Carga todas las jornadas existentes (activas e inactivas) de esta ficha
        $jornadasExistentes = JornadaFicha::query()
            ->where('ficha_id', $ficha->id)
            ->get()
            ->keyBy('tipo');

        $jornadaIdsEnPayload = [];
        $horarioIdsEnPayload = [];

        foreach ($jornadas as $j) {
            $tipo = $j['tipo'];

            // Buscar, reactivar o crear la jornada
            if ($jornadasExistentes->has($tipo)) {
                $jornada = $jornadasExistentes->get($tipo);
                if (! (int) $jornada->activo) {
                    $jornada->update(['activo' => 1]);
                }
            } else {
                $jornada = JornadaFicha::query()->create([
                    'ficha_id' => $ficha->id,
                    'tipo'     => $tipo,
                    'activo'   => 1,
                ]);
            }

            $jornadaIdsEnPayload[] = $jornada->id;

            // Carga todos los horarios de esta jornada (activos e inactivos) por dia_semana
            $horariosExistentes = Horario::query()
                ->where('ficha_id', $ficha->id)
                ->where('jornada_ficha_id', $jornada->id)
                ->get()
                ->keyBy('dia_semana');

            foreach ($j['horarios'] as $h) {
                $horas = $this->calcularHorasProgramadas($h['hora_inicio'], $h['hora_fin']);
                $dia   = $h['dia_semana'];

                if ($horariosExistentes->has($dia)) {
                    // UPDATE in-place — reactiva si estaba inactivo
                    $horario = $horariosExistentes->get($dia);
                    $horario->update([
                        'hora_inicio'       => $h['hora_inicio'],
                        'hora_fin'          => $h['hora_fin'],
                        'horas_programadas' => $horas,
                        'instructor_id'     => (int) $h['instructor_id'],
                        'activo'            => 1,
                    ]);
                } else {
                    // INSERT — el par (jornada, dia) no existía nunca
                    $horario = Horario::query()->create([
                        'ficha_id'          => $ficha->id,
                        'jornada_ficha_id'  => $jornada->id,
                        'dia_semana'        => $dia,
                        'hora_inicio'       => $h['hora_inicio'],
                        'hora_fin'          => $h['hora_fin'],
                        'horas_programadas' => $horas,
                        'instructor_id'     => (int) $h['instructor_id'],
                        'activo'            => 1,
                    ]);
                }

                $horarioIdsEnPayload[] = $horario->id;
            }
        }

        // Horarios activos que ya no están en el payload → soft o hard delete
        $horariosARemover = Horario::query()
            ->where('ficha_id', $ficha->id)
            ->where('activo', 1)
            ->when($horarioIdsEnPayload, fn ($q) => $q->whereNotIn('id', $horarioIdsEnPayload))
            ->get();

        foreach ($horariosARemover as $horario) {
            if (Sesion::query()->where('horario_id', $horario->id)->exists()) {
                $horario->update(['activo' => 0]);
            } else {
                $horario->delete();
            }
        }

        // Jornadas activas que ya no están en el payload → soft o hard delete
        $jornadasARemover = JornadaFicha::query()
            ->where('ficha_id', $ficha->id)
            ->where('activo', 1)
            ->when($jornadaIdsEnPayload, fn ($q) => $q->whereNotIn('id', $jornadaIdsEnPayload))
            ->get();

        foreach ($jornadasARemover as $jornada) {
            $horarioIdsDeJornada = Horario::query()
                ->where('jornada_ficha_id', $jornada->id)
                ->pluck('id');

            $tieneSesiones = $horarioIdsDeJornada->isNotEmpty()
                && Sesion::query()->whereIn('horario_id', $horarioIdsDeJornada)->exists();

            if ($tieneSesiones) {
                $jornada->update(['activo' => 0]);
            } else {
                Horario::query()->where('jornada_ficha_id', $jornada->id)->delete();
                $jornada->delete();
            }
        }
    }

    public function desactivarFicha(FichaCaracterizacion $ficha): void
    {
        $ficha->update(['activo' => 0]);
    }

    public function reactivarFicha(FichaCaracterizacion $ficha): void
    {
        $ficha->update(['activo' => 1]);
    }

    /**
     * Crea un aprendiz asignado a la ficha (misma lógica que una fila válida del Excel).
     *
     * @param  array{nombre: string, apellido: string, documento: string, correo: string}  $datos
     */
    public function crearAprendizEnFicha(FichaCaracterizacion $ficha, array $datos): Usuario
    {
        $this->assertFichaActivaParaGestionAprendices($ficha);

        $correo = strtolower(trim($datos['correo']));
        $doc = trim($datos['documento']);

        if ($correo === '' || ! filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                'correo' => ['El correo no es válido.'],
            ]);
        }

        if (Usuario::query()->where('correo', $correo)->exists()) {
            throw ValidationException::withMessages([
                'correo' => ['El correo ya está registrado en el sistema.'],
            ]);
        }

        if (Usuario::query()->where('documento', $doc)->exists()) {
            throw ValidationException::withMessages([
                'documento' => ['La cédula ya está registrada en el sistema.'],
            ]);
        }

        return Usuario::query()->create([
            'nombre' => trim($datos['nombre']),
            'apellido' => trim($datos['apellido']) !== '' ? trim($datos['apellido']) : '-',
            'documento' => $doc,
            'correo' => $correo,
            'password' => bcrypt($doc),
            'rol' => 'aprendiz',
            'activo' => 1,
            'ficha_id' => $ficha->id,
        ]);
    }

    /**
     * @param  array{nombre: string, apellido: string, documento: string, correo: string}  $datos
     */
    public function actualizarAprendizEnFicha(FichaCaracterizacion $ficha, Usuario $aprendiz, array $datos): Usuario
    {
        $this->assertFichaActivaParaGestionAprendices($ficha);
        $this->assertAprendizDeFicha($ficha, $aprendiz);

        $correo = strtolower(trim($datos['correo']));
        $doc = trim($datos['documento']);

        if ($correo === '' || ! filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            throw ValidationException::withMessages([
                'correo' => ['El correo no es válido.'],
            ]);
        }

        $apellido = trim($datos['apellido']) !== '' ? trim($datos['apellido']) : '-';

        $aprendiz->update([
            'nombre' => trim($datos['nombre']),
            'apellido' => $apellido,
            'documento' => $doc,
            'correo' => $correo,
        ]);

        return $aprendiz->fresh();
    }

    public function eliminarAprendizDeFicha(FichaCaracterizacion $ficha, Usuario $aprendiz): void
    {
        $this->assertFichaActivaParaGestionAprendices($ficha);
        $this->assertAprendizDeFicha($ficha, $aprendiz);

        $aprendiz->update([
            'activo' => 0,
            'ficha_id' => null,
        ]);
    }

    private function assertFichaActivaParaGestionAprendices(FichaCaracterizacion $ficha): void
    {
        if (! (int) $ficha->activo) {
            throw ValidationException::withMessages([
                'ficha' => ['Reactiva la ficha antes de gestionar aprendices.'],
            ]);
        }
    }

    private function assertAprendizDeFicha(FichaCaracterizacion $ficha, Usuario $aprendiz): void
    {
        if ($aprendiz->rol !== 'aprendiz' || (int) $aprendiz->ficha_id !== (int) $ficha->id) {
            throw ValidationException::withMessages([
                'aprendiz' => ['El aprendiz no pertenece a esta ficha.'],
            ]);
        }
    }

    /**
     * @param  array<int, array{tipo:string, horarios:array<int, array{dia_semana:string, hora_inicio:string, hora_fin:string, instructor_id:int}>}>  $jornadas
     */
    public function validarSolapeHorariosInstructores(?int $excluirFichaId, array $jornadas): void
    {
        $slots = [];
        foreach ($jornadas as $j) {
            foreach ($j['horarios'] ?? [] as $h) {
                $slots[] = [
                    'instructor_id' => (int) $h['instructor_id'],
                    'dia_semana' => $h['dia_semana'],
                    'hora_inicio' => $h['hora_inicio'],
                    'hora_fin' => $h['hora_fin'],
                ];
            }
        }

        $n = count($slots);
        for ($i = 0; $i < $n; $i++) {
            for ($j = $i + 1; $j < $n; $j++) {
                if ($this->horariosSolapanMismoInstructorDia($slots[$i], $slots[$j])) {
                    throw ValidationException::withMessages([
                        'jornadas' => ['Hay horarios solapados para el mismo instructor el mismo día dentro de esta ficha. Revisa día y franjas horarias.'],
                    ]);
                }
            }
        }

        foreach ($slots as $slot) {
            $q = Horario::query()
                ->where('activo', 1)
                ->where('instructor_id', $slot['instructor_id'])
                ->where('dia_semana', $slot['dia_semana'])
                ->whereHas('ficha', fn ($q2) => $q2->where('activo', 1));

            if ($excluirFichaId !== null && $excluirFichaId > 0) {
                $q->where('ficha_id', '!=', $excluirFichaId);
            }

            $existentes = $q->with('ficha:id,numero_ficha')->get(['id', 'ficha_id', 'hora_inicio', 'hora_fin']);

            foreach ($existentes as $ex) {
                if ($this->intervalosTiempoSolapan(
                    $slot['hora_inicio'],
                    $slot['hora_fin'],
                    (string) $ex->hora_inicio,
                    (string) $ex->hora_fin
                )) {
                    $num = $ex->ficha?->numero_ficha ?? (string) $ex->ficha_id;
                    throw ValidationException::withMessages([
                        'jornadas' => ["El instructor ya tiene clase solapada ese día en la ficha {$num}. Ajusta horarios o asignación."],
                    ]);
                }
            }
        }
    }

    /**
     * @param  array{instructor_id: int, dia_semana: string, hora_inicio: string, hora_fin: string}  $a
     * @param  array{instructor_id: int, dia_semana: string, hora_inicio: string, hora_fin: string}  $b
     */
    private function horariosSolapanMismoInstructorDia(array $a, array $b): bool
    {
        if ($a['instructor_id'] !== $b['instructor_id'] || $a['dia_semana'] !== $b['dia_semana']) {
            return false;
        }

        return $this->intervalosTiempoSolapan(
            $a['hora_inicio'],
            $a['hora_fin'],
            $b['hora_inicio'],
            $b['hora_fin']
        );
    }

    private function intervalosTiempoSolapan(string $iniA, string $finA, string $iniB, string $finB): bool
    {
        $a0 = $this->horaAMinutos($iniA);
        $a1 = $this->horaAMinutos($finA);
        $b0 = $this->horaAMinutos($iniB);
        $b1 = $this->horaAMinutos($finB);

        return $a0 < $b1 && $b0 < $a1;
    }

    private function horaAMinutos(string $hora): int
    {
        $hora = substr(trim($hora), 0, 8);
        $c = Carbon::parse($hora);

        return $c->hour * 60 + $c->minute;
    }

    /**
     * @return array{exitosos: int, fallidos: int, errores: array<int, string>}
     */
    public function importarAprendicesDesdeExcel(FichaCaracterizacion $ficha, UploadedFile $archivo, int $importadoPorId): array
    {
        if (! (int) $ficha->activo) {
            throw ValidationException::withMessages([
                'archivo' => ['Reactiva la ficha antes de importar aprendices.'],
            ]);
        }

        $errores = [];
        $exitosos = 0;

        try {
            $spreadsheet = IOFactory::load($archivo->getRealPath());
        } catch (\Throwable $e) {
            throw ValidationException::withMessages([
                'archivo' => ['No se pudo leer el archivo Excel. Verifica que sea un .xlsx válido.'],
            ]);
        }

        $hoja = $spreadsheet->getActiveSheet();
        $filas = $hoja->toArray();
        $cabecera = array_shift($filas);
        if (! is_array($cabecera)) {
            $cabecera = [];
        }
        $mapa = $this->mapearColumnasImportacion($cabecera);

        // No usar array_filter sin callback: el índice de columna A es 0 y PHP lo quita como "falsy".
        if ($mapa['cedula'] === null || $mapa['nombre_completo'] === null || $mapa['correo'] === null) {
            throw ValidationException::withMessages([
                'archivo' => ['El Excel debe tener columnas: cedula, nombre_completo, correo (primera fila).'],
            ]);
        }

        $numeroFila = 1;
        foreach ($filas as $fila) {
            $numeroFila++;
            if (! is_array($fila) || $this->filaVacia($fila)) {
                continue;
            }

            $cedula = trim((string) ($fila[$mapa['cedula']] ?? ''));
            $nombreC = trim((string) ($fila[$mapa['nombre_completo']] ?? ''));
            $correo = strtolower(trim((string) ($fila[$mapa['correo']] ?? '')));

            $errFila = "Fila {$numeroFila}: ";

            if ($cedula === '' || $nombreC === '' || $correo === '') {
                $errores[] = $errFila.'Faltan cédula, nombre completo o correo.';

                continue;
            }

            if (! filter_var($correo, FILTER_VALIDATE_EMAIL)) {
                $errores[] = $errFila.'El correo no es válido.';

                continue;
            }

            if (Usuario::query()->where('correo', $correo)->exists()) {
                $errores[] = $errFila.'El correo ya está registrado en el sistema.';

                continue;
            }

            if (Usuario::query()->where('documento', $cedula)->exists()) {
                $errores[] = $errFila.'La cédula ya está registrada en el sistema.';

                continue;
            }

            [$nombre, $apellido] = $this->partirNombreCompleto($nombreC);

            try {
                Usuario::query()->create([
                    'nombre' => $nombre,
                    'apellido' => $apellido,
                    'documento' => $cedula,
                    'correo' => $correo,
                    'password' => bcrypt($cedula),
                    'rol' => 'aprendiz',
                    'activo' => 1,
                    'ficha_id' => $ficha->id,
                ]);
                $exitosos++;
            } catch (\Throwable $e) {
                $errores[] = $errFila.'No se pudo crear el aprendiz.';
            }
        }

        $fallidos = count($errores);
        $totalProceso = $exitosos + $fallidos;

        ImportacionAprendices::query()->create([
            'importado_por' => $importadoPorId,
            'ficha_id' => $ficha->id,
            'nombre_archivo' => $archivo->getClientOriginalName(),
            'total_registros' => $totalProceso,
            'exitosos' => $exitosos,
            'fallidos' => $fallidos,
            'errores' => $errores,
        ]);

        return [
            'exitosos' => $exitosos,
            'fallidos' => $fallidos,
            'errores' => $errores,
        ];
    }

    /** Primera palabra = nombre, resto = apellido */
    private function partirNombreCompleto(string $nombreCompleto): array
    {
        $partes = preg_split('/\s+/', $nombreCompleto, -1, PREG_SPLIT_NO_EMPTY) ?: [];
        if ($partes === []) {
            return ['Sin nombre', ''];
        }
        $nombre = array_shift($partes);
        $apellido = trim(implode(' ', $partes));

        return [$nombre, $apellido !== '' ? $apellido : '-'];
    }

    /** @return array{cedula: ?int, nombre_completo: ?int, correo: ?int} */
    private function mapearColumnasImportacion(array $cabecera): array
    {
        $mapa = ['cedula' => null, 'nombre_completo' => null, 'correo' => null];
        foreach ($cabecera as $i => $titulo) {
            $clave = $this->normalizarEncabezado((string) $titulo);
            if (str_contains($clave, 'cedula') || str_contains($clave, 'cédula')) {
                $mapa['cedula'] = (int) $i;
            }
            if (str_contains($clave, 'nombre') && str_contains($clave, 'completo')) {
                $mapa['nombre_completo'] = (int) $i;
            }
            if ($clave === 'correo' || str_contains($clave, 'email')) {
                $mapa['correo'] = (int) $i;
            }
        }

        return $mapa;
    }

    private function normalizarEncabezado(string $s): string
    {
        $s = mb_strtolower(trim($s));
        $s = str_replace(['á', 'é', 'í', 'ó', 'ú', 'ñ'], ['a', 'e', 'i', 'o', 'u', 'n'], $s);

        return $s;
    }

    private function filaVacia(array $fila): bool
    {
        foreach ($fila as $celda) {
            if (trim((string) $celda) !== '') {
                return false;
            }
        }

        return true;
    }

    public function aplicarAccionInstructor(
        FichaCaracterizacion $ficha,
        int $usuarioId,
        string $accion,
        bool $esGestorSolicitado
    ): void {
        $usuario = Usuario::query()->find($usuarioId);
        if (! $usuario || ! in_array($usuario->rol, ['instructor', 'gestor_grupo'], true) || ! (int) $usuario->activo) {
            throw ValidationException::withMessages([
                'usuario_id' => ['El usuario no es un instructor o gestor activo.'],
            ]);
        }

        try {
            if ($accion === 'asignar') {
                if ($esGestorSolicitado) {
                    $conflicto = FichaInstructor::query()
                        ->where('ficha_id', $ficha->id)
                        ->where('es_gestor', 1)
                        ->where('activo', 1)
                        ->where('usuario_id', '!=', $usuarioId)
                        ->with('usuario')
                        ->first();
                    if ($conflicto && $conflicto->usuario) {
                        $nom = trim($conflicto->usuario->nombre.' '.$conflicto->usuario->apellido);
                        throw ValidationException::withMessages([
                            'es_gestor' => ["Esta ficha ya tiene un Gestor de Grupo asignado: {$nom}."],
                        ]);
                    }
                }

                FichaInstructor::query()->updateOrCreate(
                    ['ficha_id' => $ficha->id, 'usuario_id' => $usuarioId],
                    [
                        'es_gestor' => $esGestorSolicitado ? 1 : 0,
                        'activo' => 1,
                    ]
                );

                return;
            }

            if ($accion === 'desasignar') {
                FichaInstructor::query()
                    ->where('ficha_id', $ficha->id)
                    ->where('usuario_id', $usuarioId)
                    ->update(['activo' => 0, 'es_gestor' => 0]);

                return;
            }

            if ($accion === 'toggle_gestor') {
                $pivot = FichaInstructor::query()
                    ->where('ficha_id', $ficha->id)
                    ->where('usuario_id', $usuarioId)
                    ->first();

                if (! $pivot || ! (int) $pivot->activo) {
                    throw ValidationException::withMessages([
                        'usuario_id' => ['El instructor no está asignado activamente a esta ficha.'],
                    ]);
                }

                if ((int) $pivot->es_gestor === 1) {
                    $pivot->update(['es_gestor' => 0]);

                    return;
                }

                $conflicto = FichaInstructor::query()
                    ->where('ficha_id', $ficha->id)
                    ->where('es_gestor', 1)
                    ->where('activo', 1)
                    ->where('usuario_id', '!=', $usuarioId)
                    ->with('usuario')
                    ->first();
                if ($conflicto && $conflicto->usuario) {
                    $nom = trim($conflicto->usuario->nombre.' '.$conflicto->usuario->apellido);
                    throw ValidationException::withMessages([
                        'es_gestor' => ["Esta ficha ya tiene un Gestor de Grupo asignado: {$nom}."],
                    ]);
                }

                $pivot->update(['es_gestor' => 1]);
            }
        } catch (QueryException $e) {
            $this->lanzarSiGestorDuplicado($e);
            throw $e;
        }
    }

    private function lanzarSiGestorDuplicado(QueryException $e): void
    {
        if (str_contains($e->getMessage(), 'Gestor') || str_contains($e->getMessage(), '45000')) {
            throw ValidationException::withMessages([
                'es_gestor' => ['Esta ficha ya tiene un Gestor de Grupo asignado.'],
            ]);
        }
    }
}
