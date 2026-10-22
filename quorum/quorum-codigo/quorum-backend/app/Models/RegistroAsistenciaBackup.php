<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Tabla de auditoría — guarda el estado antes y después de cada modificación
// a un registro de asistencia. No usa FK referenciales para no bloquear borrados
class RegistroAsistenciaBackup extends Model
{
    protected $table = 'registros_asistencia_backup';
    public $timestamps = false;

    protected $fillable = [
        'registro_asistencia_id',
        'sesion_id',
        'aprendiz_id',
        'tipo_anterior',
        'horas_inasistencia_ant',
        'tipo_nuevo',
        'horas_inasistencia_new',
        'modificado_por',
        'razon',
    ];

    // Relación opcional al registro original (puede no existir si fue borrado)
    public function registroOriginal(): BelongsTo
    {
        return $this->belongsTo(RegistroAsistencia::class, 'registro_asistencia_id');
    }

    // La sesión a la que pertenece este backup
    public function sesion(): BelongsTo
    {
        return $this->belongsTo(Sesion::class, 'sesion_id');
    }

    // El aprendiz del registro original
    public function aprendiz(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'aprendiz_id');
    }

    // El instructor o admin que realizó el cambio
    public function modificadoPor(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'modificado_por');
    }
}
