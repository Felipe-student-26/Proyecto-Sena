<?php

namespace App\Http\Requests;

use App\Models\Usuario;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

// Validación al editar usuario — Módulo 6
class UpdateUsuarioRequest extends FormRequest
{
    public function authorize(): bool
    {
        $modelo = $this->route('usuario');

        return $modelo instanceof Usuario
            && ($this->user()?->can('update', $modelo) ?? false);
    }

    public function prepareForValidation(): void
    {
        if ($this->has('password') && $this->input('password') === '') {
            $this->merge(['password' => null]);
        }
    }

    public function rules(): array
    {
        $roles = ['admin', 'coordinador', 'instructor', 'gestor_grupo', 'aprendiz'];
        /** @var Usuario $usuario */
        $usuario = $this->route('usuario');

        return [
            'nombre'    => ['required', 'string', 'max:100'],
            'apellido'  => ['required', 'string', 'max:100'],
            'documento' => [
                'required',
                'string',
                'max:20',
                Rule::unique('usuarios', 'documento')->ignore($usuario->id),
            ],
            'correo' => [
                'required',
                'email',
                'max:150',
                Rule::unique('usuarios', 'correo')->ignore($usuario->id),
            ],
            'rol' => ['required', Rule::in($roles)],
            'password' => [
                'nullable',
                'string',
                'min:8',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[\W_]/',
            ],
            'ficha_id' => [
                Rule::requiredIf(fn () => ($this->input('rol') ?? '') === 'aprendiz'),
                'nullable',
                'integer',
                Rule::exists('fichas_caracterizacion', 'id')->where('activo', 1),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required'    => 'El nombre es obligatorio.',
            'apellido.required'  => 'El apellido es obligatorio.',
            'documento.required' => 'El documento es obligatorio.',
            'documento.unique'   => 'Este documento ya está registrado.',
            'correo.required'    => 'El correo es obligatorio.',
            'correo.email'       => 'El correo no es válido.',
            'correo.unique'      => 'Este correo ya está registrado.',
            'rol.required'       => 'El rol es obligatorio.',
            'rol.in'             => 'El rol seleccionado no es válido.',
            'password.min'       => 'La contraseña debe tener al menos 8 caracteres.',
            'password.regex'     => 'La contraseña debe tener al menos 1 mayúscula, 1 número y 1 carácter especial.',
            'ficha_id.required'  => 'Debes elegir una ficha para el aprendiz.',
            'ficha_id.exists'    => 'La ficha no existe o está inactiva.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            if (($this->input('rol') ?? '') === 'aprendiz' && $this->filled('password')) {
                $v->errors()->add('password', 'Los aprendices no usan contraseña en el sistema.');
            }
        });
    }
}
