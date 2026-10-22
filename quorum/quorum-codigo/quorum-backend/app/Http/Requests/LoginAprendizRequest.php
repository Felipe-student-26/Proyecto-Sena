<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Validación del formulario de login para aprendices
// Correo + documento (cédula) — sin contraseña, sin 2FA
class LoginAprendizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'correo'    => ['required', 'email', 'max:150'],
            'documento' => ['required', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'correo.required'    => 'El correo es obligatorio.',
            'correo.email'       => 'El formato del correo no es válido.',
            'documento.required' => 'El número de documento es obligatorio.',
        ];
    }
}
