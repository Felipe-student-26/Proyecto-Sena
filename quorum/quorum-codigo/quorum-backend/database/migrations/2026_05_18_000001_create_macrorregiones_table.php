<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla de macrorregiones del SENA (Centro, Norte, Occidental, Oriental, Suroriental)
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('macrorregiones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100)->unique();
            $table->dateTime('creado_en')->useCurrent();
            $table->dateTime('actualizado_en')->useCurrent()->useCurrentOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('macrorregiones');
    }
};
