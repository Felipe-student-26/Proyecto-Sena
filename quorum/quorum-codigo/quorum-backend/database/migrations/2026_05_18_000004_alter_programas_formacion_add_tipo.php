<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Agrega el nivel/tipo de formación a los programas del SENA
// Valores: tecnico, tecnologo, operario, auxiliar, especializacion, complementaria
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programas_formacion', function (Blueprint $table) {
            $table->enum('tipo', [
                'tecnico',
                'tecnologo',
                'operario',
                'auxiliar',
                'especializacion',
                'complementaria',
            ])->nullable()->after('codigo');

            $table->index('tipo', 'idx_programas_tipo');
        });
    }

    public function down(): void
    {
        Schema::table('programas_formacion', function (Blueprint $table) {
            $table->dropIndex('idx_programas_tipo');
            $table->dropColumn('tipo');
        });
    }
};
