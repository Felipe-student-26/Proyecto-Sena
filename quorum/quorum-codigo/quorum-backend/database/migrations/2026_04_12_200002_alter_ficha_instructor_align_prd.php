<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Alineación con PRD §5 tabla ficha_instructor:
// 1. Agregar columna activo (PRD la incluye explícitamente)
// 2. FK usuario_id debe ser CASCADE según PRD (ON DELETE CASCADE)
// 3. Agregar INDEX (ficha_id, es_gestor) para consultas de gestor
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ficha_instructor', function (Blueprint $table) {
            // Agregar columna activo que el PRD define
            $table->tinyInteger('activo')->default(1)->after('es_gestor');

            // Cambiar FK usuario_id de RESTRICT a CASCADE según PRD
            $table->dropForeign(['usuario_id']);
            $table->foreign('usuario_id')
                  ->references('id')
                  ->on('usuarios')
                  ->cascadeOnDelete();

            // Índice para consultar rápido qué instructor es gestor de qué ficha
            $table->index(['ficha_id', 'es_gestor'], 'idx_gestor');
        });
    }

    public function down(): void
    {
        Schema::table('ficha_instructor', function (Blueprint $table) {
            $table->dropIndex('idx_gestor');
            $table->dropForeign(['usuario_id']);
            $table->foreign('usuario_id')->references('id')->on('usuarios')->restrictOnDelete();
            $table->dropColumn('activo');
        });
    }
};
