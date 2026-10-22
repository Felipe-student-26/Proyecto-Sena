// Configuración central de axios para comunicarse con el backend Laravel
// Todas las peticiones al API pasan por esta instancia
import axios from "axios";

// Creamos una instancia de axios con la URL base del backend
const api = axios.create({
  baseURL: "http://localhost:8000",
  // withCredentials permite enviar las cookies de sesión de Sanctum
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Interceptor para agregar el token CSRF de Sanctum en cada petición que modifica datos
api.interceptors.request.use((config) => {
  // Obtenemos el token XSRF-TOKEN de las cookies y lo enviamos como header
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="))
    ?.split("=")[1];

  if (token) {
    config.headers["X-XSRF-TOKEN"] = decodeURIComponent(token);
  }

  // FormData: el navegador debe enviar multipart/form-data con boundary.
  // El default application/json hace que Laravel no reciba el archivo (validation.required).
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

/** En estas rutas un 401 (p. ej. GET /api/auth/me sin cookie) es normal — no forzar login. */
function esRutaAuthInvitado(pathname: string): boolean {
  const prefijos = ["/login", "/recuperar", "/reset"];
  return prefijos.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

// Interceptor para manejar errores globales de autenticación
api.interceptors.response.use(
  // Si la respuesta es exitosa, la devolvemos tal cual
  (response) => response,
  (error) => {
    // Si el servidor responde con 401, el usuario no tiene sesión activa
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        const pathname = window.location.pathname;
        const skipRedirect = esRutaAuthInvitado(pathname);
        // Solo forzamos login en rutas del panel; en login/recuperar/reset el 401 es esperado
        if (!skipRedirect) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
