<?php

namespace App\Support;

use App\Models\HistorialActividad;
use Illuminate\Support\Facades\Auth;

// Helper para registrar acciones en historial_actividad (M12)
class LogActivity
{
    /**
     * Registra una acción con el usuario autenticado actual (si hay).
     */
    public static function registrar(string $accion, ?string $descripcion = null): void
    {
        HistorialActividad::query()->create([
            'usuario_id'  => Auth::id(),
            'accion'      => $accion,
            'descripcion' => $descripcion ?? '',
            'ip'          => request()->ip(),
        ]);
    }
}
