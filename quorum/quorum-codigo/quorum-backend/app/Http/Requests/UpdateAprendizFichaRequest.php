<?php

namespace App\Http\Requests;

use App\Models\FichaCaracterizacion;
use App\Models\Usuario;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAprendizFichaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $ficha    = $this->route('ficha');
        $aprendiz = $this->route('usuario');

        if (! $ficha instanceof FichaCaracterizacion || ! $aprendiz instanceof Usuario) {
            return false;
        }

        if ($aprendiz->rol !== 'aprendiz' || (int) $aprendiz->ficha_id !== (int) $ficha->id) {
            return false;
        }

        return $this->user()?->can('actualizarAprendiz', [$ficha, $aprendiz]) ?? false;
    }

    public function rules(): array
    {
        /** @var Usuario $aprendiz */
        $aprendiz = $this->route('usuario');

        return [
            'nombre'    => ['required', 'string', 'max:120'],
            'apellido'  => ['required', 'string', 'max:120'],
            'documento' => [
                'required', 'string', 'max:20',
                Rule::unique('usuarios', 'documento')->ignore($aprendiz->id),
            ],
            'correo'    => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('usuarios', 'correo')->ignore($aprendiz->id),
            ],
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre'    => 'nombre',
            'apellido'  => 'apellido',
            'documento' => 'cédula',
            'correo'    => 'correo',
        ];
    }
}
