<?php

namespace App\Http\Requests;

use App\Models\FichaCaracterizacion;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AsignarInstructorFichaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $ficha = $this->route('ficha');

        return $ficha instanceof FichaCaracterizacion
            && ($this->user()?->can('asignarInstructores', $ficha) ?? false);
    }

    public function rules(): array
    {
        return [
            'usuario_id' => ['required', 'integer', 'exists:usuarios,id'],
            'accion'     => ['required', Rule::in(['asignar', 'desasignar', 'toggle_gestor'])],
            'es_gestor'  => ['sometimes', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'usuario_id' => 'instructor',
            'accion'     => 'acción',
        ];
    }
}
