<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Sanctum\HasApiTokens;

// Modelo principal de usuarios — extiende Authenticatable para que Sanctum funcione
// Cubre todos los roles: admin, coordinador, instructor, gestor_grupo, aprendiz
class Usuario extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'usuarios';
    public $timestamps = false;

    // Campos que se pueden asignar masivamente
    protected $fillable = [
        'nombre',
        'apellido',
        'documento',
        'correo',
        'password',
        'rol',
        'activo',
        'ficha_id',
        'totp_secret',
        'totp_verificado',
        'avatar_color',
        'creado_en',
        'actualizado_en',
    ];

    // Campos que NO se deben mostrar en respuestas JSON
    protected $hidden = [
        'password',
        'totp_secret',
    ];

    // Sanctum usa 'id' como identificador por defecto — no se necesita override
    // getAuthIdentifierName() devuelve 'id' que es el PK correcto para stateful auth

    // El campo de credenciales para autenticación (Laravel lo usa en Auth::attempt())
    // Para instructores/admin: correo+password
    // Para aprendices: correo+documento (validado manualmente en el controlador)
    public function getAuthPasswordName(): string
    {
        return 'password';
    }

    // Los aprendices pertenecen a una sola ficha
    public function ficha(): BelongsTo
    {
        return $this->belongsTo(FichaCaracterizacion::class, 'ficha_id');
    }

    // Los instructores pueden estar asignados a varias fichas
    public function fichasComoInstructor(): BelongsToMany
    {
        return $this->belongsToMany(
            FichaCaracterizacion::class,
            'ficha_instructor',
            'usuario_id',
            'ficha_id'
        )->withPivot('es_gestor', 'activo')->wherePivot('activo', 1);
    }

    // Las sesiones que tomó este instructor
    public function sesiones(): HasMany
    {
        return $this->hasMany(Sesion::class, 'instructor_id');
    }

    // Los registros de asistencia de este aprendiz
    public function registrosAsistencia(): HasMany
    {
        return $this->hasMany(RegistroAsistencia::class, 'aprendiz_id');
    }

    // Tokens de recuperación de contraseña
    public function tokensReset(): HasMany
    {
        return $this->hasMany(TokenReset::class, 'usuario_id');
    }

    // Historial de actividad generado por este usuario
    public function historialActividad(): HasMany
    {
        return $this->hasMany(HistorialActividad::class, 'usuario_id');
    }
}
