<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Agrega modalidad (presencial / virtual) a las fichas de caracterización
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('fichas_caracterizacion', function (Blueprint $table) {
            $table->enum('modalidad', ['presencial', 'virtual'])
                  ->default('presencial')
                  ->after('estado');
        });
    }

    public function down(): void
    {
        Schema::table('fichas_caracterizacion', function (Blueprint $table) {
            $table->dropColumn('modalidad');
        });
    }
};
