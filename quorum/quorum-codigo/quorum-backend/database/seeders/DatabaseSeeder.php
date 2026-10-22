<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

// Seeder principal — llama a todos los seeders en el orden correcto
// El orden es importante porque algunos seeders dependen de datos de otros
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            // 1. Jerarquía geográfica SENA (sin dependencias)
            MacrorregionSeeder::class,
            RegionalSeeder::class,

            // 2. Catálogos base (dependen de regionales)
            CentroFormacionSeeder::class,
            ProgramaFormacionSeeder::class,

            // 3. Usuarios de prueba (exactamente los del PRD §5 y §22)
            UsuarioSeeder::class,

            // 4. Configuración inicial del sistema (claves del PRD §5)
            ConfiguracionSeeder::class,

            // 5. Días festivos Colombia 2026 (PRD §5)
            DiaFestivoSeeder::class,
        ]);
    }
}
