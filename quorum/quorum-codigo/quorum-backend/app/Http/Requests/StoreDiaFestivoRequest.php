<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Alta de día festivo (M12)
class StoreDiaFestivoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'fecha'       => ['required', 'date_format:Y-m-d'],
            'descripcion' => ['required', 'string', 'max:150'],
        ];
    }

    public function messages(): array
    {
        return [
            'fecha.required'    => 'La fecha es obligatoria.',
            'fecha.date_format' => 'La fecha debe tener formato AAAA-MM-DD.',
            'descripcion.required' => 'La descripción es obligatoria.',
        ];
    }
}
