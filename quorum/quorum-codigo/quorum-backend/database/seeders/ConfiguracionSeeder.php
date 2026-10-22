<?php

namespace Database\Seeders;

use App\Models\Configuracion;
use Illuminate\Database\Seeder;

// Configuraciones iniciales exactamente como las define el PRD §5 (INSERT INTO configuracion)
class ConfiguracionSeeder extends Seeder
{
    public function run(): void
    {
        $configuraciones = [
            [
                'clave'       => 'nombre_sistema',
                'valor'       => 'QUORUM',
                'descripcion' => 'Nombre del sistema',
            ],
            [
                'clave'       => 'nombre_institucion',
                'valor'       => 'SENA - Centro CPIC',
                'descripcion' => 'Nombre del centro de formación',
            ],
            [
                'clave'       => 'timeout_sesion',
                'valor'       => '30',
                'descripcion' => 'Minutos de inactividad antes de cerrar sesión',
            ],
            [
                'clave'       => 'max_intentos_login',
                'valor'       => '5',
                'descripcion' => 'Intentos fallidos antes de bloqueo temporal',
            ],
            [
                'clave'       => 'minutos_bloqueo',
                'valor'       => '15',
                'descripcion' => 'Minutos de bloqueo tras intentos fallidos',
            ],
            [
                'clave'       => 'version',
                'valor'       => '1.0',
                'descripcion' => 'Versión del sistema',
            ],
        ];

        foreach ($configuraciones as $config) {
            Configuracion::updateOrCreate(
                ['clave' => $config['clave']],
                $config
            );
        }
    }
}
