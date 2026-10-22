<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

// Cierre de asistencia: un registro por aprendiz (JSON o multipart con evidencias)
class GuardarAsistenciaRequest extends FormRequest
{
    /** Tamaño máximo por archivo de evidencia (kilobytes). Debe alinearse con upload_max_filesize / post_max_size en PHP. */
    private const MAX_EVIDENCIA_KB = 10240; // 10 MB

    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    protected function prepareForValidation(): void
    {
        $raw = $this->input('registros');
        if (is_string($raw)) {
            $decoded = json_decode($raw, true);
            if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                $this->merge(['registros' => $decoded]);
            }
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'registros'                      => ['required', 'array', 'min:1'],
            'registros.*.aprendiz_id'        => ['required', 'integer', 'exists:usuarios,id'],
            'registros.*.tipo'               => ['required', 'string', 'in:presente,falla,excusa,parcial'],
            'registros.*.horas_inasistencia' => ['nullable', 'integer', 'min:1'],
            'registros.*.excusa_motivo'      => ['nullable', 'string', 'max:500'],
            'evidencias'                     => ['sometimes', 'array'],
            'evidencias.*'                   => ['nullable', 'file', 'max:'.self::MAX_EVIDENCIA_KB, 'mimes:jpeg,jpg,png,gif,webp,pdf,doc,docx'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'evidencias.*.max' => 'La evidencia no puede superar 10 MB. Comprime el PDF o sube un archivo más pequeño.',
            'evidencias.*.mimes' => 'La evidencia debe ser imagen (JPEG, PNG, GIF, WebP), PDF o Word (.doc/.docx).',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $registros = $this->input('registros', []);
            if (! is_array($registros)) {
                return;
            }
            foreach ($registros as $i => $row) {
                if (! is_array($row)) {
                    continue;
                }
                if (($row['tipo'] ?? '') === 'excusa') {
                    $motivo = trim((string) ($row['excusa_motivo'] ?? ''));
                    if ($motivo === '') {
                        $validator->errors()->add(
                            "registros.$i.excusa_motivo",
                            'El motivo de la excusa es obligatorio.'
                        );
                    }
                }
            }

            /** @var array<int|string, \Illuminate\Http\UploadedFile|null> $evidencias */
            $evidencias = $this->file('evidencias', []);
            if (! is_array($evidencias)) {
                return;
            }
            foreach ($evidencias as $aprendizId => $file) {
                if ($file === null) {
                    continue;
                }
                $ok = false;
                foreach ($registros as $row) {
                    if (! is_array($row)) {
                        continue;
                    }
                    if ((int) ($row['aprendiz_id'] ?? 0) === (int) $aprendizId && ($row['tipo'] ?? '') === 'excusa') {
                        $ok = true;
                        break;
                    }
                }
                if (! $ok) {
                    $validator->errors()->add(
                        'evidencias.'.$aprendizId,
                        'Solo se puede adjuntar evidencia cuando la asistencia es excusa para ese aprendiz.'
                    );
                }
            }
        });
    }
}
