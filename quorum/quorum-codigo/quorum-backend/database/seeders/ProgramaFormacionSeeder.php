<?php

namespace Database\Seeders;

use App\Models\ProgramaFormacion;
use Illuminate\Database\Seeder;

class ProgramaFormacionSeeder extends Seeder
{
    public function run(): void
    {
        // Programas de formación SENA Regional Caldas 2026
        $programas = [
            // ── TECNÓLOGOS ──────────────────────────────────────────────
            // Centro de Automatización Industrial
            ['nombre' => 'Mantenimiento Mecánico Industrial',              'codigo' => 'MMI',  'tipo' => 'tecnologo'],
            ['nombre' => 'Análisis y Desarrollo de Software',              'codigo' => 'ADS',  'tipo' => 'tecnologo'],
            ['nombre' => 'Implementación de Sistemas IoT',                 'codigo' => 'IOT',  'tipo' => 'tecnologo'],
            // Centro para la Formación Cafetera
            ['nombre' => 'Control de Calidad en la Industria de Alimentos','codigo' => 'CCIA', 'tipo' => 'tecnologo'],
            ['nombre' => 'Prevención y Control Ambiental',                 'codigo' => 'PCA',  'tipo' => 'tecnologo'],
            ['nombre' => 'Coordinación de Sistemas Integrados de Gestión', 'codigo' => 'CSIG', 'tipo' => 'tecnologo'],
            // Centro Pecuario y Agroempresarial
            ['nombre' => 'Gestión de Sistemas Ganaderos Sostenibles',      'codigo' => 'GSGS', 'tipo' => 'tecnologo'],

            // ── TÉCNICOS ────────────────────────────────────────────────
            // Centro de Comercio y Servicios
            ['nombre' => 'Cocina',                                         'codigo' => 'COC',  'tipo' => 'tecnico'],
            ['nombre' => 'Atención Integral a la Primera Infancia',        'codigo' => 'AIPI', 'tipo' => 'tecnico'],
            // Centro de Automatización Industrial
            ['nombre' => 'Electricidad Industrial',                        'codigo' => 'EI',   'tipo' => 'tecnico'],
            ['nombre' => 'Operación de Torno y Fresadora',                 'codigo' => 'OTF',  'tipo' => 'tecnico'],
            // Centro de Procesos Industriales y Construcción
            ['nombre' => 'Electricidad Industrial (CPIC)',                 'codigo' => 'EI-CPIC', 'tipo' => 'tecnico'],
            ['nombre' => 'Operación de Torno y Fresadora (CPIC)',          'codigo' => 'OTF-CPIC','tipo' => 'tecnico'],
            ['nombre' => 'Construcción e Infraestructura',                 'codigo' => 'CI',   'tipo' => 'tecnico'],

            // ── OPERARIOS / AUXILIARES ───────────────────────────────────
            // Centro de Comercio y Servicios
            ['nombre' => 'Operario en Panadería',                          'codigo' => 'OPP',  'tipo' => 'operario'],
            ['nombre' => 'Auxiliar en Servicios de Bartender',             'codigo' => 'ASB',  'tipo' => 'auxiliar'],

            // ── COMPLEMENTARIA (disponible para ampliar) ─────────────────
            ['nombre' => 'Emprendimiento e Innovación',                    'codigo' => 'EMI',  'tipo' => 'complementaria'],
        ];

        foreach ($programas as $datos) {
            ProgramaFormacion::updateOrCreate(
                ['codigo' => $datos['codigo']],
                [
                    'nombre' => $datos['nombre'],
                    'tipo'   => $datos['tipo'],
                    'activo' => 1,
                ]
            );
        }
    }
}
