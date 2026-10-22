<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// POST /api/auth/2fa/verificar — código TOTP en cada inicio de sesión (staff ya configurado)
class Verificar2FARequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'codigo' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'codigo.required' => 'Ingresa el código de 6 dígitos.',
            'codigo.size'     => 'El código debe tener exactamente 6 dígitos.',
            'codigo.regex'    => 'El código solo puede contener números.',
        ];
    }
}
