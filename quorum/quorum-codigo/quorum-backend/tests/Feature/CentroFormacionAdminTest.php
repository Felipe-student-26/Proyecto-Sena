<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureTotpSessionOk;
use App\Models\CentroFormacion;
use App\Models\Macrorregion;
use App\Models\Regional;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

// Tests del CRUD de centros de formación con regional_id (solo admin)
class CentroFormacionAdminTest extends TestCase
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

    private function crearRegional(): Regional
    {
        $macro = Macrorregion::create(['nombre' => 'Occidental']);
        return Regional::create(['nombre' => 'Caldas', 'macrorregion_id' => $macro->id]);
    }

    // ── index ─────────────────────────────────────────────────────────────────

    public function test_no_admin_no_puede_listar_centros_admin(): void
    {
        $coordinador = Usuario::create([
            'nombre' => 'Coord', 'apellido' => 'T', 'documento' => '20000001',
            'correo' => 'coord@test.com', 'password' => null,
            'rol' => 'coordinador', 'activo' => 1,
        ]);
        Sanctum::actingAs($coordinador);

        $this->getJson('/api/admin/centros-formacion')->assertStatus(403);
    }

    public function test_admin_lista_centros_con_regional(): void
    {
        $regional = $this->crearRegional();
        CentroFormacion::create([
            'nombre' => 'Centro Prueba', 'codigo' => 'CP',
            'regional_id' => $regional->id, 'activo' => 1,
        ]);

        Sanctum::actingAs($this->admin());

        $response = $this->getJson('/api/admin/centros-formacion');

        $response->assertStatus(200);
        $this->assertEquals('Caldas', $response->json('data.0.regional.nombre'));
    }

    // ── store ─────────────────────────────────────────────────────────────────

    public function test_admin_puede_crear_centro_con_regional(): void
    {
        $regional = $this->crearRegional();
        Sanctum::actingAs($this->admin());

        $response = $this->postJson('/api/admin/centros-formacion', [
            'nombre'      => 'Nuevo Centro',
            'codigo'      => 'NC',
            'regional_id' => $regional->id,
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.nombre', 'Nuevo Centro');

        $this->assertDatabaseHas('centros_formacion', [
            'nombre'      => 'Nuevo Centro',
            'regional_id' => $regional->id,
        ]);
    }

    public function test_admin_puede_crear_centro_sin_regional(): void
    {
        Sanctum::actingAs($this->admin());

        $response = $this->postJson('/api/admin/centros-formacion', [
            'nombre' => 'Centro Sin Regional',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('centros_formacion', ['nombre' => 'Centro Sin Regional', 'regional_id' => null]);
    }

    public function test_regional_id_invalido_devuelve_422(): void
    {
        Sanctum::actingAs($this->admin());

        $this->postJson('/api/admin/centros-formacion', [
            'nombre'      => 'Centro Mal',
            'regional_id' => 99999,
        ])->assertStatus(422)->assertJsonValidationErrors(['regional_id']);
    }

    // ── update ────────────────────────────────────────────────────────────────

    public function test_admin_puede_actualizar_regional_de_centro(): void
    {
        $regional1 = $this->crearRegional();
        $macro2    = Macrorregion::create(['nombre' => 'Norte']);
        $regional2 = Regional::create(['nombre' => 'Atlántico', 'macrorregion_id' => $macro2->id]);

        $centro = CentroFormacion::create([
            'nombre' => 'C1', 'regional_id' => $regional1->id, 'activo' => 1,
        ]);

        Sanctum::actingAs($this->admin());

        $this->putJson('/api/admin/centros-formacion/'.$centro->id, [
            'nombre'      => 'C1 Actualizado',
            'regional_id' => $regional2->id,
        ])->assertStatus(200);

        $this->assertDatabaseHas('centros_formacion', [
            'id'          => $centro->id,
            'regional_id' => $regional2->id,
        ]);
    }

    // ── destroy / reactivar ───────────────────────────────────────────────────

    public function test_desactivar_centro_activo(): void
    {
        $centro = CentroFormacion::create(['nombre' => 'C', 'activo' => 1]);
        Sanctum::actingAs($this->admin());

        $this->deleteJson('/api/admin/centros-formacion/'.$centro->id)
             ->assertStatus(200);

        $this->assertDatabaseHas('centros_formacion', ['id' => $centro->id, 'activo' => 0]);
    }

    public function test_reactivar_centro_inactivo(): void
    {
        $centro = CentroFormacion::create(['nombre' => 'C2', 'activo' => 0]);
        Sanctum::actingAs($this->admin());

        $this->postJson('/api/admin/centros-formacion/'.$centro->id.'/reactivar')
             ->assertStatus(200);

        $this->assertDatabaseHas('centros_formacion', ['id' => $centro->id, 'activo' => 1]);
    }
}
