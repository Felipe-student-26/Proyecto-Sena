<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

// Validación de query para descargar reporte Excel CPIC (Módulo 11)
class DescargarReporteExcelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'desde' => ['required', 'date_format:Y-m-d'],
            'hasta' => ['required', 'date_format:Y-m-d'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            $desde = $this->input('desde');
            $hasta = $this->input('hasta');
            if (is_string($desde) && is_string($hasta) && $hasta < $desde) {
                $v->errors()->add('hasta', 'La fecha hasta debe ser igual o posterior a la fecha desde.');
            }
        });
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return [
            'desde' => 'fecha desde',
            'hasta' => 'fecha hasta',
        ];
    }
}
