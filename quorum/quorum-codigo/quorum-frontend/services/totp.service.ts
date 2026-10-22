// Llamadas API para TOTP (2FA) — requiere sesión staff y cookie CSRF en POST

import api from "./api";

export interface DatosPreparar2FA {
  otpauth_url: string;
  secreto_manual: string;
}

async function asegurarCsrf(): Promise<void> {
  await api.get("/sanctum/csrf-cookie");
}

/** Primera fase: obtiene URL otpauth y secreto para mostrar QR */
export async function prepararConfiguracion2FA(): Promise<DatosPreparar2FA> {
  await asegurarCsrf();
  const respuesta = await api.post<DatosPreparar2FA>(
    "/api/auth/2fa/configurar",
    {}
  );
  return respuesta.data;
}

/** Confirma el código y activa totp_verificado en el servidor */
export async function activarConfiguracion2FA(codigo: string): Promise<void> {
  await asegurarCsrf();
  await api.post("/api/auth/2fa/configurar", { codigo });
}

/** Código TOTP en cada inicio de sesión (usuario ya tenía 2FA) */
export async function verificarCodigo2FA(codigo: string): Promise<void> {
  await asegurarCsrf();
  await api.post("/api/auth/2fa/verificar", { codigo });
}
