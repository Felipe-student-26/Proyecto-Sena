<?php

namespace App\Models;

use App\Support\LogActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Auditoría general del sistema — registra cualquier acción relevante
// usuario_id es nullable: permite registrar eventos sin usuario autenticado
class HistorialActividad extends Model
{
    protected $table = 'historial_actividad';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'accion',
        'descripcion',
        'ip',
    ];

    // El usuario que realizó la acción (puede ser null para eventos del sistema)
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * Compatibilidad — delega en LogActivity (usuario actual o null).
     * Si necesitas otro usuario_id, usa create() directo.
     */
    public static function registrar(string $accion, ?int $usuarioId = null, ?string $descripcion = null, ?string $ip = null): void
    {
        if ($usuarioId === null && $ip === null) {
            LogActivity::registrar($accion, $descripcion);

            return;
        }

        static::query()->create([
            'accion'      => $accion,
            'usuario_id'  => $usuarioId,
            'descripcion' => $descripcion ?? '',
            'ip'          => $ip ?? request()->ip(),
        ]);
    }
}
