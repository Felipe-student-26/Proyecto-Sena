// Tipos de autenticación del sistema QUORUM
// Usados en el hook useAuth, el contexto y los servicios de login

import type { RolUsuario } from "./usuario";

// Usuario que devuelve el backend después de un login exitoso o al llamar /api/auth/me
export interface UsuarioAuth {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  documento?: string;
  rol: RolUsuario;
  activo?: number;
  ficha_id?: number | null;
  avatar_color?: string;
  // Fecha de alta en el sistema (ISO o string desde Laravel)
  creado_en?: string | null;
  // true si ya tiene secreto verificado en BD (no implica sesión 2FA completa)
  totp_configurado?: boolean;
}

// Datos que envía el formulario de login para staff (admin, coordinador, instructor, gestor_grupo)
export interface LoginStaffPayload {
  correo: string;
  password: string;
}

// Respuesta del backend al hacer login exitoso
export interface RespuestaLogin {
  usuario: UsuarioAuth;
  totp_sesion_completa: boolean;
  /** Nombre del sistema para el headbar (opcional en respuestas antiguas) */
  nombre_sistema?: string;
}

// Respuesta de GET /api/auth/me
export interface RespuestaMe {
  usuario: UsuarioAuth;
  totp_sesion_completa: boolean;
  nombre_sistema: string;
}
