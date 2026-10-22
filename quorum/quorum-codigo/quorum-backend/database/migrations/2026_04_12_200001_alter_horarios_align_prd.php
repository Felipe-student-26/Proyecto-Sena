<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Alineación con PRD §5 tabla horarios:
// 1. FK ficha_id y jornada_ficha_id deben ser CASCADE (no RESTRICT) según PRD
// 2. Agregar UNIQUE(ficha_id, jornada_ficha_id, dia_semana) para evitar duplicar el mismo día
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('horarios', function (Blueprint $table) {
            // Eliminamos los índices FK actuales para poder recrearlos con CASCADE
            $table->dropForeign(['ficha_id']);
            $table->dropForeign(['jornada_ficha_id']);

            // Recreamos con ON DELETE CASCADE según PRD
            $table->foreign('ficha_id')
                  ->references('id')
                  ->on('fichas_caracterizacion')
                  ->cascadeOnDelete();

            $table->foreign('jornada_ficha_id')
                  ->references('id')
                  ->on('jornadas_ficha')
                  ->cascadeOnDelete();

            // Un horario no puede repetir el mismo día dentro de la misma ficha+jornada
            $table->unique(['ficha_id', 'jornada_ficha_id', 'dia_semana'], 'uq_ficha_jornada_dia');
        });
    }

    public function down(): void
    {
        Schema::table('horarios', function (Blueprint $table) {
            $table->dropUnique('uq_ficha_jornada_dia');
            $table->dropForeign(['ficha_id']);
            $table->dropForeign(['jornada_ficha_id']);

            $table->foreign('ficha_id')->references('id')->on('fichas_caracterizacion')->restrictOnDelete();
            $table->foreign('jornada_ficha_id')->references('id')->on('jornadas_ficha')->restrictOnDelete();
        });
    }
};
