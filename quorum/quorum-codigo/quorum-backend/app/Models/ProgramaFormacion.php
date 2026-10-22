<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProgramaFormacion extends Model
{
    protected $table = 'programas_formacion';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'codigo',
        'tipo',
        'activo',
    ];

    // Un programa tiene muchas fichas
    public function fichas(): HasMany
    {
        return $this->hasMany(FichaCaracterizacion::class, 'programa_formacion_id');
    }
}
