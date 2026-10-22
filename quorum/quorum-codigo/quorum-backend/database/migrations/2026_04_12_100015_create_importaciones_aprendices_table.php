<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de registro de importaciones masivas de aprendices desde Excel
// Guarda un historial de cada carga con su resultado
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('importaciones_aprendices', function (Blueprint $table) {
            $table->id();
            // El admin que realizó la importación
            $table->unsignedBigInteger('usuario_id');
            // La ficha a la que se importaron los aprendices
            $table->unsignedBigInteger('ficha_id');
            // Nombre del archivo Excel importado
            $table->string('nombre_archivo', 255);
            // Cuántos registros se procesaron en total
            $table->integer('total_registros')->default(0);
            // Cuántos se importaron correctamente
            $table->integer('exitosos')->default(0);
            // Cuántos fallaron (errores de validación, duplicados, etc.)
            $table->integer('fallidos')->default(0);
            // Detalles de los errores en formato JSON
            $table->json('errores')->nullable();
            $table->dateTime('creado_en')->useCurrent();

            $table->foreign('usuario_id')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();

            $table->foreign('ficha_id')
                  ->references('id')
                  ->on('fichas_caracterizacion')
                  ->restrictOnDelete();

            $table->index('ficha_id', 'idx_import_ficha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('importaciones_aprendices');
    }
};
