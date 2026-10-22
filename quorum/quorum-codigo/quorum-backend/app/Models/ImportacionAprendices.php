<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportacionAprendices extends Model
{
    protected $table = 'importaciones_aprendices';
    public $timestamps = false;

    protected $fillable = [
        'importado_por',
        'ficha_id',
        'nombre_archivo',
        'total_registros',
        'exitosos',
        'fallidos',
        'errores',
    ];

    protected $casts = [
        // El campo errores es JSON — Eloquent lo convierte automáticamente a array
        'errores' => 'array',
    ];

    // El usuario que realizó la importación (admin)
    public function importadoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'importado_por');
    }

    // La ficha a la que se importaron los aprendices
    public function ficha(): BelongsTo
    {
        return $this->belongsTo(FichaCaracterizacion::class, 'ficha_id');
    }
}
