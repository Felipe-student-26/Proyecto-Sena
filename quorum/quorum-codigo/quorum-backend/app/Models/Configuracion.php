<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    protected $table = 'configuracion';
    public $timestamps = false;

    protected $fillable = [
        'clave',
        'valor',
        'descripcion',
    ];

    // Obtiene un valor de configuración por su clave, con valor por defecto
    public static function obtener(string $clave, ?string $defecto = null): ?string
    {
        $config = static::where('clave', $clave)->first();
        return $config ? $config->valor : $defecto;
    }

    // Crea o actualiza una configuración por clave
    public static function establecer(string $clave, ?string $valor): void
    {
        static::updateOrCreate(
            ['clave' => $clave],
            ['valor' => $valor]
        );
    }
}
