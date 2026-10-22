<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Filtros del listado de auditoría de correcciones de asistencia (admin)
class ListAuditoriaAsistenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'page'            => ['sometimes', 'integer', 'min:1'],
            'per_page'        => ['sometimes', 'integer', 'min:5', 'max:100'],
            'desde'           => ['nullable', 'date_format:Y-m-d'],
            'hasta'           => ['nullable', 'date_format:Y-m-d', 'after_or_equal:desde'],
            'ficha_id'        => ['nullable', 'integer', 'exists:fichas_caracterizacion,id'],
            'modificado_por'  => ['nullable', 'integer', 'exists:usuarios,id'],
        ];
    }
}
