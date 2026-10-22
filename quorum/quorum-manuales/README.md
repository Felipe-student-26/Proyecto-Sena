# QUORUM — Manual y presentación

Carpeta **estática** (HTML + assets) para compartir la presentación comercial y los manuales de usuario y técnico. No requiere Node ni PHP para visualizarla.

## Cómo abrir

1. Abre `index.html` (redirige a `ventas.html`) o cualquier página listada abajo.
2. Si el navegador bloquea recursos con `file://`, sirve la carpeta localmente:

```bash
python -m http.server 8080
```

Luego visita `http://localhost:8080`.

## Contenido

| Archivo | Descripción |
|---------|-------------|
| `ventas.html` | Presentación comercial |
| `producto.html` | Ficha del producto y arquitectura |
| `manual.html` | Índice de manuales |
| `manual-usuario.html` | Uso de la aplicación por rol |
| `manual-tecnico.html` | Instalación, API, variables de entorno |
| `LEEME.txt` | Instrucciones para comprimir y compartir el paquete |

## Aplicación real

Para ejecutar QUORUM (Next.js + Laravel + MySQL), usa el repositorio completo (`quorum-frontend`, `quorum-backend`) y sigue la sección **Instalación** de `manual-tecnico.html` o el `README.md` de la raíz del proyecto.

## Sincronización con el código

Mantener alineados con el repositorio:

- Créditos del footer: `assets/docs.js` ↔ `quorum-frontend/lib/quorumCreditos.ts`
- Wordmark: `assets/wordmark-quorum.png` ↔ `quorum-frontend/public/branding/wordmark_quorum.png`
