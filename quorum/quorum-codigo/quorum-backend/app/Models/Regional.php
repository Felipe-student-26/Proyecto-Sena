<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Regional extends Model
{
    protected $table = 'regionales';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'macrorregion_id',
        'creado_en',
        'actualizado_en',
    ];

    public function macrorregion(): BelongsTo
    {
        return $this->belongsTo(Macrorregion::class, 'macrorregion_id');
    }

    public function centros(): HasMany
    {
        return $this->hasMany(CentroFormacion::class, 'regional_id');
    }
}
