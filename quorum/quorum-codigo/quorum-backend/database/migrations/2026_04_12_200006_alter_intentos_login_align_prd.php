<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Alineación con PRD §5 tabla intentos_login:
// PRD NO incluye usuario_id — solo registra correo + ip + exitoso + creado_en
// Esto simplifica la tabla y permite registrar intentos con correos que no existen
// PRD tiene índice compuesto (correo, creado_en) y ip NOT NULL
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('intentos_login', function (Blueprint $table) {
            // Eliminar FK y columna usuario_id (no está en el PRD)
            $table->dropForeign(['usuario_id']);
            $table->dropIndex('idx_intento_correo');
            $table->dropIndex('idx_intento_fecha');
            $table->dropColumn('usuario_id');

            // Hacer ip NOT NULL según PRD
            $table->string('ip', 45)->nullable(false)->change();

            // Reemplazar índices simples por el índice compuesto del PRD
            $table->index(['correo', 'creado_en'], 'idx_correo_fecha');
        });
    }

    public function down(): void
    {
        Schema::table('intentos_login', function (Blueprint $table) {
            $table->dropIndex('idx_correo_fecha');
            $table->string('ip', 45)->nullable()->change();
            $table->unsignedBigInteger('usuario_id')->nullable();
            $table->foreign('usuario_id')->references('id')->on('usuarios')->nullOnDelete();
            $table->index('correo', 'idx_intento_correo');
            $table->index('creado_en', 'idx_intento_fecha');
        });
    }
};
