<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Alineación con PRD §5 tabla configuracion:
// PRD define: clave, valor (TEXT NULL), descripcion (TEXT NULL), actualizado_en
// La versión M0 tenía: valor NOT NULL, descripcion VARCHAR(255), creado_en extra
// Cambios:
// 1. valor → nullable (el PRD lo define como NULL permitido)
// 2. descripcion → TEXT (el PRD lo define como TEXT, no VARCHAR)
// 3. Eliminar creado_en (el PRD no la incluye en configuracion)
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            // valor puede ser NULL según PRD
            $table->text('valor')->nullable()->change();

            // descripcion como TEXT (más amplio que VARCHAR)
            $table->text('descripcion')->nullable()->change();

            // Eliminar creado_en que el PRD no incluye en esta tabla
            $table->dropColumn('creado_en');
        });
    }

    public function down(): void
    {
        Schema::table('configuracion', function (Blueprint $table) {
            $table->text('valor')->nullable(false)->change();
            $table->string('descripcion', 255)->nullable()->change();
            $table->dateTime('creado_en')->useCurrent();
        });
    }
};
