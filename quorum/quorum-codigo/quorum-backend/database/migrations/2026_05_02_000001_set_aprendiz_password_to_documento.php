<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('usuarios')
            ->select(['id', 'documento'])
            ->where('rol', 'aprendiz')
            ->where(function ($q) {
                $q->whereNull('password')->orWhere('password', '');
            })
            ->orderBy('id')
            ->chunkById(500, function ($rows) {
                foreach ($rows as $row) {
                    $doc = (string) ($row->documento ?? '');
                    if ($doc === '') {
                        continue;
                    }
                    DB::table('usuarios')
                        ->where('id', (int) $row->id)
                        ->update(['password' => Hash::make($doc)]);
                }
            }, 'id');
    }

    public function down(): void
    {
        // No-op: no es seguro revertir porque el usuario puede haber cambiado su contraseña.
    }
};
