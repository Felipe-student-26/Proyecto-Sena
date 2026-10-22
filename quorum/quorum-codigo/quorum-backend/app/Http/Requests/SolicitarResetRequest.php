<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

// Valida la solicitud de recuperación de contraseña
// Solo pide el correo — la existencia del usuario se verifica en el controlador
class SolicitarResetRequest extends FormRequest
{
    // Cualquier persona puede solicitar recuperación (ruta pública)
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'correo' => ['required', 'email', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'correo.required' => 'El correo es obligatorio.',
            'correo.email'    => 'Ingresa un correo electrónico válido.',
            'correo.max'      => 'El correo no puede superar los 255 caracteres.',
        ];
    }

    // Retorna errores en formato JSON para que el frontend los pueda leer
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
