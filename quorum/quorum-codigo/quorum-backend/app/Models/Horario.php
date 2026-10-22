<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Horario extends Model
{
    protected $table = 'horarios';
    public $timestamps = false;

    protected $fillable = [
        'ficha_id',
        'jornada_ficha_id',
        'dia_semana',
        'hora_inicio',
        'hora_fin',
        'horas_programadas',
        'instructor_id',
        'activo',
    ];

    // El horario pertenece a una ficha
    public function ficha(): BelongsTo
    {
        return $this->belongsTo(FichaCaracterizacion::class, 'ficha_id');
    }

    // El horario pertenece a una jornada
    public function jornada(): BelongsTo
    {
        return $this->belongsTo(JornadaFicha::class, 'jornada_ficha_id');
    }

    // El instructor asignado a este día
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'instructor_id');
    }

    // Las sesiones que se tomaron para este horario
    public function sesiones(): HasMany
    {
        return $this->hasMany(Sesion::class, 'horario_id');
    }
}
