<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JornadaFicha extends Model
{
    protected $table = 'jornadas_ficha';
    public $timestamps = false;

    protected $fillable = [
        'ficha_id',
        'tipo',
        'activo',
    ];

    // Una jornada pertenece a una ficha
    public function ficha(): BelongsTo
    {
        return $this->belongsTo(FichaCaracterizacion::class, 'ficha_id');
    }

    // Los horarios de esta jornada
    public function horarios(): HasMany
    {
        return $this->hasMany(Horario::class, 'jornada_ficha_id');
    }
}
