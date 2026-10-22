<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Corrección de una fila de asistencia (auditoría en backup); multipart opcional para evidencia de excusa
class ActualizarRegistroAsistenciaRequest extends FormRequest
{
    private const MAX_EVIDENCIA_KB = 10240; // 10 MB

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'tipo'               => ['required', 'string', 'in:presente,falla,excusa,parcial'],
            'horas_inasistencia' => ['nullable', 'integer', 'min:1'],
            'razon'              => ['nullable', 'string', 'max:255'],
            'excusa_motivo'      => ['nullable', 'string', 'max:500'],
            'evidencia'          => ['nullable', 'file', 'max:'.self::MAX_EVIDENCIA_KB, 'mimes:jpeg,jpg,png,gif,webp,pdf,doc,docx'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'evidencia.max' => 'La evidencia no puede superar 10 MB. Comprime el PDF o sube un archivo más pequeño.',
            'evidencia.mimes' => 'La evidencia debe ser imagen (JPEG, PNG, GIF, WebP), PDF o Word (.doc/.docx).',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $tipo = $this->input('tipo');
            if ($tipo === 'excusa') {
                $motivo = trim((string) ($this->input('excusa_motivo') ?? ''));
                if ($motivo === '') {
                    $validator->errors()->add('excusa_motivo', 'El motivo de la excusa es obligatorio.');
                }
            }
        });
    }
}
