<?php

namespace Database\Seeders;

use App\Models\Macrorregion;
use App\Models\Regional;
use Illuminate\Database\Seeder;

class RegionalSeeder extends Seeder
{
    public function run(): void
    {
        // Las 33 regionales del SENA organizadas por macrorregión
        $datos = [
            'Centro' => [
                'Boyacá',
                'Cundinamarca',
                'Distrito Capital',
                'Huila',
                'Norte de Santander',
                'Santander',
                'Tolima',
            ],
            'Norte' => [
                'Atlántico',
                'Bolívar',
                'César',
                'Córdoba',
                'Guajira',
                'Magdalena',
                'San Andrés',
                'Sucre',
            ],
            'Occidental' => [
                'Antioquia',
                'Caldas',
                'Cauca',
                'Chocó',
                'Nariño',
                'Quindío',
                'Risaralda',
                'Valle',
            ],
            'Oriental' => [
                'Arauca',
                'Casanare',
                'Meta',
                'Vichada',
            ],
            'Suroriental' => [
                'Amazonas',
                'Caquetá',
                'Guainía',
                'Guaviare',
                'Putumayo',
                'Vaupés',
            ],
        ];

        foreach ($datos as $macro => $regionales) {
            $macrorregion = Macrorregion::where('nombre', $macro)->first();

            if (! $macrorregion) {
                continue;
            }

            foreach ($regionales as $nombre) {
                Regional::firstOrCreate(
                    ['nombre' => $nombre],
                    ['macrorregion_id' => $macrorregion->id]
                );
            }
        }
    }
}
