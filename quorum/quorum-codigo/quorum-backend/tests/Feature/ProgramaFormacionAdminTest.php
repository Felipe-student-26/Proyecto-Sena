<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureTotpSessionOk;
use App\Models\ProgramaFormacion;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

// Tests del CRUD de programas de formación con tipo (solo admin)
class ProgramaFormacionAdminTest extends TestCase
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

    // ── index ─────────────────────────────────────────────────────────────────

    public function test_no_admin_no_puede_acceder(): void
    {
        $coordinador = Usuario::create([
            'nombre' => 'C', 'apellido' => 'T', 'documento' => '20000001',
            'correo' => 'c@test.com', 'password' => null,
            'rol' => 'coordinador', 'activo' => 1,
        ]);
        Sanctum::actingAs($coordinador);
        $this->getJson('/api/admin/programas-formacion')->assertStatus(403);
    }

    public function test_admin_lista_programas(): void
    {
        ProgramaFormacion::create(['nombre' => 'Cocina', 'codigo' => 'COC', 'tipo' => 'tecnico', 'activo' => 1]);

        Sanctum::actingAs($this->admin());
        $response = $this->getJson('/api/admin/programas-formacion');

        $response->assertStatus(200);
        $this->assertEquals('Cocina', $response->json('data.0.nombre'));
        $this->assertEquals('tecnico', $response->json('data.0.tipo'));
    }

    // ── store ─────────────────────────────────────────────────────────────────

    public function test_admin_crea_programa_con_tipo(): void
    {
        Sanctum::actingAs($this->admin());

        $response = $this->postJson('/api/admin/programas-formacion', [
            'nombre' => 'Análisis y Desarrollo de Software',
            'codigo' => 'ADS',
            'tipo'   => 'tecnologo',
        ]);

        $response->assertStatus(201)->assertJsonPath('data.tipo', 'tecnologo');
        $this->assertDatabaseHas('programas_formacion', ['codigo' => 'ADS', 'tipo' => 'tecnologo']);
    }

    public function test_tipo_invalido_devuelve_422(): void
    {
        Sanctum::actingAs($this->admin());

        $this->postJson('/api/admin/programas-formacion', [
            'nombre' => 'X',
            'tipo'   => 'magister',
        ])->assertStatus(422)->assertJsonValidationErrors(['tipo']);
    }

    public function test_codigo_duplicado_devuelve_422(): void
    {
        ProgramaFormacion::create(['nombre' => 'A', 'codigo' => 'DUP', 'activo' => 1]);

        Sanctum::actingAs($this->admin());

        $this->postJson('/api/admin/programas-formacion', [
            'nombre' => 'B',
            'codigo' => 'DUP',
        ])->assertStatus(422)->assertJsonValidationErrors(['codigo']);
    }

    public function test_admin_crea_programa_sin_tipo(): void
    {
        Sanctum::actingAs($this->admin());

        $response = $this->postJson('/api/admin/programas-formacion', [
            'nombre' => 'Programa Genérico',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('programas_formacion', ['nombre' => 'Programa Genérico', 'tipo' => null]);
    }

    // ── update ────────────────────────────────────────────────────────────────

    public function test_admin_actualiza_tipo_de_programa(): void
    {
        $prog = ProgramaFormacion::create(['nombre' => 'X', 'tipo' => 'tecnico', 'activo' => 1]);

        Sanctum::actingAs($this->admin());

        $this->putJson('/api/admin/programas-formacion/'.$prog->id, [
            'nombre' => 'X',
            'tipo'   => 'tecnologo',
        ])->assertStatus(200);

        $this->assertDatabaseHas('programas_formacion', ['id' => $prog->id, 'tipo' => 'tecnologo']);
    }

    // ── destroy / reactivar ───────────────────────────────────────────────────

    public function test_desactivar_programa_activo(): void
    {
        $prog = ProgramaFormacion::create(['nombre' => 'P', 'activo' => 1]);
        Sanctum::actingAs($this->admin());

        $this->deleteJson('/api/admin/programas-formacion/'.$prog->id)->assertStatus(200);
        $this->assertDatabaseHas('programas_formacion', ['id' => $prog->id, 'activo' => 0]);
    }

    public function test_reactivar_programa_inactivo(): void
    {
        $prog = ProgramaFormacion::create(['nombre' => 'P2', 'activo' => 0]);
        Sanctum::actingAs($this->admin());

        $this->postJson('/api/admin/programas-formacion/'.$prog->id.'/reactivar')->assertStatus(200);
        $this->assertDatabaseHas('programas_formacion', ['id' => $prog->id, 'activo' => 1]);
    }

    // ── catálogo público con tipo ─────────────────────────────────────────────

    public function test_catalogo_publico_incluye_tipo(): void
    {
        ProgramaFormacion::create(['nombre' => 'Electricidad', 'tipo' => 'tecnico', 'activo' => 1]);

        // El catálogo de programas-formacion es accesible solo por admin (para el formulario de fichas)
        Sanctum::actingAs($this->admin());

        $response = $this->getJson('/api/programas-formacion');
        $response->assertStatus(200);
        $this->assertEquals('tecnico', $response->json('data.0.tipo'));
    }

    public function test_instructor_no_puede_listar_catalogo_programas(): void
    {
        $instructor = Usuario::create([
            'nombre' => 'Ins', 'apellido' => 'T', 'documento' => '20000002',
            'correo' => 'ins@test.com', 'password' => null,
            'rol' => 'instructor', 'activo' => 1,
        ]);
        Sanctum::actingAs($instructor);

        // La policy solo permite admin en viewAny
        $this->getJson('/api/programas-formacion')->assertStatus(403);
    }
}
