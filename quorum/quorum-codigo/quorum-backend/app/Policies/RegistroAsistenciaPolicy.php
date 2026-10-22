<?php

namespace App\Policies;

use App\Models\RegistroAsistencia;
use App\Models\Usuario;

// Corrección de un registro ya guardado (sesión cerrada)
class RegistroAsistenciaPolicy
{
    public function update(Usuario $usuario, RegistroAsistencia $registro): bool
    {
        if (! in_array($usuario->rol, ['instructor', 'gestor_grupo'], true)) {
            return false;
        }

        $registro->loadMissing('sesion');
        $sesion = $registro->sesion;

        if (! $sesion) {
            return false;
        }

        return (int) $sesion->instructor_id === (int) $usuario->id
            && $sesion->estado === 'cerrada';
    }

    /** Panel de gestión: instructor, gestor de grupo y coordinador. */
    public function listarEvidencias(Usuario $usuario): bool
    {
        return in_array($usuario->rol, ['instructor', 'gestor_grupo', 'coordinador'], true);
    }

    /** Descargar evidencia de excusa: coordinador (todas) o instructor/gestor de la sesión. */
    public function viewExcusaEvidencia(Usuario $usuario, RegistroAsistencia $registro): bool
    {
        if ($usuario->rol === 'coordinador') {
            return true;
        }

        if (! in_array($usuario->rol, ['instructor', 'gestor_grupo'], true)) {
            return false;
        }

        $registro->loadMissing('sesion');
        $sesion = $registro->sesion;

        if (! $sesion) {
            return false;
        }

        return (int) $sesion->instructor_id === (int) $usuario->id;
    }
}
