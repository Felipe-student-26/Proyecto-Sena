// Middleware de Next.js — protege las rutas del grupo (dashboard)
// Solo la cookie de sesión de Laravel indica que hay login (no XSRF-TOKEN solo)

import { NextRequest, NextResponse } from "next/server";

// Debe coincidir con SESSION_COOKIE en Laravel o con slug(APP_NAME)+'-session' (p. ej. quorum-session)
const SESSION_COOKIE =
  process.env.NEXT_PUBLIC_SESSION_COOKIE ?? "quorum-session";

// Rutas que requieren sesión activa
const RUTAS_PROTEGIDAS = [
  "/dashboard",
  "/fichas",
  "/asistencia",
  "/mi-historial",
  "/usuarios",
  "/perfil",
  "/configuracion",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Solo la cookie de sesión del backend cuenta como "logueado" para esta capa
  const tieneSession = request.cookies.has(SESSION_COOKIE);

  const esRutaProtegida = RUTAS_PROTEGIDAS.some((ruta) =>
    pathname.startsWith(ruta)
  );

  if (esRutaProtegida && !tieneSession) {
    const urlLogin = new URL("/login", request.url);
    urlLogin.searchParams.set("redirigir", pathname);
    return NextResponse.redirect(urlLogin);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/fichas/:path*",
    "/asistencia/:path*",
    "/mi-historial/:path*",
    "/usuarios/:path*",
    "/perfil/:path*",
    "/configuracion/:path*",
  ],
};
