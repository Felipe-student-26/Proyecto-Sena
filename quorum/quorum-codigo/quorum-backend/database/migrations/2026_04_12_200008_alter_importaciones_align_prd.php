<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Alineación con PRD §5 tabla importaciones_aprendices:
// La tabla M0 NO creó las FK reales (solo tenía índices sueltos)
// Cambios:
// 1. Renombrar usuario_id → importado_por (con CHANGE COLUMN para MariaDB)
// 2. Renombrar índice y crear FK reales según PRD
// La columna errores JSON extra se mantiene (aporta utilidad, PRD no la prohíbe)
return new class extends Migration
{
    public function up(): void
    {
        // Esta migración usa información_schema y CHANGE COLUMN, exclusivos de MySQL
        // En SQLite (tests) la tabla ya tiene la estructura final; se omite
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        $db = DB::connection()->getDatabaseName();

        // Quitar FK existentes antes de renombrar columna o volver a crear restricciones
        // (no usar DROP INDEX sobre el nombre de la FK: MariaDB/MySQL lo rechaza)
        $fks = [
            'importaciones_aprendices_usuario_id_foreign',
            'importaciones_aprendices_ficha_id_foreign',
        ];
        foreach ($fks as $nombreFk) {
            $existe = DB::select("
                SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME='importaciones_aprendices'
                AND CONSTRAINT_TYPE='FOREIGN KEY' AND CONSTRAINT_NAME = ?
            ", [$db, $nombreFk]);
            if ($existe) {
                DB::statement("ALTER TABLE importaciones_aprendices DROP FOREIGN KEY `{$nombreFk}`");
            }
        }

        // Renombrar columna usuario_id → importado_por (CHANGE COLUMN para MariaDB)
        DB::statement('ALTER TABLE importaciones_aprendices CHANGE COLUMN usuario_id importado_por BIGINT(20) UNSIGNED NOT NULL');

        // FK según PRD: ficha en CASCADE, quien importó en RESTRICT
        Schema::table('importaciones_aprendices', function (Blueprint $table) {
            $table->foreign('ficha_id')
                  ->references('id')
                  ->on('fichas_caracterizacion')
                  ->cascadeOnDelete();

            $table->foreign('importado_por')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();
        });
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        Schema::table('importaciones_aprendices', function (Blueprint $table) {
            $table->dropForeign(['importado_por']);
            $table->dropForeign(['ficha_id']);
        });

        DB::statement('ALTER TABLE importaciones_aprendices CHANGE COLUMN importado_por usuario_id BIGINT(20) UNSIGNED NOT NULL');

        Schema::table('importaciones_aprendices', function (Blueprint $table) {
            $table->index('usuario_id', 'importaciones_aprendices_usuario_id_foreign');
        });
    }
};
