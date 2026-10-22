<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Macrorregion extends Model
{
    protected $table = 'macrorregiones';
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'creado_en',
        'actualizado_en',
    ];

    public function regionales(): HasMany
    {
        return $this->hasMany(Regional::class, 'macrorregion_id');
    }
}
