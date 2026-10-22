<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUsuarioRequest;
use App\Http\Requests\UpdateUsuarioRequest;
use App\Models\Usuario;
use App\Services\TotpService;
use App\Support\LogActivity;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

// CRUD de usuarios para administrador — Módulo 6
class UsuarioController extends Controller
{
    public function __construct(
        private readonly TotpService $totpService
    ) {}

    /** Listado paginado con filtros por rol, búsqueda y estado */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Usuario::class);

        $q = Usuario::query()->orderBy('apellido')->orderBy('nombre');

        if ($request->filled('rol')) {
            $q->where('rol', $request->string('rol')->toString());
        }

        if ($request->filled('activo')) {
            $q->where('activo', (int) $request->input('activo'));
        }

        if ($request->filled('busqueda')) {
            $b = $request->string('busqueda')->trim();
            $q->where(function ($sub) use ($b) {
                $sub->where('nombre', 'like', '%'.$b.'%')
                    ->orWhere('apellido', 'like', '%'.$b.'%')
                    ->orWhere('documento', 'like', '%'.$b.'%')
                    ->orWhere('correo', 'like', '%'.$b.'%');
            });
        }

        $perPage = min(50, max(5, (int) $request->input('per_page', 15)));
        $paginado = $q->paginate(perPage: $perPage);

        $paginado->getCollection()->transform(fn (Usuario $u) => $this->serializarUsuario($u));

        return response()->json($paginado);
    }

    public function store(StoreUsuarioRequest $request): JsonResponse
    {
        $datos = $request->validated();
        $esAprendiz = $datos['rol'] === 'aprendiz';

        $fila = [
            'nombre'          => trim($datos['nombre']),
            'apellido'        => trim($datos['apellido']),
            'documento'       => trim($datos['documento']),
            'correo'          => strtolower(trim($datos['correo'])),
            'rol'             => $datos['rol'],
            'activo'          => 1,
            'ficha_id'        => $esAprendiz ? (int) $datos['ficha_id'] : null,
            'password'        => $esAprendiz ? null : Hash::make($datos['password']),
            'totp_secret'     => $esAprendiz ? null : $this->totpService->generarSecreto(),
            'totp_verificado' => 0,
        ];

        try {
            $usuario = Usuario::query()->create($fila);
        } catch (QueryException $e) {
            return $this->respuestaErrorBd($e);
        }

        LogActivity::registrar(
            'crear_usuario',
            $usuario->correo.' — rol '.$usuario->rol
        );

        return response()->json([
            'message' => 'Usuario creado correctamente.',
            'data'    => $this->serializarUsuario($usuario->fresh()),
        ], 201);
    }

    public function update(UpdateUsuarioRequest $request, Usuario $usuario): JsonResponse
    {
        $datos = $request->validated();
        $esAprendiz = $datos['rol'] === 'aprendiz';

        $actualizar = [
            'nombre'    => trim($datos['nombre']),
            'apellido'  => trim($datos['apellido']),
            'documento' => trim($datos['documento']),
            'correo'    => strtolower(trim($datos['correo'])),
            'rol'       => $datos['rol'],
            'ficha_id'  => $esAprendiz ? (int) $datos['ficha_id'] : null,
        ];

        if ($esAprendiz) {
            $actualizar['password'] = null;
        } elseif (! empty($datos['password'])) {
            $actualizar['password'] = Hash::make($datos['password']);
        }

        // Si pasa de aprendiz a staff y no tenía secreto TOTP, generamos uno
        if (! $esAprendiz && empty($usuario->totp_secret)) {
            $actualizar['totp_secret']     = $this->totpService->generarSecreto();
            $actualizar['totp_verificado'] = 0;
        }

        try {
            $usuario->update($actualizar);
        } catch (QueryException $e) {
            return $this->respuestaErrorBd($e);
        }

        LogActivity::registrar(
            'actualizar_usuario',
            'Id '.$usuario->id.' — '.$usuario->correo
        );

        return response()->json([
            'message' => 'Usuario actualizado correctamente.',
            'data'    => $this->serializarUsuario($usuario->fresh()),
        ]);
    }

    /** Marca activo = 1 si el usuario estaba desactivado */
    public function reactivar(Usuario $usuario): JsonResponse
    {
        $this->authorize('reactivate', $usuario);

        if ((int) $usuario->activo === 1) {
            return response()->json([
                'message' => 'El usuario ya está activo.',
            ], 422);
        }

        $usuario->update([
            'activo'         => 1,
            'actualizado_en' => now(),
        ]);

        LogActivity::registrar(
            'reactivar_usuario',
            'Id '.$usuario->id.' — '.$usuario->correo
        );

        return response()->json([
            'message' => 'El usuario fue reactivado.',
            'data'    => $this->serializarUsuario($usuario->fresh()),
        ]);
    }

    public function destroy(Request $request, Usuario $usuario): JsonResponse
    {
        if ((int) $request->user()->id === (int) $usuario->id) {
            return response()->json([
                'message' => 'No puedes desactivar tu propia cuenta.',
            ], 422);
        }

        $this->authorize('delete', $usuario);

        if ((int) $usuario->activo === 1) {
            $usuario->update([
                'activo'        => 0,
                'actualizado_en' => now(),
            ]);

            LogActivity::registrar(
                'desactivar_usuario',
                'Id '.$usuario->id.' — '.$usuario->correo
            );

            return response()->json([
                'message' => 'El usuario fue desactivado.',
            ]);
        }

        $idEliminado = $usuario->id;

        try {
            $usuario->delete();
        } catch (QueryException $e) {
            return $this->respuestaErrorFk($e);
        }

        LogActivity::registrar(
            'eliminar_usuario_permanente',
            'Id '.$idEliminado
        );

        return response()->json([
            'message' => 'El usuario fue eliminado permanentemente.',
        ]);
    }

    /** Serializa un usuario para JSON (sin secretos) */
    private function serializarUsuario(Usuario $u): array
    {
        return [
            'id'               => $u->id,
            'nombre'           => $u->nombre,
            'apellido'         => $u->apellido,
            'documento'        => $u->documento,
            'correo'           => $u->correo,
            'rol'              => $u->rol,
            'activo'           => (int) $u->activo,
            'ficha_id'         => $u->ficha_id !== null ? (int) $u->ficha_id : null,
            'totp_verificado'  => (int) ($u->totp_verificado ?? 0),
            'creado_en'        => $u->creado_en,
            'actualizado_en'   => $u->actualizado_en,
        ];
    }

    private function respuestaErrorBd(QueryException $e): JsonResponse
    {
        if (str_contains($e->getMessage(), 'Duplicate') || str_contains($e->getMessage(), '1062')) {
            return response()->json([
                'message' => 'Ya existe un registro con esos datos (duplicado en base de datos).',
            ], 422);
        }

        report($e);

        return response()->json([
            'message' => 'No se pudo guardar la información. Inténtalo de nuevo.',
        ], 500);
    }

    private function respuestaErrorFk(QueryException $e): JsonResponse
    {
        $sqlState = $e->errorInfo[0] ?? '';
        $code     = (int) ($e->errorInfo[1] ?? 0);

        if ($sqlState === '23000' || $code === 1451) {
            return response()->json([
                'message' => 'No se puede eliminar permanentemente: el usuario tiene historial o vínculos en el sistema.',
            ], 422);
        }

        report($e);

        return response()->json([
            'message' => 'No se pudo completar la operación. Inténtalo de nuevo.',
        ], 500);
    }
}
