<?php

namespace App\Policies;

use App\Models\Usuario;

// Solo el administrador puede gestionar usuarios vía API (Módulo 6)
class UsuarioPolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->rol === 'admin';
    }

    public function view(Usuario $usuario, Usuario $modelo): bool
    {
        return $usuario->rol === 'admin';
    }

    public function create(Usuario $usuario): bool
    {
        return $usuario->rol === 'admin';
    }

    public function update(Usuario $usuario, Usuario $modelo): bool
    {
        return $usuario->rol === 'admin';
    }

    public function delete(Usuario $usuario, Usuario $modelo): bool
    {
        return $usuario->rol === 'admin';
    }

    /** Volver a marcar activo = 1 tras un soft delete */
    public function reactivate(Usuario $usuario, Usuario $modelo): bool
    {
        return $usuario->rol === 'admin';
    }
}
