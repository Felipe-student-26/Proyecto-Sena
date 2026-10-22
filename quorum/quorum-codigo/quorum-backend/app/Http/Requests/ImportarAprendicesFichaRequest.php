<?php

namespace App\Http\Requests;

use App\Models\FichaCaracterizacion;
use Illuminate\Foundation\Http\FormRequest;

class ImportarAprendicesFichaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $ficha = $this->route('ficha');

        return $ficha instanceof FichaCaracterizacion
            && ($this->user()?->can('importarAprendices', $ficha) ?? false);
    }

    public function rules(): array
    {
        return [
            'archivo' => ['required', 'file', 'mimes:xlsx,xls', 'max:10240'],
        ];
    }

    public function attributes(): array
    {
        return [
            'archivo' => 'archivo Excel',
        ];
    }
}
