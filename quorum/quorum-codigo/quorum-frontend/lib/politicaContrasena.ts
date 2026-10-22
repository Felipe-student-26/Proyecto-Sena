// Política de contraseñas PRD §14.2 — reutilizable en reset y módulo usuarios

export interface RequisitoContrasena {
  id: string;
  texto: string;
  cumple: (p: string) => boolean;
}

export const REQUISITOS_CONTRASENA: RequisitoContrasena[] = [
  {
    id: "longitud",
    texto: "Mínimo 8 caracteres",
    cumple: (p: string) => p.length >= 8,
  },
  {
    id: "mayuscula",
    texto: "Al menos 1 mayúscula",
    cumple: (p: string) => /[A-Z]/.test(p),
  },
  {
    id: "numero",
    texto: "Al menos 1 número",
    cumple: (p: string) => /[0-9]/.test(p),
  },
  {
    id: "especial",
    texto: "Al menos 1 carácter especial",
    cumple: (p: string) => /[\W_]/.test(p),
  },
];

/** Indica si la contraseña cumple todos los requisitos */
export function contrasenaCumplePolitica(password: string): boolean {
  return REQUISITOS_CONTRASENA.every((r) => r.cumple(password));
}
