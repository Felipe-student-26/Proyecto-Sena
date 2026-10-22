<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de jornadas por ficha (mañana, tarde, noche, fin de semana)
// Una ficha puede tener varias jornadas, pero no dos del mismo tipo
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jornadas_ficha', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('ficha_id');
            $table->enum('tipo', ['mañana', 'tarde', 'noche', 'fin_de_semana']);
            $table->tinyInteger('activo')->default(1);
            $table->dateTime('creado_en')->useCurrent();

            $table->foreign('ficha_id')
                  ->references('id')
                  ->on('fichas_caracterizacion')
                  ->cascadeOnDelete();

            // Una ficha no puede tener dos jornadas del mismo tipo
            $table->unique(['ficha_id', 'tipo'], 'uq_ficha_jornada');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jornadas_ficha');
    }
};
