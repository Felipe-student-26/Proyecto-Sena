<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegistroAsistencia extends Model
{
    protected $table = 'registros_asistencia';
    public $timestamps = false;

    protected $fillable = [
        'sesion_id',
        'aprendiz_id',
        'tipo',
        'horas_inasistencia',
        'excusa_motivo',
        'excusa_evidencia_path',
        'excusa_evidencia_nombre_original',
        'activo',
    ];

    // El registro pertenece a una sesión
    public function sesion(): BelongsTo
    {
        return $this->belongsTo(Sesion::class, 'sesion_id');
    }

    // El aprendiz al que corresponde este registro
    public function aprendiz(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'aprendiz_id');
    }

    // El historial de modificaciones a este registro (auditoría)
    public function backups(): HasMany
    {
        return $this->hasMany(RegistroAsistenciaBackup::class, 'registro_asistencia_id');
    }

    // Scope para registros activos (no eliminados logicamente)
    public function scopeActivos($query)
    {
        return $query->where('activo', 1);
    }
}
