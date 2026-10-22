<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de configuración del sistema tipo clave-valor
// Ejemplos: nombre_sistema, max_intentos_login, timeout_sesion
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuracion', function (Blueprint $table) {
            $table->id();
            // Clave única de la configuración (ejemplo: 'nombre_sistema')
            $table->string('clave', 100)->unique();
            // Valor almacenado como texto (puede ser número, booleano, etc.)
            $table->text('valor');
            // Descripción para que el admin entienda para qué sirve
            $table->string('descripcion', 255)->nullable();
            $table->dateTime('creado_en')->useCurrent();
            $table->dateTime('actualizado_en')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracion');
    }
};
