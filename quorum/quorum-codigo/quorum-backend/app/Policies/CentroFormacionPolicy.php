<?php

namespace App\Policies;

use App\Models\CentroFormacion;
use App\Models\Usuario;

// Listado de centros para formularios de ficha (solo admin en M5)
class CentroFormacionPolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return in_array($usuario->rol, ['admin', 'coordinador'], true);
    }

    public function view(Usuario $usuario, CentroFormacion $centro): bool
    {
        return in_array($usuario->rol, ['admin', 'coordinador'], true);
    }

    public function create(Usuario $usuario): bool
    {
        return $usuario->rol === 'admin';
    }

    public function update(Usuario $usuario, CentroFormacion $centro): bool
    {
        return $usuario->rol === 'admin';
    }

    public function delete(Usuario $usuario, CentroFormacion $centro): bool
    {
        return $usuario->rol === 'admin';
    }

    public function reactivate(Usuario $usuario, CentroFormacion $centro): bool
    {
        return $usuario->rol === 'admin';
    }
}
