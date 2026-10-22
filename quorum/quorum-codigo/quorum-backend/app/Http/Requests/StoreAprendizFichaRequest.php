<?php

namespace App\Http\Requests;

use App\Models\FichaCaracterizacion;
use Illuminate\Foundation\Http\FormRequest;

class StoreAprendizFichaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $ficha = $this->route('ficha');

        return $ficha instanceof FichaCaracterizacion
            && ($this->user()?->can('crearAprendiz', $ficha) ?? false);
    }

    public function rules(): array
    {
        return [
            'nombre'    => ['required', 'string', 'max:120'],
            'apellido'  => ['required', 'string', 'max:120'],
            'documento' => ['required', 'string', 'max:20'],
            'correo'    => ['required', 'string', 'email', 'max:255'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre'    => 'nombre',
            'apellido'  => 'apellido',
            'documento' => 'cédula',
            'correo'    => 'correo',
        ];
    }
}
