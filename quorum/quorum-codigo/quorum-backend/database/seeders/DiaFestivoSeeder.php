<?php

namespace Database\Seeders;

use App\Models\DiaFestivo;
use Illuminate\Database\Seeder;

// Días festivos Colombia 2026 — exactamente los del PRD §5 (INSERT INTO dias_festivos)
class DiaFestivoSeeder extends Seeder
{
    public function run(): void
    {
        $festivos = [
            ['fecha' => '2026-01-01', 'descripcion' => 'Año Nuevo'],
            ['fecha' => '2026-01-12', 'descripcion' => 'Día de los Reyes Magos'],
            ['fecha' => '2026-03-23', 'descripcion' => 'Día de San José'],
            ['fecha' => '2026-04-02', 'descripcion' => 'Jueves Santo'],
            ['fecha' => '2026-04-03', 'descripcion' => 'Viernes Santo'],
            ['fecha' => '2026-05-01', 'descripcion' => 'Día del Trabajo'],
            ['fecha' => '2026-05-14', 'descripcion' => 'Ascensión del Señor'],
            ['fecha' => '2026-06-04', 'descripcion' => 'Corpus Christi'],
            ['fecha' => '2026-06-11', 'descripcion' => 'Sagrado Corazón'],
            ['fecha' => '2026-06-29', 'descripcion' => 'San Pedro y San Pablo'],
            ['fecha' => '2026-07-20', 'descripcion' => 'Día de la Independencia'],
            ['fecha' => '2026-08-07', 'descripcion' => 'Batalla de Boyacá'],
            ['fecha' => '2026-08-17', 'descripcion' => 'Asunción de la Virgen'],
            ['fecha' => '2026-10-12', 'descripcion' => 'Día de la Raza'],
            ['fecha' => '2026-11-02', 'descripcion' => 'Todos los Santos'],
            ['fecha' => '2026-11-16', 'descripcion' => 'Independencia de Cartagena'],
            ['fecha' => '2026-12-08', 'descripcion' => 'Inmaculada Concepción'],
            ['fecha' => '2026-12-25', 'descripcion' => 'Navidad'],
        ];

        foreach ($festivos as $festivo) {
            DiaFestivo::updateOrCreate(
                ['fecha' => $festivo['fecha']],
                ['descripcion' => $festivo['descripcion'], 'activo' => 1]
            );
        }
    }
}
