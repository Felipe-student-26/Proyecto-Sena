<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Alineación con PRD §5 tabla historial_actividad:
// PRD define usuario_id como NULL (sin FK) — permite registrar eventos del sistema
// sin usuario autenticado (ej: intentos de acceso de bots, errores de sistema)
// La versión M0 tenía usuario_id NOT NULL con FK
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('historial_actividad', function (Blueprint $table) {
            // Eliminar FK para permitir usuario_id NULL (como en el PRD)
            $table->dropForeign(['usuario_id']);

            // Hacer la columna nullable
            $table->unsignedBigInteger('usuario_id')->nullable()->change();

            // Eliminar índices anteriores y restaurar los del PRD
            $table->dropIndex('idx_historial_usuario');
            $table->dropIndex('idx_historial_accion');
            $table->dropIndex('idx_historial_fecha');

            // Índices del PRD (usuario y fecha)
            $table->index('usuario_id', 'idx_usuario');
            $table->index('creado_en', 'idx_fecha');
        });
    }

    public function down(): void
    {
        Schema::table('historial_actividad', function (Blueprint $table) {
            $table->dropIndex('idx_usuario');
            $table->dropIndex('idx_fecha');

            $table->unsignedBigInteger('usuario_id')->nullable(false)->change();

            $table->foreign('usuario_id')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();

            $table->index('usuario_id', 'idx_historial_usuario');
            $table->index('accion', 'idx_historial_accion');
            $table->index('creado_en', 'idx_historial_fecha');
        });
    }
};
