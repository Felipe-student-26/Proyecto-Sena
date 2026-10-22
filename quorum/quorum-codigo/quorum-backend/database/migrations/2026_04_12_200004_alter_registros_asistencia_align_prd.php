<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Alineación con PRD §5 tabla registros_asistencia:
// PRD usa: aprendiz_id (no usuario_id), activo, CHECK parcial
// Cambios:
// 1. Renombrar usuario_id → aprendiz_id (semánticamente más claro y coincide con PRD)
// 2. Agregar columna activo
// 3. Agregar CHECK constraint que fuerza horas_inasistencia solo si tipo='parcial'
// Nota: el CHECK en MySQL 8 se aplica al momento de INSERT/UPDATE
return new class extends Migration
{
    public function up(): void
    {
        // Esta migración usa sintaxis exclusiva de MySQL (information_schema, CHANGE COLUMN, CHECK)
        // En SQLite (tests) la tabla registros_asistencia ya tiene la estructura final; se omite
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        // Nombre de la BD conectada (no hardcodear el nombre del proyecto)
        $db = DB::connection()->getDatabaseName();

        // Eliminamos FK e índices usando SQL condicional (idempotente ante estados parciales)
        // Verificar y eliminar FK de sesion_id si existe
        $hasFkSesion = DB::select("
            SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME='registros_asistencia'
            AND CONSTRAINT_TYPE='FOREIGN KEY' AND CONSTRAINT_NAME='registros_asistencia_sesion_id_foreign'
        ", [$db]);
        if ($hasFkSesion) {
            DB::statement('ALTER TABLE registros_asistencia DROP FOREIGN KEY registros_asistencia_sesion_id_foreign');
        }

        // Verificar y eliminar UNIQUE uq_registro_sesion_usuario si existe
        $hasUnique = DB::select("
            SELECT INDEX_NAME FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME='registros_asistencia'
            AND INDEX_NAME='uq_registro_sesion_usuario'
            LIMIT 1
        ", [$db]);
        if ($hasUnique) {
            DB::statement('ALTER TABLE registros_asistencia DROP INDEX uq_registro_sesion_usuario');
        }

        // MariaDB/MySQL: no se puede DROP INDEX si una FK sigue usando ese índice
        $hasFkUsuario = DB::select("
            SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME='registros_asistencia'
            AND CONSTRAINT_TYPE='FOREIGN KEY' AND CONSTRAINT_NAME='registros_asistencia_usuario_id_foreign'
        ", [$db]);
        if ($hasFkUsuario) {
            DB::statement('ALTER TABLE registros_asistencia DROP FOREIGN KEY registros_asistencia_usuario_id_foreign');
        }

        // Verificar y eliminar índice simple usuario_id si existe
        $hasIdxUsuario = DB::select("
            SELECT INDEX_NAME FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME='registros_asistencia'
            AND INDEX_NAME='idx_registro_usuario'
            LIMIT 1
        ", [$db]);
        if ($hasIdxUsuario) {
            DB::statement('ALTER TABLE registros_asistencia DROP INDEX idx_registro_usuario');
        }

        // RENAME COLUMN no funciona en MariaDB — usamos CHANGE COLUMN con el mismo tipo
        DB::statement('ALTER TABLE registros_asistencia CHANGE COLUMN usuario_id aprendiz_id BIGINT(20) UNSIGNED NOT NULL');

        Schema::table('registros_asistencia', function (Blueprint $table) {
            // Restaurar FK sesion_id (fue eliminada arriba para poder tocar el UNIQUE)
            $table->foreign('sesion_id')
                  ->references('id')
                  ->on('sesiones')
                  ->cascadeOnDelete();

            // Restaurar FK con el nuevo nombre
            $table->foreign('aprendiz_id')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();

            // Restaurar UNIQUE con el nombre del PRD
            $table->unique(['sesion_id', 'aprendiz_id'], 'uq_sesion_aprendiz');

            // Índices del PRD
            $table->index('aprendiz_id', 'idx_aprendiz');
            $table->index('sesion_id', 'idx_sesion');

            // Agregar columna activo (soft delete a nivel de registro, como define el PRD)
            $table->tinyInteger('activo')->default(1)->after('horas_inasistencia');
        });

        // Agregar el CHECK constraint usando SQL puro (el Builder no lo soporta directamente)
        // Valida: si tipo='parcial' → horas_inasistencia debe ser NOT NULL y >= 1
        //         si tipo != 'parcial' → horas_inasistencia debe ser NULL
        DB::statement("
            ALTER TABLE registros_asistencia
            ADD CONSTRAINT chk_parcial CHECK (
                (tipo = 'parcial' AND horas_inasistencia IS NOT NULL AND horas_inasistencia >= 1)
                OR (tipo != 'parcial' AND horas_inasistencia IS NULL)
            )
        ");
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('ALTER TABLE registros_asistencia DROP CONSTRAINT chk_parcial');

        Schema::table('registros_asistencia', function (Blueprint $table) {
            $table->dropForeign(['aprendiz_id']);
            $table->dropUnique('uq_sesion_aprendiz');
            $table->dropIndex('idx_aprendiz');
            $table->dropIndex('idx_sesion');
            $table->dropColumn('activo');
        });

        DB::statement('ALTER TABLE registros_asistencia CHANGE COLUMN aprendiz_id usuario_id BIGINT(20) UNSIGNED NOT NULL');

        Schema::table('registros_asistencia', function (Blueprint $table) {
            $table->foreign('usuario_id')->references('id')->on('usuarios')->restrictOnDelete();
            $table->unique(['sesion_id', 'usuario_id'], 'uq_registro_sesion_usuario');
            $table->index('usuario_id', 'idx_registro_usuario');
        });
    }
};
