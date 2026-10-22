<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Tabla principal de usuarios — todos los roles usan esta tabla
// Los aprendices tienen password=NULL y usan documento como credencial
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usuarios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            // Cédula — también usada como contraseña del aprendiz
            $table->string('documento', 20);
            $table->string('correo', 150)->unique();
            // NULL para aprendices (usan documento en lugar de contraseña)
            $table->string('password', 255)->nullable();
            $table->enum('rol', ['admin', 'coordinador', 'instructor', 'gestor_grupo', 'aprendiz']);
            $table->tinyInteger('activo')->default(1);
            // Solo para aprendices: ficha a la que pertenecen
            // FK se agrega en la migración siguiente (after fichas)
            $table->unsignedBigInteger('ficha_id')->nullable();
            // Secreto para autenticación de dos factores (2FA TOTP)
            $table->string('totp_secret', 100)->nullable();
            // 0=no configurado (mostrar QR), 1=ya tiene 2FA activo
            $table->tinyInteger('totp_verificado')->default(0);
            // Color del círculo de iniciales del avatar
            $table->string('avatar_color', 7)->default('#3DAE2B');
            $table->dateTime('creado_en')->useCurrent();
            $table->dateTime('actualizado_en')->useCurrent()->useCurrentOnUpdate();

            // Índices para búsquedas frecuentes
            $table->index('rol', 'idx_rol');
            $table->index('documento', 'idx_documento');
            $table->index('ficha_id', 'idx_ficha');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usuarios');
    }
};
