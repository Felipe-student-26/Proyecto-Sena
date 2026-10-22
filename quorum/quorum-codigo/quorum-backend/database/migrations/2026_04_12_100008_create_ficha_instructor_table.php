<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla pivot que relaciona fichas con instructores
// es_gestor=1 indica que ese instructor es el gestor del grupo (solo uno por ficha)
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ficha_instructor', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ficha_id');
            $table->unsignedBigInteger('usuario_id');
            // Solo puede haber un gestor por ficha — se valida en la aplicación
            $table->tinyInteger('es_gestor')->default(0);
            $table->dateTime('creado_en')->useCurrent();

            $table->foreign('ficha_id')
                  ->references('id')
                  ->on('fichas_caracterizacion')
                  ->cascadeOnDelete();

            $table->foreign('usuario_id')
                  ->references('id')
                  ->on('usuarios')
                  ->restrictOnDelete();

            // Un instructor no puede aparecer dos veces en la misma ficha
            $table->unique(['ficha_id', 'usuario_id'], 'uq_ficha_instructor');
            $table->index('ficha_id', 'idx_pivot_ficha');
            $table->index('usuario_id', 'idx_pivot_usuario');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ficha_instructor');
    }
};
