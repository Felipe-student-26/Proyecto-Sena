<?php

namespace Tests\Feature;

use App\Http\Middleware\EnsureTotpSessionOk;
use App\Models\Macrorregion;
use App\Models\Regional;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

// Tests de catálogos geográficos: GET /api/macrorregiones y GET /api/regionales
class MacrorregionRegionalTest extends TestCase
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
            'nombre'    => 'Admin',
            'apellido'  => 'Test',
            'documento' => '10000001',
            'correo'    => 'admin@test.com',
            'password'  => bcrypt('Password1!'),
            'rol'       => 'admin',
            'activo'    => 1,
        ]);
    }

    private function crearMacrorregion(string $nombre): Macrorregion
    {
        return Macrorregion::create(['nombre' => $nombre]);
    }

    private function crearRegional(Macrorregion $macro, string $nombre): Regional
    {
        return Regional::create([
            'nombre'          => $nombre,
            'macrorregion_id' => $macro->id,
        ]);
    }

    // ── /api/macrorregiones ───────────────────────────────────────────────────

    public function test_listado_macrorregiones_requiere_autenticacion(): void
    {
        $this->getJson('/api/macrorregiones')->assertStatus(401);
    }

    public function test_admin_puede_listar_macrorregiones(): void
    {
        $macro = $this->crearMacrorregion('Occidental');
        $this->crearRegional($macro, 'Caldas');

        Sanctum::actingAs($this->admin());

        $response = $this->getJson('/api/macrorregiones');

        $response->assertStatus(200)
                 ->assertJsonPath('data.0.nombre', 'Occidental')
                 ->assertJsonCount(1, 'data.0.regionales');
    }

    public function test_instructor_puede_listar_macrorregiones(): void
    {
        $this->crearMacrorregion('Centro');

        $instructor = Usuario::create([
            'nombre' => 'Ins', 'apellido' => 'T', 'documento' => '20000001',
            'correo' => 'ins@test.com', 'password' => null,
            'rol' => 'instructor', 'activo' => 1,
        ]);
        Sanctum::actingAs($instructor);

        $this->getJson('/api/macrorregiones')->assertStatus(200);
    }

    public function test_macrorregiones_incluyen_regionales_anidadas(): void
    {
        $macro = $this->crearMacrorregion('Norte');
        $this->crearRegional($macro, 'Atlántico');
        $this->crearRegional($macro, 'Bolívar');

        Sanctum::actingAs($this->admin());

        $response = $this->getJson('/api/macrorregiones');

        $response->assertStatus(200);
        $regionales = $response->json('data.0.regionales');
        $this->assertCount(2, $regionales);
    }

    // ── /api/regionales ───────────────────────────────────────────────────────

    public function test_listado_regionales_requiere_autenticacion(): void
    {
        $this->getJson('/api/regionales')->assertStatus(401);
    }

    public function test_admin_puede_listar_regionales(): void
    {
        $macro = $this->crearMacrorregion('Occidental');
        $this->crearRegional($macro, 'Caldas');
        $this->crearRegional($macro, 'Antioquia');

        Sanctum::actingAs($this->admin());

        $response = $this->getJson('/api/regionales');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_regionales_se_filtran_por_macrorregion(): void
    {
        $occ  = $this->crearMacrorregion('Occidental');
        $norte = $this->crearMacrorregion('Norte');

        $this->crearRegional($occ, 'Caldas');
        $this->crearRegional($norte, 'Atlántico');

        Sanctum::actingAs($this->admin());

        $response = $this->getJson('/api/regionales?macrorregion_id='.$occ->id);

        $response->assertStatus(200);
        $data = $response->json('data');
        $this->assertCount(1, $data);
        $this->assertEquals('Caldas', $data[0]['nombre']);
    }

    public function test_regional_incluye_macrorregion(): void
    {
        $macro = $this->crearMacrorregion('Suroriental');
        $this->crearRegional($macro, 'Amazonas');

        Sanctum::actingAs($this->admin());

        $response = $this->getJson('/api/regionales');

        $response->assertStatus(200);
        $this->assertEquals('Suroriental', $response->json('data.0.macrorregion.nombre'));
    }
}
