// Cambio de contraseña desde el perfil — Módulo 13
import api from "./api";

async function obtenerCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

export interface PayloadCambiarContrasena {
  password_actual: string;
  password: string;
  password_confirmation: string;
}

/** Envía el PATCH al backend; lanza axios error con response.data en 422 */
export async function cambiarContrasenaPerfil(
  payload: PayloadCambiarContrasena
): Promise<{ message: string }> {
  await obtenerCsrf();
  const respuesta = await api.patch<{ message: string }>(
    "/api/perfil/contrasena",
    payload
  );
  return respuesta.data;
}
