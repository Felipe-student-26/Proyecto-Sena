// Servicio de autenticación — todas las llamadas al API de auth pasan por aquí
// Antes de cada POST que modifica estado, se solicita la cookie CSRF de Sanctum

import api from "./api";
import type {
  LoginStaffPayload,
  RespuestaLogin,
  RespuestaMe,
} from "../types/auth";

// Solicita la cookie CSRF de Sanctum — obligatorio antes de POST de login
// Sanctum stateful SPA requiere este paso para evitar errores 419
async function obtenerCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

// Login para staff: admin, coordinador, instructor, gestor_grupo
// Devuelve los datos del usuario autenticado
export async function loginStaff(datos: LoginStaffPayload): Promise<RespuestaLogin> {
  await obtenerCsrf();
  const respuesta = await api.post<RespuestaLogin>("/api/auth/login", datos);
  return respuesta.data;
}

// Cierra la sesión del usuario actual
export async function logout(): Promise<void> {
  await api.post("/api/auth/logout");
}

// Solicita el envío del correo de recuperación de contraseña
// Siempre devuelve mensaje genérico — no revela si el correo existe
export async function solicitarReset(correo: string): Promise<void> {
  await obtenerCsrf();
  await api.post("/api/auth/recuperar", { correo });
}

// Procesa el cambio de contraseña con el token recibido por correo
export async function procesarReset(
  token: string,
  password: string,
  password_confirmation: string
): Promise<void> {
  await obtenerCsrf();
  await api.post("/api/auth/reset", { token, password, password_confirmation });
}

// Obtiene el usuario actualmente autenticado desde el backend
// Si no hay sesión activa, lanza error 401 (interceptado en api.ts)
export async function getMe(): Promise<RespuestaMe> {
  const respuesta = await api.get<RespuestaMe>("/api/auth/me");
  return respuesta.data;
}
