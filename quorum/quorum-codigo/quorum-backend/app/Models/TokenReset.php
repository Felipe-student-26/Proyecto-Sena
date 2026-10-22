<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TokenReset extends Model
{
    protected $table = 'tokens_reset';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'token',
        'usado',
        'expira_en',
    ];

    // El usuario al que pertenece este token
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    // Verifica si el token ya expiró
    public function estaExpirado(): bool
    {
        return now()->isAfter($this->expira_en);
    }
}
