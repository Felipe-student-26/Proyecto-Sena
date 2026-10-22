<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// Validación PATCH /api/configuracion — solo claves permitidas (M12)
class UpdateConfiguracionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $clave = $this->input('clave');

        $reglasValor = match ($clave) {
            'nombre_sistema', 'nombre_institucion' => ['required', 'string', 'max:255'],
            'timeout_sesion', 'max_intentos_login', 'minutos_bloqueo' => ['required', 'integer', 'min:1', 'max:999'],
            default => ['prohibited'],
        };

        return [
            'clave' => [
                'required',
                'string',
                Rule::in(['nombre_sistema', 'nombre_institucion', 'timeout_sesion', 'max_intentos_login', 'minutos_bloqueo']),
            ],
            'valor' => $reglasValor,
        ];
    }

    public function messages(): array
    {
        return [
            'clave.in'       => 'La clave de configuración no es editable.',
            'valor.required' => 'Debes indicar un valor.',
        ];
    }
}
