<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CentroFormacion extends Model
{
    protected $table = 'centros_formacion';

    // Desactivamos los timestamps automáticos porque usamos creado_en/actualizado_en
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'codigo',
        'regional_id',
        'activo',
        'creado_en',
        'actualizado_en',
    ];

    // Un centro pertenece a una regional
    public function regional(): BelongsTo
    {
        return $this->belongsTo(Regional::class, 'regional_id');
    }

    // Un centro tiene muchas fichas
    public function fichas(): HasMany
    {
        return $this->hasMany(FichaCaracterizacion::class, 'centro_formacion_id');
    }
}
