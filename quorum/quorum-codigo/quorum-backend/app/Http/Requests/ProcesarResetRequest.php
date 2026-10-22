<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

// Valida el formulario de nueva contraseña
// El token llega en el cuerpo JSON (no en la URL) para mantener la lógica en el backend
class ProcesarResetRequest extends FormRequest
{
    // Ruta pública — cualquiera con un token puede intentar resetear
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // El token de 64 caracteres generado con bin2hex(random_bytes(32))
            'token'                 => ['required', 'string'],
            // Política PRD §14.2: mínimo 8 chars, 1 mayúscula, 1 número, 1 especial
            'password'              => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[\W_]/',
            ],
            // Debe ser idéntica a 'password'
            'password_confirmation' => ['required', 'same:password'],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required'                 => 'El token de recuperación es obligatorio.',
            'password.required'              => 'La nueva contraseña es obligatoria.',
            'password.min'                   => 'La contraseña debe tener al menos 8 caracteres.',
            'password.regex'                 => 'La contraseña debe tener al menos 1 mayúscula, 1 número y 1 carácter especial.',
            'password_confirmation.required' => 'La confirmación de contraseña es obligatoria.',
            'password_confirmation.same'     => 'Las contraseñas no coinciden.',
        ];
    }

    // Retorna errores en JSON para que el frontend los pueda mostrar por campo
    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Datos inválidos.',
                'errores' => $validator->errors(),
            ], 422)
        );
    }
}
