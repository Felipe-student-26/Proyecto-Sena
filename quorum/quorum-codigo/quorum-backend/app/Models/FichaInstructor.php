<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Tabla pivot entre fichas_caracterizacion y usuarios (instructores)
// Registra qué instructores están asignados a cada ficha y cuál es el gestor de grupo
class FichaInstructor extends Model
{
    protected $table = 'ficha_instructor';
    public $timestamps = false;

    protected $fillable = [
        'ficha_id',
        'usuario_id',
        'es_gestor',
        'activo',
    ];

    // La ficha a la que pertenece esta asignación
    public function ficha(): BelongsTo
    {
        return $this->belongsTo(FichaCaracterizacion::class, 'ficha_id');
    }

    // El instructor o gestor asignado
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    // Scope para obtener solo asignaciones activas
    public function scopeActivos($query)
    {
        return $query->where('activo', 1);
    }

    // Scope para obtener solo el gestor de grupo de una ficha
    public function scopeGestor($query)
    {
        return $query->where('es_gestor', 1)->where('activo', 1);
    }
}
