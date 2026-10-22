<?php

namespace App\Http\Requests;

use App\Models\FichaCaracterizacion;
use App\Models\Usuario;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateFichaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $ficha = $this->route('ficha');

        return $ficha instanceof FichaCaracterizacion
            && ($this->user()?->can('update', $ficha) ?? false);
    }

    public function rules(): array
    {
        $fichaId = $this->route('ficha');
        $id      = $fichaId instanceof FichaCaracterizacion ? $fichaId->id : (int) $fichaId;

        $tiposJornada = ['mañana', 'tarde', 'noche', 'fin_de_semana'];
        $dias         = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];

        return [
            'numero_ficha'           => ['required', 'string', 'max:20', Rule::unique('fichas_caracterizacion', 'numero_ficha')->ignore($id)],
            'estado'                 => ['required', Rule::in(['activa', 'suspendida'])],
            'modalidad'              => ['nullable', Rule::in(['presencial', 'virtual'])],
            'centro_formacion_id'    => ['required', 'integer', 'exists:centros_formacion,id'],
            'programa_formacion_id'  => ['required', 'integer', 'exists:programas_formacion,id'],
            'fecha_inicio'           => ['required', 'date'],
            'fecha_fin'              => ['required', 'date', 'after_or_equal:fecha_inicio'],
            'instructores'           => ['required', 'array', 'min:1'],
            'instructores.*.usuario_id' => ['required', 'integer', 'exists:usuarios,id'],
            'instructores.*.es_gestor'  => ['required', 'boolean'],
            'jornadas'               => ['required', 'array', 'min:1'],
            'jornadas.*.tipo'        => ['required', Rule::in($tiposJornada)],
            'jornadas.*.horarios'    => ['required', 'array', 'min:1'],
            'jornadas.*.horarios.*.dia_semana'   => ['required', Rule::in($dias)],
            'jornadas.*.horarios.*.hora_inicio'  => ['required', 'date_format:H:i'],
            'jornadas.*.horarios.*.hora_fin'     => ['required', 'date_format:H:i'],
            'jornadas.*.horarios.*.instructor_id' => ['required', 'integer', 'exists:usuarios,id'],
        ];
    }

    public function attributes(): array
    {
        return (new StoreFichaRequest)->attributes();
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            if ($v->errors()->isNotEmpty()) {
                return;
            }

            $instructores = collect($this->input('instructores', []));
            $gestores     = $instructores->filter(function ($row) {
                $g = $row['es_gestor'] ?? false;

                return $g === true || $g === 1 || $g === '1';
            })->count();
            if ($gestores !== 1) {
                $v->errors()->add('instructores', 'Debe haber exactamente un Gestor de Grupo (es_gestor = true) en la lista de instructores.');

                return;
            }

            $idsInstructores = $instructores->pluck('usuario_id')->map(fn ($id) => (int) $id)->unique()->values();
            $usuarios        = Usuario::query()->whereIn('id', $idsInstructores)->get()->keyBy('id');
            foreach ($idsInstructores as $uid) {
                $u = $usuarios->get($uid);
                if (! $u || ! in_array($u->rol, ['instructor', 'gestor_grupo'], true) || ! (int) $u->activo) {
                    $v->errors()->add('instructores', "El usuario #{$uid} no es un instructor o gestor activo.");

                    return;
                }
            }

            foreach ($this->input('jornadas', []) as $ji => $jornada) {
                foreach ($jornada['horarios'] ?? [] as $hi => $hor) {
                    $insId = (int) ($hor['instructor_id'] ?? 0);
                    if (! $idsInstructores->contains($insId)) {
                        $v->errors()->add("jornadas.$ji.horarios.$hi.instructor_id", 'Cada instructor del horario debe estar incluido en la lista de instructores de la ficha.');

                        return;
                    }
                    $ini = $hor['hora_inicio'] ?? '';
                    $fin = $hor['hora_fin'] ?? '';
                    if ($ini && $fin && $ini >= $fin) {
                        $v->errors()->add("jornadas.$ji.horarios.$hi.hora_fin", 'La hora de fin debe ser posterior a la hora de inicio.');

                        return;
                    }
                }
            }

            $tipos = collect($this->input('jornadas', []))->pluck('tipo');
            if ($tipos->count() !== $tipos->unique()->count()) {
                $v->errors()->add('jornadas', 'No puede repetir el mismo tipo de jornada (mañana, tarde, etc.) en una sola ficha.');
            }

            foreach ($this->input('jornadas', []) as $ji => $jornada) {
                $dias = collect($jornada['horarios'] ?? [])->pluck('dia_semana');
                if ($dias->count() !== $dias->unique()->count()) {
                    $v->errors()->add("jornadas.$ji.horarios", 'No puede repetir el mismo día de la semana dentro de una misma jornada.');
                }
            }
        });
    }
}
