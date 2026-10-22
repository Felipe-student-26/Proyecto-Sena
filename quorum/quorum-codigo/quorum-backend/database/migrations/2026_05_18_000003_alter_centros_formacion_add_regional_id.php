<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Agrega regional_id a centros_formacion para vincular cada centro a su regional SENA
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('centros_formacion', function (Blueprint $table) {
            // nullable para no romper registros existentes; se llena en el seeder
            $table->unsignedBigInteger('regional_id')->nullable()->after('codigo');

            $table->foreign('regional_id')
                  ->references('id')
                  ->on('regionales')
                  ->nullOnDelete();

            $table->index('regional_id', 'idx_centros_regional');
        });
    }

    public function down(): void
    {
        Schema::table('centros_formacion', function (Blueprint $table) {
            $table->dropForeign(['regional_id']);
            $table->dropIndex('idx_centros_regional');
            $table->dropColumn('regional_id');
        });
    }
};
