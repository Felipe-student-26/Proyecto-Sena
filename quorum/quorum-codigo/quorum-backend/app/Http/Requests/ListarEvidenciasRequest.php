<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

// Query params del listado de evidencias de excusas
class ListarEvidenciasRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'ficha_id'     => ['nullable', 'integer', 'exists:fichas_caracterizacion,id'],
            'aprendiz_id'  => ['nullable', 'integer', 'exists:usuarios,id'],
            'fecha_desde'  => ['nullable', 'date_format:Y-m-d'],
            'fecha_hasta'  => ['nullable', 'date_format:Y-m-d'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $desde = $this->input('fecha_desde');
            $hasta = $this->input('fecha_hasta');
            if (is_string($desde) && is_string($hasta) && $hasta < $desde) {
                $v->errors()->add('fecha_hasta', 'La fecha hasta debe ser igual o posterior a la fecha desde.');
            }
        });
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'ficha_id'    => 'ficha',
            'aprendiz_id' => 'aprendiz',
            'fecha_desde' => 'fecha desde',
            'fecha_hasta' => 'fecha hasta',
        ];
    }
}
