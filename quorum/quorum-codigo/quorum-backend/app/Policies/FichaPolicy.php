<?php

namespace App\Policies;

use App\Models\FichaCaracterizacion;
use App\Models\Usuario;

// Autorización CRUD y lectura de fichas de caracterización (Módulo 5)
class FichaPolicy
{
    /** El aprendiz no accede al módulo de fichas por API */
    public function viewAny(Usuario $usuario): bool
    {
        return in_array($usuario->rol, ['admin', 'coordinador', 'instructor', 'gestor_grupo'], true);
    }

    public function view(Usuario $usuario, FichaCaracterizacion $ficha): bool
    {
        if ($usuario->rol === 'admin' || $usuario->rol === 'coordinador') {
            return true;
        }

        if (in_array($usuario->rol, ['instructor', 'gestor_grupo'], true)) {
            return $ficha->fichaInstructores()
                ->where('usuario_id', $usuario->id)
                ->where('activo', 1)
                ->exists();
        }

        return false;
    }

    public function create(Usuario $usuario): bool
    {
        return $usuario->rol === 'admin';
    }

    public function update(Usuario $usuario, FichaCaracterizacion $ficha): bool
    {
        return $usuario->rol === 'admin';
    }

    /** Soft delete: marca activo = 0 */
    public function delete(Usuario $usuario, FichaCaracterizacion $ficha): bool
    {
        return $usuario->rol === 'admin';
    }

    /** Volver a marcar la ficha activa en el sistema */
    public function reactivate(Usuario $usuario, FichaCaracterizacion $ficha): bool
    {
        return $usuario->rol === 'admin';
    }

    /** Asignar o quitar instructores en la ficha */
    public function asignarInstructores(Usuario $usuario, FichaCaracterizacion $ficha): bool
    {
        return $usuario->rol === 'admin';
    }

    /** Importar aprendices desde Excel */
    public function importarAprendices(Usuario $usuario, FichaCaracterizacion $ficha): bool
    {
        return $usuario->rol === 'admin';
    }

    /** Alta manual de un aprendiz en la ficha */
    public function crearAprendiz(Usuario $usuario, FichaCaracterizacion $ficha): bool
    {
        return $usuario->rol === 'admin';
    }

    public function actualizarAprendiz(Usuario $usuario, FichaCaracterizacion $ficha, Usuario $aprendiz): bool
    {
        if ($usuario->rol !== 'admin') {
            return false;
        }

        return $aprendiz->rol === 'aprendiz'
            && (int) $aprendiz->ficha_id === (int) $ficha->id;
    }

    public function eliminarAprendiz(Usuario $usuario, FichaCaracterizacion $ficha, Usuario $aprendiz): bool
    {
        return $this->actualizarAprendiz($usuario, $ficha, $aprendiz);
    }
}
