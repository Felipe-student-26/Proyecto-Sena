// Tipos relacionados con los usuarios del sistema QUORUM
// Cubre todos los roles: admin, coordinador, instructor, gestor_grupo, aprendiz

// Roles disponibles en el sistema
export type RolUsuario =
  | "admin"
  | "coordinador"
  | "instructor"
  | "gestor_grupo"
  | "aprendiz";

// Interfaz principal del usuario (refleja la tabla `usuarios` en la BD)
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  // Cédula — también sirve como credencial del aprendiz
  documento: string;
  correo: string;
  // Los aprendices no tienen contraseña (null en la BD)
  password?: string | null;
  rol: RolUsuario;
  // 1 = activo, 0 = desactivado
  activo: number;
  // Solo para aprendices: a qué ficha pertenecen
  ficha_id?: number | null;
  // Secreto para autenticación de dos factores (2FA)
  totp_secret?: string | null;
  // 0 = no configurado, 1 = ya tiene 2FA activo
  totp_verificado?: number;
  // Color hexadecimal del círculo de iniciales del avatar
  avatar_color?: string;
  creado_en?: string;
  actualizado_en?: string;
}

// Datos que se muestran en la sesión activa del usuario logueado
export interface UsuarioSesion {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  documento: string;
  rol: RolUsuario;
  activo: number;
  ficha_id?: number | null;
  avatar_color?: string;
  totp_verificado?: number;
}

// Datos para crear o editar un usuario (formulario del admin)
export interface FormularioUsuario {
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  password?: string;
  rol: RolUsuario;
  ficha_id?: number | null;
}

/** Fila del listado de usuarios (respuesta API Módulo 6) */
export interface UsuarioListado {
  id: number;
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  rol: RolUsuario;
  activo: number;
  ficha_id?: number | null;
  totp_verificado?: number;
  creado_en?: string;
  actualizado_en?: string;
}

/** Paginación Laravel para /api/usuarios */
export interface PaginacionUsuarios {
  data: UsuarioListado[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

/** Cuerpo POST crear usuario */
export interface PayloadCrearUsuario {
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  rol: RolUsuario;
  password?: string;
  ficha_id?: number | null;
}

/** Cuerpo PUT actualizar usuario */
export interface PayloadActualizarUsuario {
  nombre: string;
  apellido: string;
  documento: string;
  correo: string;
  rol: RolUsuario;
  password?: string | null;
  ficha_id?: number | null;
}
