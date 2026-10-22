<?php

namespace Database\Seeders;

use App\Models\Macrorregion;
use Illuminate\Database\Seeder;

class MacrorregionSeeder extends Seeder
{
    public function run(): void
    {
        $macrorregiones = [
            'Centro',
            'Norte',
            'Occidental',
            'Oriental',
            'Suroriental',
        ];

        foreach ($macrorregiones as $nombre) {
            Macrorregion::firstOrCreate(['nombre' => $nombre]);
        }
    }
}
