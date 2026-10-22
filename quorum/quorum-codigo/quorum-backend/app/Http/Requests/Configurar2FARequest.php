<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// POST /api/auth/2fa/configurar — sin codigo prepara QR; con codigo activa 2FA
class Configurar2FARequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'codigo' => ['nullable', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'codigo.size'   => 'El código debe tener exactamente 6 dígitos.',
            'codigo.regex'  => 'El código solo puede contener números.',
        ];
    }
}
