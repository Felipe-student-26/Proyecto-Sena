<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de regionales del SENA — cada una pertenece a una macrorregión
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regionales', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
            $table->unsignedBigInteger('macrorregion_id');
            $table->dateTime('creado_en')->useCurrent();
            $table->dateTime('actualizado_en')->useCurrent()->useCurrentOnUpdate();

            $table->foreign('macrorregion_id')
                  ->references('id')
                  ->on('macrorregiones')
                  ->restrictOnDelete();

            $table->index('macrorregion_id', 'idx_regionales_macrorregion');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('regionales');
    }
};
