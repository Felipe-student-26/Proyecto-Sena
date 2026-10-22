<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// PRD §5 incluye explícitamente este trigger para garantizar que
// solo pueda existir UN gestor activo por ficha en la tabla ficha_instructor
// Se usa como red de seguridad en la base de datos además de la validación en PHP
return new class extends Migration
{
    public function up(): void
    {
        // Los triggers con SIGNAL SQLSTATE son exclusivos de MySQL; en SQLite (entorno de tests) se omiten
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        // Eliminar si existe (por si se ejecuta migrate:refresh)
        DB::unprepared('DROP TRIGGER IF EXISTS trg_un_gestor_por_ficha');

        // Trigger BEFORE INSERT: bloquea si ya hay un gestor activo para esa ficha
        DB::unprepared("
            CREATE TRIGGER trg_un_gestor_por_ficha
            BEFORE INSERT ON ficha_instructor
            FOR EACH ROW
            BEGIN
                IF NEW.es_gestor = 1 THEN
                    IF EXISTS (
                        SELECT 1 FROM ficha_instructor
                        WHERE ficha_id = NEW.ficha_id
                          AND es_gestor = 1
                          AND activo    = 1
                    ) THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Esta ficha ya tiene un Gestor de Grupo asignado.';
                    END IF;
                END IF;
            END
        ");

        // Trigger BEFORE UPDATE: bloquea si otro registro ya es gestor activo al intentar actualizar
        DB::unprepared('DROP TRIGGER IF EXISTS trg_un_gestor_por_ficha_update');

        DB::unprepared("
            CREATE TRIGGER trg_un_gestor_por_ficha_update
            BEFORE UPDATE ON ficha_instructor
            FOR EACH ROW
            BEGIN
                IF NEW.es_gestor = 1 AND (OLD.es_gestor = 0 OR OLD.activo = 0) THEN
                    IF EXISTS (
                        SELECT 1 FROM ficha_instructor
                        WHERE ficha_id = NEW.ficha_id
                          AND es_gestor = 1
                          AND activo    = 1
                          AND id        != NEW.id
                    ) THEN
                        SIGNAL SQLSTATE '45000'
                        SET MESSAGE_TEXT = 'Esta ficha ya tiene un Gestor de Grupo asignado.';
                    END IF;
                END IF;
            END
        ");
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') {
            return;
        }

        DB::unprepared('DROP TRIGGER IF EXISTS trg_un_gestor_por_ficha');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_un_gestor_por_ficha_update');
    }
};
