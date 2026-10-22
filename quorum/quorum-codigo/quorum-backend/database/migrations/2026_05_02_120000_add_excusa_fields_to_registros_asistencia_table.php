<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registros_asistencia', function (Blueprint $table) {
            $table->text('excusa_motivo')->nullable()->after('horas_inasistencia');
            $table->string('excusa_evidencia_path', 512)->nullable()->after('excusa_motivo');
            $table->string('excusa_evidencia_nombre_original', 255)->nullable()->after('excusa_evidencia_path');
        });
    }

    public function down(): void
    {
        Schema::table('registros_asistencia', function (Blueprint $table) {
            $table->dropColumn([
                'excusa_motivo',
                'excusa_evidencia_path',
                'excusa_evidencia_nombre_original',
            ]);
        });
    }
};
