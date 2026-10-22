<?php

namespace Database\Seeders;

use App\Models\CentroFormacion;
use App\Models\Regional;
use Illuminate\Database\Seeder;

class CentroFormacionSeeder extends Seeder
{
    public function run(): void
    {
        // Centros de formación de la Regional Caldas (Seccional Caldas)
        $regional = Regional::where('nombre', 'Caldas')->first();

        $centros = [
            ['nombre' => 'Centro para la Formación Cafetera',             'codigo' => 'CFC'],
            ['nombre' => 'Centro de Comercio y Servicios',                'codigo' => 'CCS'],
            ['nombre' => 'Centro de Procesos Industriales y Construcción','codigo' => 'CPIC'],
            ['nombre' => 'Centro Pecuario y Agroempresarial',             'codigo' => 'CPA'],
            ['nombre' => 'Centro de Automatización Industrial',           'codigo' => 'CAI'],
        ];

        foreach ($centros as $datos) {
            CentroFormacion::updateOrCreate(
                ['codigo' => $datos['codigo']],
                [
                    'nombre'      => $datos['nombre'],
                    'regional_id' => $regional?->id,
                    'activo'      => 1,
                ]
            );
        }
    }
}
