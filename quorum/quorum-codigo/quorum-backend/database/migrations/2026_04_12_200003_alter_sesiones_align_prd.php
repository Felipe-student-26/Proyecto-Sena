<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Alineación con PRD §5 tabla sesiones:
// PRD define: ficha_id, horario_id, fecha, instructor_id, horas_programadas, estado
// La versión M0 solo tenía: horario_id, fecha, estado, tomado_por (nullable)
// Cambios:
// 1. Agregar ficha_id (NOT NULL con FK → fichas_caracterizacion CASCADE)
// 2. Agregar instructor_id (NOT NULL con FK → usuarios RESTRICT) — reemplaza tomado_por nullable
// 3. Agregar horas_programadas (TINYINT UNSIGNED NOT NULL)
// 4. Eliminar tomado_por (se migra a instructor_id antes de eliminar)
// 5. Agregar UNIQUE(horario_id, fecha) — no puede haber dos sesiones del mismo horario en la misma fecha
// 6. Agregar índices (ficha_id, fecha) e (instructor_id, fecha) según PRD
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sesiones', function (Blueprint $table) {
            // Agregar las columnas nuevas como nullable primero
            // (porque puede haber filas existentes en desarrollo)
            $table->unsignedBigInteger('ficha_id')->nullable()->after('id');
            $table->unsignedBigInteger('instructor_id')->nullable()->after('horario_id');
            $table->tinyInteger('horas_programadas')->unsigned()->nullable()->after('instructor_id');
        });

        // Copiar tomado_por → instructor_id en filas existentes antes de poner NOT NULL
        // El UPDATE ... JOIN es sintaxis MySQL; en SQLite (tests) la tabla ya está vacía, se omite
        if (\Illuminate\Support\Facades\DB::connection()->getDriverName() === 'mysql') {
            \Illuminate\Support\Facades\DB::statement('
                UPDATE sesiones s
                JOIN horarios h ON h.id = s.horario_id
                SET s.ficha_id         = h.ficha_id,
                    s.instructor_id    = COALESCE(s.tomado_por, h.instructor_id),
                    s.horas_programadas = h.horas_programadas
            ');
        }

        Schema::table('sesiones', function (Blueprint $table) {
            // Ahora que las filas tienen datos, ponemos NOT NULL
            $table->unsignedBigInteger('ficha_id')->nullable(false)->change();
            $table->unsignedBigInteger('instructor_id')->nullable(false)->change();
            $table->tinyInteger('horas_programadas')->unsigned()->nullable(false)->change();

            // FK ficha_id → fichas_caracterizacion CASCADE
            $table->foreign('ficha_id')
                  ->references('id')
                  ->on('fichas_caracterizacion')
                  ->cascadeOnDelete();

            // FK instructor_id → usuarios RESTRICT
            $table->foreign('instructor_id')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();

            // UNIQUE: un solo registro por horario+fecha
            $table->unique(['horario_id', 'fecha'], 'uq_sesion_fecha_horario');

            // Índices adicionales del PRD
            $table->index(['ficha_id', 'fecha'], 'idx_ficha_fecha');
            $table->index(['instructor_id', 'fecha'], 'idx_instructor_fecha');

            // Eliminar tomado_por (ya fue migrado a instructor_id)
            $table->dropForeign(['tomado_por']);
            $table->dropColumn('tomado_por');

            // Eliminar el índice antiguo de fecha simple (lo reemplaza idx_ficha_fecha)
            $table->dropIndex('idx_sesion_fecha');
        });
    }

    public function down(): void
    {
        Schema::table('sesiones', function (Blueprint $table) {
            $table->dropUnique('uq_sesion_fecha_horario');
            $table->dropIndex('idx_ficha_fecha');
            $table->dropIndex('idx_instructor_fecha');
            $table->dropForeign(['ficha_id']);
            $table->dropForeign(['instructor_id']);
            $table->dropColumn(['ficha_id', 'instructor_id', 'horas_programadas']);

            // Restaurar tomado_por
            $table->unsignedBigInteger('tomado_por')->nullable();
            $table->foreign('tomado_por')->references('id')->on('usuarios')->nullOnDelete();
            $table->index('fecha', 'idx_sesion_fecha');
        });
    }
};
