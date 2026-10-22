<?php

namespace Database\Seeders;

use App\Models\Usuario;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

// Usuarios de prueba — basados en PRD §5 / §22; admin e instructor usan Gmail real para pruebas (M2)
// Contraseña staff: Admin123!
class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        // Admin del sistema — correo Gmail para pruebas de recuperación de contraseña (M2)
        Usuario::create([
            'nombre'       => 'José Germán',
            'apellido'     => 'Estrada Clavijo',
            'documento'    => '12345678',
            'correo'       => 'andresfelipeorozcopiedrahita@gmail.com',
            'password'     => Hash::make('Admin123!'),
            'rol'          => 'admin',
            'activo'       => 1,
            'avatar_color' => '#7B1FA2',
        ]);

        // Coordinador académico — Santiago Becerra Henao
        Usuario::create([
            'nombre'       => 'Santiago',
            'apellido'     => 'Becerra Henao',
            'documento'    => '87654321',
            'correo'       => 'sbecerra@sena.edu.co',
            'password'     => Hash::make('Admin123!'),
            'rol'          => 'coordinador',
            'activo'       => 1,
            'avatar_color' => '#1565C0',
        ]);

        // Instructor — Carlos López Martínez (Gmail de pruebas para M2 / correo real)
        Usuario::create([
            'nombre'       => 'Carlos',
            'apellido'     => 'López Martínez',
            'documento'    => '11111111',
            'correo'       => 'documentosorozco25@gmail.com',
            'password'     => Hash::make('Admin123!'),
            'rol'          => 'instructor',
            'activo'       => 1,
            'avatar_color' => '#2E7D22',
        ]);

        // Gestor de Grupo — María Gómez Torres
        // Rol especial: instructor asignado como gestor de una ficha
        Usuario::create([
            'nombre'       => 'María',
            'apellido'     => 'Gómez Torres',
            'documento'    => '22222222',
            'correo'       => 'mgomez@sena.edu.co',
            'password'     => Hash::make('Admin123!'),
            'rol'          => 'gestor_grupo',
            'activo'       => 1,
            'avatar_color' => '#3DAE2B',
        ]);

        // Aprendiz — Andrés Felipe Orozco Piedrahita
        // Login unificado: correo + contraseña (documento como clave de prueba)
        Usuario::create([
            'nombre'       => 'Andrés Felipe',
            'apellido'     => 'Orozco Piedrahita',
            'documento'    => '33333333',
            'correo'       => 'andres@aprendiz.sena.edu.co',
            'password'     => Hash::make('33333333'),
            'rol'          => 'aprendiz',
            'activo'       => 1,
            'avatar_color' => '#616161',
        ]);
    }
}
