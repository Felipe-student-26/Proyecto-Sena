<?php

namespace App\Policies;

use App\Models\Sesion;
use App\Models\Usuario;

// Quién puede cerrar/guardar una sesión de asistencia abierta
class SesionPolicy
{
    /** Solo el instructor que abrió la sesión (instructor o gestor en esa ficha). */
    public function guardarAsistencia(Usuario $usuario, Sesion $sesion): bool
    {
        if (! in_array($usuario->rol, ['instructor', 'gestor_grupo'], true)) {
            return false;
        }

        return (int) $sesion->instructor_id === (int) $usuario->id;
    }
}
