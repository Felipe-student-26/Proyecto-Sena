<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Actualización de día festivo (M12)
class UpdateDiaFestivoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'fecha'       => ['sometimes', 'required', 'date_format:Y-m-d'],
            'descripcion' => ['sometimes', 'required', 'string', 'max:150'],
        ];
    }

    public function messages(): array
    {
        return [
            'fecha.date_format' => 'La fecha debe tener formato AAAA-MM-DD.',
        ];
    }
}
