<?php

namespace App\Policies;

use App\Models\ProgramaFormacion;
use App\Models\Usuario;

// Listado de programas para formularios de ficha (solo admin en M5)
class ProgramaFormacionPolicy
{
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->rol === 'admin';
    }

    public function view(Usuario $usuario, ProgramaFormacion $programa): bool
    {
        return $usuario->rol === 'admin';
    }
}
