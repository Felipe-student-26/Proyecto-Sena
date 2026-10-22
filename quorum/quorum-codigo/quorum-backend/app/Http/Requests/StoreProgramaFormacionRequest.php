<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// Alta de programa de formación — solo admin
class StoreProgramaFormacionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'max:200'],
            'codigo' => ['nullable', 'string', 'max:30', Rule::unique('programas_formacion', 'codigo')],
            'tipo'   => ['nullable', Rule::in(['tecnico', 'tecnologo', 'operario', 'auxiliar', 'especializacion', 'complementaria'])],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre del programa es obligatorio.',
            'codigo.unique'   => 'Ya existe un programa con ese código.',
            'tipo.in'         => 'El tipo debe ser: técnico, tecnólogo, operario, auxiliar, especialización o complementaria.',
        ];
    }
}
