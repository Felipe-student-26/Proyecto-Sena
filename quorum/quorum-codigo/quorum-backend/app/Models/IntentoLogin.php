<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Registro de intentos de login para el sistema de bloqueo por fuerza bruta
// El PRD no incluye FK a usuarios: así se pueden registrar correos inválidos
class IntentoLogin extends Model
{
    protected $table = 'intentos_login';
    public $timestamps = false;

    protected $fillable = [
        'correo',
        'ip',
        'exitoso',
    ];

    // Scope para filtrar intentos fallidos de un correo en los últimos N minutos
    public function scopeRecientesFallidos($query, string $correo, int $minutos = 15)
    {
        return $query->where('correo', $correo)
                     ->where('exitoso', 0)
                     ->where('creado_en', '>=', now()->subMinutes($minutos));
    }
}
