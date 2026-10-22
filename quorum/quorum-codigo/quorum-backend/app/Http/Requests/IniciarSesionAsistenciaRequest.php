<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Datos para abrir o recuperar la sesión de asistencia del día
class IniciarSesionAsistenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'ficha_id'    => ['required', 'integer', 'exists:fichas_caracterizacion,id'],
            'fecha'       => ['required', 'date_format:Y-m-d'],
            'horario_id'  => ['sometimes', 'nullable', 'integer', 'exists:horarios,id'],
        ];
    }
}
