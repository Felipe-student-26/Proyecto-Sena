<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureTotpSessionOk;
use App\Models\FichaCaracterizacion;
use App\Models\Horario;
use App\Models\JornadaFicha;
use App\Models\Sesion;
use App\Models\Usuario;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

// Tests del endpoint GET /api/calendario (Módulo 14)
class CalendarioTest extends TestCase
{
    use RefreshDatabase;

    // ─── Helpers de setup ────────────────────────────────────────────────────

    private function crearInstructor(string $correo = 'instructor@test.com'): Usuario
    {
        return Usuario::create([
            'nombre'    => 'Test',
            'apellido'  => 'Instructor',
            'documento' => '10000001',
            'correo'    => $correo,
            'password'  => null,   // sin password → TOTP middleware omite la verificación
            'rol'       => 'instructor',
            'activo'    => 1,
        ]);
    }

    private function crearFicha(string $inicio = '2026-01-01', string $fin = '2026-12-31'): FichaCaracterizacion
    {
        $centroId    = DB::table('centros_formacion')->insertGetId(['nombre' => 'Centro Test']);
        $programaId  = DB::table('programas_formacion')->insertGetId(['nombre' => 'Programa Test']);

        return FichaCaracterizacion::create([
            'numero_ficha'          => (string) rand(1000000, 9999999),
            'estado'                => 'activa',
            'centro_formacion_id'   => $centroId,
            'programa_formacion_id' => $programaId,
            'fecha_inicio'          => $inicio,
            'fecha_fin'             => $fin,
            'activo'                => 1,
        ]);
    }

    private function crearJornada(FichaCaracterizacion $ficha, string $tipo = 'mañana'): JornadaFicha
    {
        return JornadaFicha::create([
            'ficha_id' => $ficha->id,
            'tipo'     => $tipo,
            'activo'   => 1,
        ]);
    }

    private function crearHorario(
        FichaCaracterizacion $ficha,
        JornadaFicha $jornada,
        Usuario $instructor,
        string $dia = 'lunes'
    ): Horario {
        return Horario::create([
            'ficha_id'          => $ficha->id,
            'jornada_ficha_id'  => $jornada->id,
            'dia_semana'        => $dia,
            'hora_inicio'       => '08:00:00',
            'hora_fin'          => '12:00:00',
            'horas_programadas' => 4,
            'instructor_id'     => $instructor->id,
            'activo'            => 1,
        ]);
    }

    private function crearSesion(Horario $horario, FichaCaracterizacion $ficha, Usuario $instructor, string $fecha, string $estado = 'cerrada'): Sesion
    {
        return Sesion::create([
            'ficha_id'          => $ficha->id,
            'horario_id'        => $horario->id,
            'instructor_id'     => $instructor->id,
            'fecha'             => $fecha,
            'horas_programadas' => 4,
            'estado'            => $estado,
        ]);
    }

    // ─── Tests ───────────────────────────────────────────────────────────────

    /** El endpoint responde 200 con un array para un instructor autenticado. */
    public function test_instructor_puede_ver_su_calendario(): void
    {
        $instructor = $this->crearInstructor();
        Sanctum::actingAs($instructor);

        $response = $this->getJson('/api/calendario?desde=2026-05-01&hasta=2026-05-31');

        $response->assertStatus(200)
                 ->assertJsonIsArray();
    }

    /** Sin horarios asignados, el array de eventos está vacío. */
    public function test_sin_horarios_devuelve_array_vacio(): void
    {
        $instructor = $this->crearInstructor();
        Sanctum::actingAs($instructor);

        $response = $this->getJson('/api/calendario?desde=2026-05-01&hasta=2026-05-31');

        $response->assertStatus(200)
                 ->assertExactJson([]);
    }

    /** Un coordinador recibe 403 porque no es instructor ni gestor. */
    public function test_coordinador_no_puede_ver_calendario(): void
    {
        $coordinador = Usuario::create([
            'nombre'    => 'Coord',
            'apellido'  => 'Test',
            'documento' => '10000002',
            'correo'    => 'coord@test.com',
            'password'  => null,
            'rol'       => 'coordinador',
            'activo'    => 1,
        ]);
        Sanctum::actingAs($coordinador);

        $response = $this->getJson('/api/calendario?desde=2026-05-01&hasta=2026-05-31');

        $response->assertStatus(403);
    }

    /** Un horario de lunes aparece en todos los lunes del rango dentro de la vigencia de la ficha. */
    public function test_eventos_se_proyectan_segun_dia_semana(): void
    {
        $instructor = $this->crearInstructor();
        $ficha      = $this->crearFicha('2026-01-01', '2026-12-31');
        $jornada    = $this->crearJornada($ficha);
        $this->crearHorario($ficha, $jornada, $instructor, 'lunes');

        Sanctum::actingAs($instructor);

        // Mayo 2026: los lunes son 4, 11, 18, 25
        $response = $this->getJson('/api/calendario?desde=2026-05-01&hasta=2026-05-31');

        $response->assertStatus(200);
        $eventos = $response->json();

        $this->assertNotEmpty($eventos, 'Debe haber eventos para los lunes de mayo');

        foreach ($eventos as $ev) {
            $diaSemana = Carbon::parse($ev['fecha'])->format('N'); // ISO: 1=lunes
            $this->assertEquals(1, $diaSemana, "La fecha {$ev['fecha']} debe ser lunes (ISO N=1)");
        }

        // Mayo 2026 tiene exactamente 4 lunes (4, 11, 18, 25)
        $this->assertCount(4, $eventos);
    }

    /** Si existe una sesión para un evento, el evento incluye sesion_id y sesion_estado. */
    public function test_sesion_existente_fusionada_en_evento(): void
    {
        $instructor = $this->crearInstructor();
        $ficha      = $this->crearFicha('2026-01-01', '2026-12-31');
        $jornada    = $this->crearJornada($ficha);
        $horario    = $this->crearHorario($ficha, $jornada, $instructor, 'lunes');

        // El 18 de mayo de 2026 es lunes
        $sesion = $this->crearSesion($horario, $ficha, $instructor, '2026-05-18', 'cerrada');

        Sanctum::actingAs($instructor);

        $response = $this->getJson('/api/calendario?desde=2026-05-18&hasta=2026-05-18');

        $response->assertStatus(200);
        $eventos = $response->json();

        $this->assertCount(1, $eventos);
        $this->assertEquals($sesion->id,   $eventos[0]['sesion_id']);
        $this->assertEquals('cerrada',      $eventos[0]['sesion_estado']);
        $this->assertEquals('2026-05-18',   $eventos[0]['fecha']);
        $this->assertEquals($ficha->numero_ficha, $eventos[0]['numero_ficha']);
    }

    /** Eventos futuros proyectados no tienen sesion_id ni sesion_estado. */
    public function test_evento_futuro_sin_sesion_tiene_sesion_null(): void
    {
        $instructor = $this->crearInstructor();
        $ficha      = $this->crearFicha('2026-01-01', '2030-12-31');
        $jornada    = $this->crearJornada($ficha);
        $this->crearHorario($ficha, $jornada, $instructor, 'lunes');

        Sanctum::actingAs($instructor);

        // Usar un rango futuro donde no hay sesiones
        $response = $this->getJson('/api/calendario?desde=2029-01-01&hasta=2029-01-07');

        $response->assertStatus(200);
        $eventos = $response->json();

        $this->assertNotEmpty($eventos);
        // El primer lunes del rango (2029-01-01 es lunes)
        $primero = $eventos[0];
        $this->assertNull($primero['sesion_id'],    'Evento futuro sin sesión debe tener sesion_id null');
        $this->assertNull($primero['sesion_estado'], 'Evento futuro sin sesión debe tener sesion_estado null');
    }

    /** Horarios de una ficha inactiva no aparecen en el calendario. */
    public function test_ficha_inactiva_no_genera_eventos(): void
    {
        $instructor = $this->crearInstructor();
        $ficha      = $this->crearFicha('2026-01-01', '2026-12-31');
        $jornada    = $this->crearJornada($ficha);
        $this->crearHorario($ficha, $jornada, $instructor, 'lunes');

        // Desactivar la ficha
        $ficha->activo = 0;
        $ficha->save();

        Sanctum::actingAs($instructor);

        $response = $this->getJson('/api/calendario?desde=2026-05-01&hasta=2026-05-31');

        $response->assertStatus(200)
                 ->assertExactJson([]);
    }

    /** El rango máximo de 92 días se valida correctamente. */
    public function test_rango_mayor_a_92_dias_devuelve_error(): void
    {
        $instructor = $this->crearInstructor();
        Sanctum::actingAs($instructor);

        $response = $this->getJson('/api/calendario?desde=2026-01-01&hasta=2026-12-31');

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['hasta']);
    }

    /** Sin parámetros, usa el mes actual (respuesta 200 sin errores). */
    public function test_sin_parametros_usa_mes_actual(): void
    {
        $instructor = $this->crearInstructor();
        Sanctum::actingAs($instructor);

        $response = $this->getJson('/api/calendario');

        $response->assertStatus(200)
                 ->assertJsonIsArray();
    }

    /** Un instructor con múltiples fichas el mismo día de semana ve todos los eventos. */
    public function test_multiples_fichas_mismo_dia_genera_multiples_eventos(): void
    {
        $instructor = $this->crearInstructor();

        $ficha1  = $this->crearFicha('2026-01-01', '2026-12-31');
        $jornada1 = $this->crearJornada($ficha1, 'mañana');
        $this->crearHorario($ficha1, $jornada1, $instructor, 'martes');

        $ficha2  = $this->crearFicha('2026-01-01', '2026-12-31');
        $jornada2 = $this->crearJornada($ficha2, 'tarde');
        $this->crearHorario($ficha2, $jornada2, $instructor, 'martes');

        Sanctum::actingAs($instructor);

        // 2026-05-05 es martes (primer martes de mayo)
        $response = $this->getJson('/api/calendario?desde=2026-05-05&hasta=2026-05-05');

        $response->assertStatus(200);
        $eventos = $response->json();

        $this->assertCount(2, $eventos, 'Deben aparecer 2 eventos (uno por ficha) el mismo martes');
    }

    /** El gestor_grupo también puede consultar el calendario. */
    public function test_gestor_grupo_puede_ver_calendario(): void
    {
        $gestor = Usuario::create([
            'nombre'    => 'Gestor',
            'apellido'  => 'Test',
            'documento' => '10000003',
            'correo'    => 'gestor@test.com',
            'password'  => null,
            'rol'       => 'gestor_grupo',
            'activo'    => 1,
        ]);
        Sanctum::actingAs($gestor);

        $response = $this->getJson('/api/calendario?desde=2026-05-01&hasta=2026-05-31');

        $response->assertStatus(200)
                 ->assertJsonIsArray();
    }
}
