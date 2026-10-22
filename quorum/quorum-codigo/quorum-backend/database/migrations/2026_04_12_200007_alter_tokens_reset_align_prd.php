<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Alineación con PRD §5 tabla tokens_reset:
// PRD define token como VARCHAR(255) — la versión M0 usó VARCHAR(100)
// Ampliar a 255 para que funcione con cualquier token estándar
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tokens_reset', function (Blueprint $table) {
            // Ampliar el token para coincidir con el PRD (VARCHAR 255)
            $table->string('token', 255)->change();
        });
    }

    public function down(): void
    {
        Schema::table('tokens_reset', function (Blueprint $table) {
            $table->string('token', 100)->change();
        });
    }
};
