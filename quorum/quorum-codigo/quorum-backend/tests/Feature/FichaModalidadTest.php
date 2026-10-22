<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureTotpSessionOk;
use App\Models\CentroFormacion;
use App\Models\FichaCaracterizacion;
use App\Models\ProgramaFormacion;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

// Tests de modalidad presencial/virtual en fichas de caracterización
class FichaModalidadTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(EnsureTotpSessionOk::class);
    }

    private function admin(): Usuario
    {
        return Usuario::create([
            'nombre' => 'Admin', 'apellido' => 'Test', 'documento' => '10000001',
            'correo' => 'admin@test.com', 'password' => bcrypt('Password1!'),
            'rol' => 'admin', 'activo' => 1,
        ]);
    }

    private function instructor(string $correo = 'ins@test.com'): Usuario
    {
        return Usuario::create([
            'nombre' => 'Ins', 'apellido' => 'T',
            'documento' => (string) rand(20000000, 29999999),
            'correo' => $correo, 'password' => null,
            'rol' => 'instructor', 'activo' => 1,
        ]);
    }

    private function centroId(): int
    {
        return DB::table('centros_formacion')->insertGetId(['nombre' => 'Centro Test']);
    }

    private function programaId(): int
    {
        return DB::table('programas_formacion')->insertGetId(['nombre' => 'Programa Test']);
    }

    private function payloadFicha(int $centroId, int $programaId, Usuario $instructor, string $modalidad = 'presencial'): array
    {
        return [
            'numero_ficha'          => (string) rand(1000000, 9999999),
            'estado'                => 'activa',
            'modalidad'             => $modalidad,
            'centro_formacion_id'   => $centroId,
            'programa_formacion_id' => $programaId,
            'fecha_inicio'          => '2026-01-01',
            'fecha_fin'             => '2026-12-31',
            'instructores'          => [['usuario_id' => $instructor->id, 'es_gestor' => true]],
            'jornadas'              => [
                [
                    'tipo'     => 'mañana',
                    'horarios' => [
                        [
                            'dia_semana'    => 'lunes',
                            'hora_inicio'   => '08:00',
                            'hora_fin'      => '12:00',
                            'instructor_id' => $instructor->id,
                        ],
                    ],
                ],
            ],
        ];
    }

    // ── Crear ficha ───────────────────────────────────────────────────────────

    public function test_ficha_se_crea_con_modalidad_presencial_por_defecto(): void
    {
        $admin      = $this->admin();
        $instructor = $this->instructor();
        $cId        = $this->centroId();
        $pId        = $this->programaId();

        $payload = $this->payloadFicha($cId, $pId, $instructor);
        unset($payload['modalidad']); // sin enviar modalidad → debe usar default

        Sanctum::actingAs($admin);
        $response = $this->postJson('/api/fichas', $payload);

        $response->assertStatus(201);
        $this->assertEquals('presencial', $response->json('data.modalidad'));
        $this->assertDatabaseHas('fichas_caracterizacion', [
            'modalidad' => 'presencial',
        ]);
    }

    public function test_ficha_se_crea_con_modalidad_virtual(): void
    {
        $admin      = $this->admin();
        $instructor = $this->instructor();
        $cId        = $this->centroId();
        $pId        = $this->programaId();

        Sanctum::actingAs($admin);
        $response = $this->postJson('/api/fichas', $this->payloadFicha($cId, $pId, $instructor, 'virtual'));

        $response->assertStatus(201)
                 ->assertJsonPath('data.modalidad', 'virtual');

        $this->assertDatabaseHas('fichas_caracterizacion', ['modalidad' => 'virtual']);
    }

    public function test_modalidad_invalida_devuelve_422(): void
    {
        $admin      = $this->admin();
        $instructor = $this->instructor();
        $cId        = $this->centroId();
        $pId        = $this->programaId();

        $payload = $this->payloadFicha($cId, $pId, $instructor, 'hibrida');

        Sanctum::actingAs($admin);
        $this->postJson('/api/fichas', $payload)
             ->assertStatus(422)
             ->assertJsonValidationErrors(['modalidad']);
    }

    // ── Show ──────────────────────────────────────────────────────────────────

    public function test_detalle_ficha_incluye_modalidad(): void
    {
        $admin      = $this->admin();
        $instructor = $this->instructor();
        $cId        = $this->centroId();
        $pId        = $this->programaId();

        Sanctum::actingAs($admin);
        $crear = $this->postJson('/api/fichas', $this->payloadFicha($cId, $pId, $instructor, 'virtual'));
        $id    = $crear->json('id');

        $response = $this->getJson('/api/fichas/'.$id);
        $response->assertStatus(200)
                 ->assertJsonPath('data.modalidad', 'virtual');
    }

    // ── Update ────────────────────────────────────────────────────────────────

    public function test_actualizar_modalidad_de_ficha(): void
    {
        $admin      = $this->admin();
        $instructor = $this->instructor();
        $cId        = $this->centroId();
        $pId        = $this->programaId();

        Sanctum::actingAs($admin);
        $crear = $this->postJson('/api/fichas', $this->payloadFicha($cId, $pId, $instructor, 'presencial'));
        $id    = $crear->json('id');

        $payload           = $this->payloadFicha($cId, $pId, $instructor, 'virtual');
        $payload['numero_ficha'] = $crear->json('data.numero_ficha');

        $this->putJson('/api/fichas/'.$id, $payload)
             ->assertStatus(200)
             ->assertJsonPath('data.modalidad', 'virtual');

        $this->assertDatabaseHas('fichas_caracterizacion', ['id' => $id, 'modalidad' => 'virtual']);
    }

    // ── Detalle incluye regional ───────────────────────────────────────────────

    public function test_detalle_ficha_incluye_regional_del_centro(): void
    {
        $macro   = \App\Models\Macrorregion::create(['nombre' => 'Occidental']);
        $regional = \App\Models\Regional::create(['nombre' => 'Caldas', 'macrorregion_id' => $macro->id]);

        $centro = CentroFormacion::create([
            'nombre'      => 'Centro CAI',
            'regional_id' => $regional->id,
            'activo'      => 1,
        ]);
        $programa = ProgramaFormacion::create(['nombre' => 'ADS', 'activo' => 1]);

        $admin      = $this->admin();
        $instructor = $this->instructor();

        Sanctum::actingAs($admin);
        $crear = $this->postJson('/api/fichas', $this->payloadFicha($centro->id, $programa->id, $instructor));
        $id    = $crear->json('id');

        $response = $this->getJson('/api/fichas/'.$id);
        $response->assertStatus(200);
        $this->assertEquals('Caldas', $response->json('data.regional.nombre'));
    }
}
